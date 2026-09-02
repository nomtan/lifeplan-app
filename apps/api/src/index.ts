import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "lifeplan-api",
  }),
);

export default app;
