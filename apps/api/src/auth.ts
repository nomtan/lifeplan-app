import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { sendAuthMail } from "./email";
import type { Env } from "./env";

function isTrustedMobileOrigin(origin: string) {
  return origin.startsWith("lifeplan://") || origin.startsWith("exp://");
}

export function createAuth(env: Env, waitUntil?: (promise: Promise<unknown>) => void) {
  const defaultTrustedOrigins = [
    env.WEB_ORIGIN,
    env.MOBILE_SCHEME ?? "lifeplan://",
    "https://appleid.apple.com",
  ];

  const socialProviders = {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: env.APPLE_CLIENT_ID,
            clientSecret: env.APPLE_CLIENT_SECRET,
            appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
          },
        }
      : {}),
  };

  return betterAuth({
    database: env.DB,
    account: {
      identityStrategy: "provider-id",
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: async (request) => {
      if (!request) return defaultTrustedOrigins;

      const origin = request.headers.get("origin");
      if (origin && isTrustedMobileOrigin(origin)) {
        return [...defaultTrustedOrigins, origin];
      }

      return defaultTrustedOrigins;
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        const task = sendAuthMail(env, {
          to: user.email,
          subject: "パスワードを再設定してください",
          actionLabel: "パスワードを再設定する",
          url,
        });
        waitUntil ? waitUntil(task) : await task;
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        const task = sendAuthMail(env, {
          to: user.email,
          subject: "メールアドレスを確認してください",
          actionLabel: "メールアドレスを確認する",
          url,
        });
        waitUntil ? waitUntil(task) : await task;
      },
    },
    socialProviders,
    plugins: [expo()],
  });
}
