# Operations & Monitoring

## Deploy Targets

- **Vercel** (primary): Next.js app + serverless API routes
- **Cloudflare Pages/Workers** (optional): same repo
- **microCMS**: content editing + Webhook → `/api/revalidate`

## Environments

| Env | Branch | Notes |
| --- | --- | --- |
| Development | `main` preview deployments | `PREVIEW_SECRET` for draft |
| Staging | `staging` | Connects to staging microCMS domain |
| Production | `production` tagged releases | GA4 + real webhook secrets |

## CI/CD

- GitHub Actions workflow (todo): `lint`, `typecheck`, `vitest`, `pnpm tsx scripts/build-sitemap.ts`, upload artifact
- Deploy on success via Vercel GitHub integration
- Daily cron: run `build-embeddings.ts` and sync to Supabase Vector / Cloudflare Vectorize

## Content Ops

1. Edit/publish in microCMS
2. Webhook `publish` hits `/api/revalidate?secret=...`
3. `body.path` / `lang` controls ISR invalidation
4. Weekly: review `last_verified_at` and flagged stale entries → UI warns if >90 days

## AI Safety

- `generateChatResponse` ensures:
  - NG words / escalation stub (TODO: integrate policy list)
  - Official links prioritized
  - Unknown → respond with "不明" + official link
- Logging: send chat failures to Sentry/Logflare (hook in `catch`)
- Rate limiting (TODO): add Ratelimit KV (Upstash/Cloudflare)

## Monitoring

- **GA4** events defined in `src/lib/tracking.ts`
- **Error Tracking**: integrate Sentry (`@sentry/nextjs`) or Logflare
- **Uptime**: ping `/api/status`
- **AI Metrics**: log `chat_message`, `chat_resolved`, `itinerary_generate` counts, track error rate, escalate if >5%

## Security

- API keys server-only, not exposed to client
- `next.config.mjs` sets CSP/HSTS/Permissions-Policy/XFO
- Rich text sanitized with `xss`
- Widget limited via `X-Frame-Options` (allow-list to add)
- Service Worker caches GET only, fallback to `/`

## Membership Sync

- Supabase に `memberships` テーブルを用意し、`google_user_id`・`stripe_customer_id` を一意に紐付ける（`last_payment_at`, `membership_expires_at` も保持）。
- 推奨スキーマ:

```sql
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  google_user_id text not null unique,
  email text not null,
  stripe_customer_id text not null unique,
  last_payment_at timestamptz not null,
  membership_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

- Googleログインは NextAuth (Google Provider) で実装。成功ページ `/billing/success` で Stripe セッションと現在のユーザーを自動リンクし、Supabase に upsert。
- Stripe Webhook (`customer.subscription.created`, `invoice.payment_succeeded`) でも `updateMembershipPeriod` を呼び出し、有効期間を最新化。
- API (`/api/ai/chat`, `/api/ai/itinerary`) は Google ログイン + HTTP-only `membership_token` クッキーの両方が揃っていることを確認し、別アカウントへのリンクは 403 を返して保護する。

## Backups

- microCMS export weekly
- Supabase vector table dump weekly
- `.env` stored in secure secret manager (1Password/GitHub Actions secrets)
