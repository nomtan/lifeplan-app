import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import type { Env } from "./env";

const app = new Hono<{ Bindings: Env }>();

type ProfileRow = {
  id: string;
  auth_user_id: string;
  display_name: string;
  birth_date: string;
  life_expectancy: number;
  created_at: string;
  updated_at: string;
};

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "lifeplan-api",
  }),
);

app.use("/api/*", async (c, next) => {
  const requestOrigin = c.req.header("Origin");
  const allowedOrigin = requestOrigin || c.env.WEB_ORIGIN;

  return cors({
    origin: allowedOrigin,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })(c, next);
});

app.get("/api/profile", async (c) => {
  const auth = createAuth(c.env, (promise) => c.executionCtx.waitUntil(promise));
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "UNAUTHORIZED" }, 401);
  }

  const profile = await c.env.DB.prepare(
    `SELECT id, auth_user_id, display_name, birth_date, life_expectancy, created_at, updated_at
     FROM profiles
     WHERE auth_user_id = ?
     LIMIT 1`,
  )
    .bind(session.user.id)
    .first<ProfileRow>();

  return c.json({ profile: profile ?? null });
});

app.post("/api/profile", async (c) => {
  const auth = createAuth(c.env, (promise) => c.executionCtx.waitUntil(promise));
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "UNAUTHORIZED" }, 401);
  }

  const body = await c.req.json<{
    displayName?: string;
    birthDate?: string;
    lifeExpectancy?: number;
  }>();

  const displayName = body.displayName?.trim();
  const birthDate = body.birthDate?.trim();
  const lifeExpectancy = Number(body.lifeExpectancy);

  if (!displayName) {
    return c.json({ error: "DISPLAY_NAME_REQUIRED" }, 400);
  }
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return c.json({ error: "INVALID_BIRTH_DATE" }, 400);
  }
  if (!Number.isInteger(lifeExpectancy) || lifeExpectancy < 1 || lifeExpectancy > 120) {
    return c.json({ error: "INVALID_LIFE_EXPECTANCY" }, 400);
  }

  const existing = await c.env.DB.prepare(
    "SELECT id FROM profiles WHERE auth_user_id = ? LIMIT 1",
  )
    .bind(session.user.id)
    .first<{ id: string }>();

  const id = existing?.id ?? crypto.randomUUID();

  if (existing) {
    await c.env.DB.prepare(
      `UPDATE profiles
       SET display_name = ?, birth_date = ?, life_expectancy = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
      .bind(displayName, birthDate, lifeExpectancy, id)
      .run();
  } else {
    await c.env.DB.prepare(
      `INSERT INTO profiles (id, auth_user_id, display_name, birth_date, life_expectancy)
       VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(id, session.user.id, displayName, birthDate, lifeExpectancy)
      .run();
  }

  const profile = await c.env.DB.prepare(
    `SELECT id, auth_user_id, display_name, birth_date, life_expectancy, created_at, updated_at
     FROM profiles
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(id)
    .first<ProfileRow>();

  return c.json({ profile });
});

app.all("/api/auth/*", (c) => {
  const auth = createAuth(c.env, (promise) => c.executionCtx.waitUntil(promise));
  return auth.handler(c.req.raw);
});

export default app;
