# Lifeplan App

人生の収支・資産推移・ライフイベントをプラン化し、実績と比較できるWeb / iOS / Androidアプリです。

## Stack

- Web: Next.js + TypeScript
- Mobile: Expo + React Native
- API: Hono on Cloudflare Workers
- Database: Cloudflare D1
- Package manager: pnpm
- Shared domain/simulation: `packages/domain`
- Auth: Clerk（導入予定）

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
2. Clerk認証
3. プランCRUD
4. 月次シミュレーションエンジン拡張
5. 年表UI
6. プラン単体グラフ
7. 全プラン比較グラフ
8. 実績入力
