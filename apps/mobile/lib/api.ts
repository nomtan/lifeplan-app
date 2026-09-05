import { authClient } from "./auth-client";

const apiBaseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const cookies = await authClient.getCookie();
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (cookies) {
    headers.set("Cookie", cookies);
  }

  const response = await fetch(`${apiBaseURL}${path}`, {
    ...init,
    headers,
    credentials: "omit",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
