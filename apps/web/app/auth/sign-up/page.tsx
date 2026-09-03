"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "../../../lib/auth-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    if (result.error) {
      setMessage(result.error.message ?? "アカウント作成に失敗しました。");
      setPending(false);
      return;
    }

    window.location.href = "/auth/verify-email";
  }

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Lifeplan</p>
        <h1 className="authTitle">アカウント作成</h1>
        <p className="authLead">
          登録後、メールアドレス確認用のメールを送信します。
        </p>

        <form className="authForm" onSubmit={onSubmit}>
          <label>
            <span>名前 / ニックネーム</span>
            <input
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>

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
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {message ? <p className="authMessage">{message}</p> : null}

          <button className="primary authSubmit" disabled={pending} type="submit">
            {pending ? "作成中…" : "アカウントを作成"}
          </button>
        </form>

        <div className="authLinks">
          <Link href="/auth/sign-in">ログインへ戻る</Link>
        </div>
      </section>
    </main>
  );
}
