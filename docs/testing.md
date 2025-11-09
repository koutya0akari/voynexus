# Testing Strategy

## Unit (Vitest)

- `lib/sanitize.ts`: XSS除去
- `lib/cms.ts`: filters/Qパラメータの組み立て (モックclientで検証)
- `lib/ai.ts`: プロンプト整形 (OpenAIモック)

Run: `pnpm test`

## Integration

| Area | Tooling | Notes |
| --- | --- | --- |
| `/api/ai/chat` | Vitest + msw | モックRAG/AIレスポンス、NGワードケース |
| `/api/pdf` | Vitest | バイナリ長と`Content-Type` |
| `/api/preview` | Next test utils | secret mismatch 401 |

## E2E (Playwright)

Scenarios (to automate under `tests/e2e`):

1. **雨天/車なし/半日で旅程生成** → PDF保存を確認
2. **英語UIで渦潮特集を閲覧** → 外部予約リンククリックでGA4イベント発火
3. **記事プレビュー→公開→Webhook再検証** → 公開ページ更新を確認
4. **施設向けウィジェット** → iframe内チャット表示、多言語切替
5. **PWAオフライン** → サービスワーカーで保存済み旅程が読める

Run: `pnpm test:e2e` (Playwright config to be added)

## Accessibility

- Use Storybook + `@storybook/addon-a11y` (TODO)
- Keyboard nav through filters, chat textarea, facility widget
- Contrast check (Tailwind tokens)

## Performance Budgets

- LCP < 2.5s (top page hero image preloading)
- CLS < 0.1 (skeleton + aspect ratio)
- TTFB < 0.8s (Edge caching, microCMS caching)

Measure via `pnpm dlx next lighthouse --url https://...`
