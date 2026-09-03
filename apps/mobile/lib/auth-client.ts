import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "lifeplan",
      storagePrefix: "lifeplan",
      storage: SecureStore,
    }),
  ],
});
