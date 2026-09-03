"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "../../../lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (result.error) {
      setMessage(result.error.message ?? "ログインに失敗しました。");
      setPending(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Lifeplan</p>
        <h1 className="authTitle">ログイン</h1>
        <p className="authLead">登録済みのメールアドレスでログインします。</p>

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

          <label>
            <span>パスワード</span>
            <input
              autoComplete="current-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {message ? <p className="authMessage">{message}</p> : null}

          <button className="primary authSubmit" disabled={pending} type="submit">
            {pending ? "ログイン中…" : "ログイン"}
          </button>
        </form>

        <div className="authLinks">
          <Link href="/auth/forgot-password">パスワードを忘れた方</Link>
          <Link href="/auth/sign-up">アカウントを作成</Link>
        </div>
      </section>
    </main>
  );
}
