import type { Env } from "./env";

type AuthMail = {
  to: string;
  subject: string;
  url: string;
  actionLabel: string;
};

export async function sendAuthMail(env: Env, mail: AuthMail) {
  const from = env.AUTH_EMAIL_FROM ?? "noreply@example.invalid";

  if (!env.EMAIL) {
    console.info("[auth-email:local]", {
      to: mail.to,
      subject: mail.subject,
      url: mail.url,
    });
    return;
  }

  await env.EMAIL.send({
    to: mail.to,
    from,
    subject: mail.subject,
    text: `${mail.subject}\n\n${mail.url}`,
    html: [
      "<p>",
      mail.subject,
      "</p>",
      `<p><a href="${mail.url}">${mail.actionLabel}</a></p>`,
    ].join(""),
  });
}
