# Lifeplan App

人生の収支・資産推移・ライフイベントをプラン化し、実績と比較できるWeb / iOS / Androidアプリです。

## Stack

- Web: Next.js + TypeScript
- Mobile: Expo + React Native
- API: Hono on Cloudflare Workers
- Database: Cloudflare D1
- Package manager: pnpm
- Shared domain/simulation: `packages/domain`
- Auth: Better Auth

## Monorepo

```
apps/
  web/      Next.js
  mobile/   Expo
  api/      Hono / Cloudflare Workers
packages/
  domain/   共通型・シミュレーションロジック
doc/        仕様書
```

## Setup

```bash
pnpm install
```

### Web

```bash
pnpm dev:web
```

### Mobile

```bash
pnpm dev:mobile
```

Expo GoまたはDevelopment Buildから確認します。

### API

```bash
pnpm dev:api
```

Health check:

```
GET /health
```

## D1

初期マイグレーション:

```
apps/api/migrations/0001_init.sql
```

Cloudflare側のD1 database / bindingはまだ未設定です。設定後にwranglerへbindingを追加します。

## Current implementation

- Webダッシュボード初期モック
- Mobileダッシュボード初期モック
- Mobile下部固定メニュー
  - ホーム
  - プラン
  - 比較
  - 実績
  - 設定
- Hono API基盤
- 共通ドメイン型
- 月次キャッシュフローから年次集計するシミュレーション骨格
- D1初期テーブル
  - users
  - plans
  - family_members
  - asset_snapshots

## Next

1. D1 binding / repository layer
2. Better Auth認証
3. プランCRUD
4. 月次シミュレーションエンジン拡張
5. 年表UI
6. プラン単体グラフ
7. 全プラン比較グラフ
8. 実績入力


## Better Auth

認証基盤はBetter Authを採用しています。

構成:

- Better Auth
- Hono / Cloudflare Workers
- Cloudflare D1
- Cloudflare Email Service
- Googleログイン
- Appleログイン
- メールアドレス + パスワード

認証APIは以下へマウントします。

```
/api/auth/*
```

Cloudflare側のD1・Email Serviceが未作成でもコード実装は進められます。
メールbindingが存在しないローカル環境では、認証メールのURLをコンソールへ出力します。

### 環境変数

`apps/api/.dev.vars.example` を `.dev.vars` にコピーし、ローカル値を設定します。

ウェブ:

```
apps/web/.env.example
```

モバイル:

```
apps/mobile/.env.example
```

### Cloudflare準備後に行うこと

1. D1 databaseを作成
2. Workerへ `DB` bindingを設定
3. Better Authのcore schemaをD1へ適用
4. Email Serviceを有効化
5. Workerへ `EMAIL` send_email bindingを設定
6. `AUTH_EMAIL_FROM` に認証済み送信元を設定
7. Google / Apple OAuth credentialsを設定
