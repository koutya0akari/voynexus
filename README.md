# voynexus Travel PWA

全国の観光情報をワンストップで届ける多言語ダッシュボード「voynexus」。microCMSで管理するコンテンツをNext.js 14 (App Router) で配信し、AIチャット・旅程生成・施設向けウィジェットを備えています。

## アーキテクチャ概要

- **Framework**: Next.js 14 + TypeScript + App Router + Server Components
- **CMS**: microCMS (`microcms-js-sdk`) 経由でSSR/ISR取得。プレビュー/再検証APIを実装
- **AI/RAG**: OpenAI (chat, itinerary) + Supabase Vector (pgvector) でRAG
- **PWA**: `manifest.webmanifest` と `public/sw.js` でオフラインキャッシュ
- **i18n**: `/[lang]` ルーティング + `next-intl` を利用
- **Tracking**: GA4イベントユーティリティ (`src/lib/tracking.ts`)
- **Facility Widget**: `public/widget.js` を貼り付けるだけでAIチャットiframeを表示

## ディレクトリ

```
src/
  app/                 # App Router (lang別レイアウト、API routes)
  components/          # UI部品 (Spots, Articles, Itineraries, Widgets, Chat)
  lib/                 # microCMS client, AI/RAG, sanitize, pdf, tracking
  locales/             # ja/en/zh の辞書
scripts/
  build-embeddings.ts  # text-embedding-3-small でRAGインデックス生成
  build-sitemap.ts     # microCMSコンテンツからsitemap.xml
  build-og.ts          # OG SVGテンプレ生成
public/
  manifest.webmanifest, sw.js, widget.js, og/default.svg, icons/*
```

## セットアップ

```bash
pnpm install
cp .env.example .env.local
# 必要に応じてcorepack enable pnpm
pnpm dev
```

### 必須環境変数

`MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MAPBOX_ACCESS_TOKEN`, `OPENWEATHER_API_KEY`, `GA_MEASUREMENT_ID`, `MEMBERSHIP_TOKEN_SECRET`, `MEMBERSHIP_TEST_TOKEN`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY` (本番), `STRIPE_TEST_SECRET_KEY` (テスト), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (詳細は `.env.example`)

> `NEXTAUTH_SECRET` は本番環境で必須です。未設定の場合は `MEMBERSHIP_TOKEN_SECRET` を代用しますが、セキュリティ上それぞれ別の値を設定することを推奨します。

AI機能はStripeサブスクリプションに加えてGoogleログイン済みであることを条件に解放されます。`pnpm dev` 前に Supabase に `memberships` テーブル（`google_user_id`, `stripe_customer_id`, `last_payment_at`, `membership_expires_at` など）を作成し、`SUPABASE_SERVICE_ROLE_KEY` を設定してください。Stripe決済完了ページ `/billing/success` ではログイン中のGoogleアカウントとStripeカスタマーIDが自動的にリンクされ、会員トークンはHTTP-onlyクッキーとして保存されます。AIチャット・旅程生成はログイン状態で `fetch(..., { credentials: "include" })` を行うだけで会員判定が通ります。ローカル開発でStripe連携をスキップしたい場合は `MEMBERSHIP_TEST_TOKEN` を設定し、`NEXT_PUBLIC_MEMBERSHIP_DEBUG=1` を付与すると管理者用の手動入力UIを表示できます。

## スクリプト

| コマンド                               | 説明                                            |
| -------------------------------------- | ----------------------------------------------- |
| `pnpm dev`                             | Next.js 開発                                    |
| `pnpm build && pnpm start`             | 本番ビルド                                      |
| `pnpm lint`, `pnpm lint:fix`           | ESLint (strict)                                 |
| `pnpm typecheck`                       | `tsc --noEmit`                                  |
| `pnpm test`, `pnpm test:watch`         | Vitest (jsdom)                                  |
| `pnpm test:e2e`                        | Playwright (シナリオは `/tests/e2e` に追加予定) |
| `pnpm format`                          | Prettier                                        |
| `pnpm analyze`                         | Bundle Analyzer                                 |
| `pnpm embeddings`                      | RAG用埋め込み出力 (`data/embeddings.json`)      |
| `pnpm sitemap`                         | `public/sitemap.xml` 生成                       |
| `pnpm og -- \"Title\" \"Description\"` | `public/og/default.svg` 更新                    |

## テスト方針

- **Unit**: `src/lib/__tests__` (例: `sanitizeRichText`)
- **Integration**: API Routes (`/api/ai/*`, `/api/pdf`) へmswを使った検証を追加予定
- **E2E**: Playwrightで旅程生成・多言語切替・プレビュー等の代表フローを自動化

## 運用メモ

- microCMS Publish/UnpublishでWebhook → `/api/revalidate?secret=...` を叩き、該当lang+pathをISR再検証
- `scripts/build-embeddings.ts` をCI/CDで日次実行し、Supabase/Cloudflare Vectorizeへ同期
- AIチャットはNGワード検知後に施設連絡先を返す実装を追加予定 (`generateChatResponse` 内でTODOコメント)
- 施設向けウィジェット: `public/widget.js` を各施設サイトに貼り付ける。許可ドメインのみ`X-Frame-Options`の例外を設定
- 課金: `/api/billing/checkout` に `customerId` または `email` をPOSTするとStripe Checkout SessionのURLを返します。`NEXT_PUBLIC_SITE_URL` を自分のドメインに設定しておくと、デフォルトの `success`/`cancel` 先も自動的に `https://<site>/billing/success?session_id={CHECKOUT_SESSION_ID}` になります。独自の `STRIPE_SUCCESS_URL` を指定する場合も `{CHECKOUT_SESSION_ID}` をクエリに含めてください。ローカルで手早く動作を確かめたい場合は `GET /api/billing/checkout?email=test@example.com` にアクセスすると即座にStripeの決済画面へリダイレクトされます。決済後は `/billing/success` で署名付きトークンが自動作成され、HTTP-onlyクッキーとローカルストレージへ保存されたのち `/members` へ遷移します。同ページでは `fetch(/api/billing/session?session_id=...)` によって `customerId`, `amountTotal`, `currency`, `lineItems` などStripeセッション情報も取得できます。AIコンシェルジュ/旅程生成はこのトークンを `Authorization: Bearer <token>` として利用します。既存会員は `/api/billing/portal` へ `customerId` を送るとStripe Billing Portalへ遷移できます。
- Webhook: `/api/stripe/webhook` をStripeの `customer.subscription.created` イベントに紐付けると、サブスク開始時に `customerId` や `lineItems` を取得できます。`STRIPE_WEBHOOK_SECRET` をセットして署名検証を有効化してください。

## 追加ドキュメント

- `docs/data-model.md`: microCMSスキーマ、バリデーション、RAG対象
- `docs/microcms-setup.md`: spots/articles/itineraries/blog の microCMS 設定と翻訳Webhook手順
- `docs/operations.md`: 運用/監視/CIフロー
- `docs/testing.md`: 受入テストとPlaywrightシナリオ
