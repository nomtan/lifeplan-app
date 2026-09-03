# Better Auth 認証実装仕様

最終更新: 2026-09-04

## 1. 採用構成

認証基盤は以下で構成する。

- Better Auth
- Cloudflare Workers
- Hono
- Cloudflare D1
- Cloudflare Email Service
- Expo
- Next.js

認証方法:

- メールアドレス + パスワード
- Googleログイン
- Appleログイン

メールアドレス登録ではメール認証を必須とする。

---

## 2. 認証API

Better AuthはHono APIへ以下のパスでマウントする。

```
/api/auth/*
```

HonoとBetter AuthはWeb標準のRequest / Responseを使用するため、Better AuthのhandlerへHonoのraw requestをそのまま渡す。

---

## 3. データベース

Better Authの認証データはCloudflare D1に保存する。

Better Authが管理する主な認証テーブル:

- user
- session
- account
- verification

アプリ固有の本人プロフィールは認証テーブルと分離して `profiles` テーブルで管理する。

`profiles.auth_user_id` にBetter Authの `user.id` を保持する。

この分離により、認証情報とライフプラン固有情報を疎結合にする。

---

## 4. メール認証

Better Authのメール認証機能を使用する。

登録時:

1. メールアドレス + パスワードで登録
2. Better Authが認証URLを生成
3. Cloudflare Email Serviceで認証メールを送信
4. ユーザーが認証URLを開く
5. メールアドレスを認証済みにする

初期版ではメール認証済みユーザーのみログイン可能とする。

---

## 5. Cloudflare Email Service

本番ではWorkersの `EMAIL` bindingを使用する。送信用サブドメインは `mail.nmtng.com`、初期送信元は `noreply@mail.nmtng.com` とする。

送信対象:

- メールアドレス確認
- パスワード再設定
- 将来的なメールアドレス変更確認

Cloudflare Email Service未設定のローカル環境では、メール送信を行わず認証URLをコンソールへ表示する。

これによりCloudflare側の設定前でも認証フローの開発を進められる。

---

## 6. ウェブ

Next.js側ではBetter Authの認証クライアントを使用する。

API URLは以下の環境変数から取得する。

```
NEXT_PUBLIC_API_BASE_URL
```

ローカル初期値:

```
http://localhost:8787
```

---

## 7. モバイル

Expo側ではBetter AuthのExpo連携を使用する。

セッション・Cookieの保存にはExpo SecureStoreを利用する。

ディープリンクscheme:

```
lifeplan://
```

API URL:

```
EXPO_PUBLIC_API_BASE_URL
```

---

## 8. Google / Appleログイン

Cloudflare側の準備とは独立してコード構造を用意する。

OAuth credentialsが設定されているプロバイダーのみ有効化する。

Google:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

Apple:

- APPLE_CLIENT_ID
- APPLE_CLIENT_SECRET
- APPLE_APP_BUNDLE_IDENTIFIER

Appleログインの本番設定ではApple Developer側のService ID / App ID / callback URL等の設定が別途必要。

---

## 9. Cloudflare準備後の作業

Cloudflare側で以下を実施する。

1. D1 databaseを作成
2. Workerへ `DB` bindingを設定
3. Better Authの認証テーブルをD1へ作成
4. アプリ固有マイグレーションを適用
5. Email Serviceを有効化
6. 送信ドメイン `mail.nmtng.com` を設定
7. Workerへ `EMAIL` bindingを設定（実装済み）
8. Better Auth secretをWorker secretとして登録
9. Google / Apple OAuth credentialsを登録
10. 本番URLをtrusted originsへ設定

---

## 10. 現在Cloudflare未準備でも進められる開発

以下は先行して実装可能。

- ログイン画面
- 新規登録画面
- メール認証待ち画面
- パスワード再設定画面
- Web認証クライアント
- Expo認証クライアント
- 認証状態による画面ガード
- プロフィール作成フロー
- API認証ミドルウェア
- プランCRUD
- シミュレーション機能

D1実接続とメール実配送だけを後から有効化する。
