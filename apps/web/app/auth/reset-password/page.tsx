"use client";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "../../../lib/auth-client";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const nextToken = params.get("token") ?? "";

    setToken(nextToken);

    if (error) {
      setMessage("再設定リンクが無効または期限切れです。");
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setPending(false);

    if (result.error) {
      setMessage(result.error.message ?? "パスワード再設定に失敗しました。");
      return;
    }

    window.location.href = "/auth/sign-in";
  }

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Lifeplan</p>
        <h1 className="authTitle">新しいパスワード</h1>

        <form className="authForm" onSubmit={onSubmit}>
          <label>
            <span>新しいパスワード</span>
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {message ? <p className="authMessage">{message}</p> : null}

          <button className="primary authSubmit" disabled={pending || !token} type="submit">
            {pending ? "更新中…" : "パスワードを更新"}
          </button>
        </form>
      </section>
    </main>
  );
}
