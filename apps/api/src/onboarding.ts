import type { Hono } from "hono";
import { createAuth } from "./auth";
import type { Env } from "./env";

type App = Hono<{ Bindings: Env }>;

type FamilyInput = {
  name?: string;
  relationship?: string;
  birthDate?: string;
  lifeExpectancy?: number;
};

type MoneyInput = {
  name?: string;
  monthlyAmount?: number;
};

async function getSessionUserId(appEnv: Env, headers: Headers, waitUntil: (promise: Promise<unknown>) => void) {
  const auth = createAuth(appEnv, waitUntil);
  const session = await auth.api.getSession({ headers });
  return session?.user.id ?? null;
}

async function getProfile(env: Env, authUserId: string) {
  return env.DB.prepare(
    "SELECT id, onboarding_completed_at FROM profiles WHERE auth_user_id = ? LIMIT 1",
  )
    .bind(authUserId)
    .first<{ id: string; onboarding_completed_at: string | null }>();
}

async function ensureDefaultPlan(env: Env, profileId: string) {
  const existing = await env.DB.prepare(
    "SELECT id, name FROM plans WHERE owner_profile_id = ? ORDER BY created_at ASC LIMIT 1",
  )
    .bind(profileId)
    .first<{ id: string; name: string }>();

  if (existing) return existing;

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO plans (id, owner_profile_id, name, status) VALUES (?, ?, ?, 'scenario')",
  )
    .bind(id, profileId, "基本プラン")
    .run();

  return { id, name: "基本プラン" };
}

export function registerOnboardingRoutes(app: App) {
  app.get("/api/onboarding", async (c) => {
    const authUserId = await getSessionUserId(
      c.env,
      c.req.raw.headers,
      (promise) => c.executionCtx.waitUntil(promise),
    );
    if (!authUserId) return c.json({ error: "UNAUTHORIZED" }, 401);

    const profile = await getProfile(c.env, authUserId);
    if (!profile) return c.json({ error: "PROFILE_REQUIRED" }, 409);

    const plan = await ensureDefaultPlan(c.env, profile.id);

    const [families, incomes, expenses] = await Promise.all([
      c.env.DB.prepare(
        `SELECT id, name, relationship, birth_date, life_expectancy
         FROM family_members WHERE plan_id = ? ORDER BY rowid ASC`,
      )
        .bind(plan.id)
        .all(),
      c.env.DB.prepare(
        `SELECT id, name, monthly_amount
         FROM plan_incomes WHERE plan_id = ? ORDER BY rowid ASC`,
      )
        .bind(plan.id)
        .all(),
      c.env.DB.prepare(
        `SELECT id, name, monthly_amount
         FROM plan_expenses WHERE plan_id = ? ORDER BY rowid ASC`,
      )
        .bind(plan.id)
        .all(),
    ]);

    return c.json({
      completed: Boolean(profile.onboarding_completed_at),
      plan,
      familyMembers: families.results,
      incomes: incomes.results,
      expenses: expenses.results,
    });
  });

  app.post("/api/onboarding/basic", async (c) => {
    const authUserId = await getSessionUserId(
      c.env,
      c.req.raw.headers,
      (promise) => c.executionCtx.waitUntil(promise),
    );
    if (!authUserId) return c.json({ error: "UNAUTHORIZED" }, 401);

    const profile = await getProfile(c.env, authUserId);
    if (!profile) return c.json({ error: "PROFILE_REQUIRED" }, 409);

    const body = await c.req.json<{
      familyMembers?: FamilyInput[];
      incomes?: MoneyInput[];
      expenses?: MoneyInput[];
    }>();

    const familyMembers = (body.familyMembers ?? []).filter((item) => item.name?.trim());
    const incomes = (body.incomes ?? []).filter((item) => item.name?.trim());
    const expenses = (body.expenses ?? []).filter((item) => item.name?.trim());

    for (const member of familyMembers) {
      const birthDate = member.birthDate?.trim() ?? "";
      const lifeExpectancy = Number(member.lifeExpectancy ?? 90);
      if (!member.relationship?.trim()) return c.json({ error: "RELATIONSHIP_REQUIRED" }, 400);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return c.json({ error: "INVALID_FAMILY_BIRTH_DATE" }, 400);
      if (!Number.isInteger(lifeExpectancy) || lifeExpectancy < 1 || lifeExpectancy > 120) {
        return c.json({ error: "INVALID_FAMILY_LIFE_EXPECTANCY" }, 400);
      }
    }

    for (const item of [...incomes, ...expenses]) {
      const amount = Number(item.monthlyAmount ?? 0);
      if (!Number.isInteger(amount) || amount < 0) {
        return c.json({ error: "INVALID_MONTHLY_AMOUNT" }, 400);
      }
    }

    const plan = await ensureDefaultPlan(c.env, profile.id);
    const statements = [
      c.env.DB.prepare("DELETE FROM family_members WHERE plan_id = ?").bind(plan.id),
      c.env.DB.prepare("DELETE FROM plan_incomes WHERE plan_id = ?").bind(plan.id),
      c.env.DB.prepare("DELETE FROM plan_expenses WHERE plan_id = ?").bind(plan.id),
      ...familyMembers.map((member) =>
        c.env.DB.prepare(
          `INSERT INTO family_members (id, plan_id, name, relationship, birth_date, life_expectancy)
           VALUES (?, ?, ?, ?, ?, ?)`,
        ).bind(
          crypto.randomUUID(),
          plan.id,
          member.name!.trim(),
          member.relationship!.trim(),
          member.birthDate!.trim(),
          Number(member.lifeExpectancy ?? 90),
        ),
      ),
      ...incomes.map((item) =>
        c.env.DB.prepare(
          `INSERT INTO plan_incomes (id, plan_id, name, monthly_amount)
           VALUES (?, ?, ?, ?)`,
        ).bind(crypto.randomUUID(), plan.id, item.name!.trim(), Number(item.monthlyAmount ?? 0)),
      ),
      ...expenses.map((item) =>
        c.env.DB.prepare(
          `INSERT INTO plan_expenses (id, plan_id, name, monthly_amount)
           VALUES (?, ?, ?, ?)`,
        ).bind(crypto.randomUUID(), plan.id, item.name!.trim(), Number(item.monthlyAmount ?? 0)),
      ),
      c.env.DB.prepare(
        "UPDATE profiles SET onboarding_completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ).bind(profile.id),
    ];

    await c.env.DB.batch(statements);

    return c.json({ ok: true, planId: plan.id, completed: true });
  });
}
