import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import type { Env } from "./env";

const app = new Hono<{ Bindings: Env }>();

function isAllowedAuthOrigin(origin: string | undefined, webOrigin: string) {
  if (!origin) return false;
  return (
    origin === webOrigin ||
    origin.startsWith("lifeplan://") ||
    origin.startsWith("exp://")
  );
}

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "lifeplan-api",
  }),
);

app.use("/api/auth/*", async (c, next) => {
  const requestOrigin = c.req.header("Origin");
  console.log("[auth-request]", {
    method: c.req.method,
    path: c.req.path,
    origin: requestOrigin ?? null,
  });

  return cors({
    origin: (origin) =>
      isAllowedAuthOrigin(origin, c.env.WEB_ORIGIN) ? origin : c.env.WEB_ORIGIN,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })(c, next);
});

app.all("/api/auth/*", (c) => {
  const auth = createAuth(c.env, (promise) => c.executionCtx.waitUntil(promise));
  return auth.handler(c.req.raw);
});

export default app;
