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

## Backups

- microCMS export weekly
- Supabase vector table dump weekly
- `.env` stored in secure secret manager (1Password/GitHub Actions secrets)
