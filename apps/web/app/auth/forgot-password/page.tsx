"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "../../../lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/auth/reset-password",
    });

    setPending(false);

    if (result.error) {
      setMessage(result.error.message ?? "再設定メールの送信に失敗しました。");
      return;
    }

    setMessage("パスワード再設定メールを送信しました。");
  }

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Lifeplan</p>
        <h1 className="authTitle">パスワード再設定</h1>
        <p className="authLead">登録済みのメールアドレスを入力してください。</p>

        <form className="authForm" onSubmit={onSubmit}>
          <label>
            <span>メールアドレス</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          {message ? <p className="authMessage">{message}</p> : null}

          <button className="primary authSubmit" disabled={pending} type="submit">
            {pending ? "送信中…" : "再設定メールを送信"}
          </button>
        </form>

        <div className="authLinks">
          <Link href="/auth/sign-in">ログインへ戻る</Link>
        </div>
      </section>
    </main>
  );
}
