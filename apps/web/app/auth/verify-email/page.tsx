import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Lifeplan</p>
        <h1 className="authTitle">メールを確認してください</h1>
        <p className="authLead">
          登録したメールアドレスへ確認メールを送信しました。
          メール内のリンクを開いて登録を完了してください。
        </p>
        <div className="authLinks">
          <Link href="/auth/sign-in">ログイン画面へ</Link>
        </div>
      </section>
    </main>
  );
}
