# Data Model (microCMS)

## Base Fields

| Field                  | Type                 | Notes                         |
| ---------------------- | -------------------- | ----------------------------- |
| `lang`                 | enum (ja/en/zh)      | 必須、URL/L10n制御            |
| `translation_group_id` | UUID                 | 各言語同一ID                  |
| `slug`                 | string               | `[a-z0-9-]+`                  |
| `title`                | string (<=80 chars)  |
| `summary`              | string (<=160 chars) |
| `og_image`             | asset                |
| `publishedAt`          | datetime             |
| `updatedAt`            | datetime             |
| `last_verified_at`     | datetime             | 編集時自動更新 (スポット/FAQ) |

## Content Types

### Spots

- `area` (select: 札幌/東京/名古屋/大阪/福岡 など主要エリア)
- `tags` (multi-select: 雨天OK/車なし/子連れ/学割/バリアフリー/屋内/自然/文化)
- `open_hours` (rich text), `closed_days`, `price`
- `required_time` (number/min)
- `access` object: `bus_line`, `stop`, `platform`, `last_bus_time`, `parking`
- `accessibility` object: `step_free`, `stroller`, `nursing_room`, `toilet`
- `official_url`, `map_link`
- `images[]` (alt必須)
- `related_spots[]` references

### Itineraries

- `audience_tags[]` (車なし/雨天/子連れ/低予算/半日/1日)
- `total_time` (min), `budget` (JPY), `season`, `transport`
- `timeline[]`: `time`, `spot_ref`, `stay_min`, `move_min`, `note`
- `alternatives[]`, `food_toilet_notes`, `warnings[]`, `links[]`, `map_link`

### Articles

- `type` (blog/guide/event)
- `body` (rich text w/ sanitize)
- `hero_image`, `author_ref`, `related[]`, `cta_links[]`

### Events

- `date_range`, `venue_map`, `ticket_info`, `traffic_notes`, `rain_policy`, `faq_refs[]`

### Facilities / FAQs / Sponsors / Globals

- Facilities: contact, reservation_url, faq_refs[], sponsor_tier
- FAQs: `facility_ref`, `question`, `answer_fixed`, `lang`, `last_verified_at`
- Sponsors: `tier`, `asset`, `destinationUrl`, `positions[]`, active period
- Globals: sns links, GA/GTM IDs, disclaimers, warning template

## Validation Tips

- `slug` required, regex `[a-z0-9-]+`
- `images[].alt` required
- `translation_group_id` required per locale entry
- `last_verified_at` auto-set on publish hooks
- `summary` <= 160 chars for SEO

## API Usage

- SDK: `microcms-js-sdk`
- Example: `filters=lang[equals]ja[and]area[equals]naruto[and]tags[contains]雨天OK`
- Search: `q="渦潮 雨"`
- Preview: `/api/preview?slug=spots/naruto...&draftKey=...`
- Revalidate webhook: `/api/revalidate?secret=...` + body `{ path: "/spots/naruto-whirlpool", lang: "ja", tags:["spots"] }`

## RAG Index

- Targets: `articles`, `itineraries`, `spots` (published only)
- Script: `pnpm tsx scripts/build-embeddings.ts`
- Storage: Supabase `vector_store` (columns: `id`, `type`, `lang`, `area`, `tags[]`, `updated_at`, `embedding`)
- Embedding model: `text-embedding-3-small`
