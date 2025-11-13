# microCMS 設定ガイド (Spots / Articles / モデルコース)

サイト上のスポット・記事・モデルコースはすべて microCMS で保存したデータを SSR/ISR で取得しています。以下を参考に API とフィールドを用意し、必要に応じて `.env` のエンドポイント名を変更してください。

## 1. API エンドポイントを用意する

| コンテンツ   | API種別 | 推奨エンドポイントID | 環境変数 (任意で変更可)         |
| ------------ | ------- | -------------------- | ------------------------------- |
| スポット     | リスト  | `spots`              | `MICROCMS_SPOTS_ENDPOINT`       |
| 記事         | リスト  | `articles`           | `MICROCMS_ARTICLES_ENDPOINT`    |
| モデルコース | リスト  | `itineraries`        | `MICROCMS_ITINERARIES_ENDPOINT` |
| ブログ       | リスト  | `blogs`              | `MICROCMS_BLOG_ENDPOINT`        |

エンドポイントIDを変更した場合は `.env.local` および本番環境の環境変数に対応する値を設定してください。

### 共通のベースフィールド

各 API に以下のフィールドを必ず追加してください。

| Field                       | Type                 | 備考                                                     |
| --------------------------- | -------------------- | -------------------------------------------------------- |
| `lang`                      | テキスト or セレクト | `ja` / `en` / `zh` を固定値として設定。公開時に必須。    |
| `translation_group_id`      | テキスト             | 同じコンテンツの多言語版を紐付ける ID。UUID などを利用。 |
| `slug`                      | テキスト             | `[a-z0-9-]+` をバリデーションに設定。                    |
| `title`                     | テキスト             | 40〜80文字目安。                                         |
| `summary`                   | テキストエリア       | 160文字以内を推奨。                                      |
| `og_image`                  | 画像                 | OG用サムネイル。                                         |
| `publishedAt` / `updatedAt` | 自動付与             | microCMS が自動でセット。                                |

### Spots (例: `spots`)

1. microCMS で「APIを作成」→「リスト」を選択し、API ID を `spots` にする。
2. 上記ベースフィールドを追加したあと、下記の項目を順に追加する。フィールド名は英語 (snake_case) に統一すると管理しやすいです。

| Field              | Type             | 必須 | 設定例                                                                           |
| ------------------ | ---------------- | ---- | -------------------------------------------------------------------------------- |
| `name`             | テキスト         | ✔   | 施設表示名。                                                                     |
| `area`             | セレクト         | ✔   | 選択肢: 札幌/東京/名古屋/大阪/福岡…                                              |
| `tags`             | 複数選択         |      | 雨天OK/子連れ/車なし/低予算/学割 等を登録。                                      |
| `open_hours`       | リッチテキスト   |      | 営業時間や休館情報。                                                             |
| `required_time`    | 数値             | ✔   | 滞在目安 (分)。                                                                  |
| `price`            | テキスト         |      | 料金メモ。                                                                       |
| `access`           | グループ         |      | 子項目: `bus_line`, `stop`, `platform`, `last_bus_time`, `parking`。             |
| `accessibility`    | グループ         |      | 子項目は boolean にして `step_free`, `stroller`, `nursing_room`, `toilet` など。 |
| `official_url`     | テキスト         |      | 公式サイト URL。                                                                 |
| `map_link`         | テキスト         |      | Google Maps など。                                                               |
| `images`           | 繰り返しグループ |      | 子項目: `url` (画像), `alt` (テキスト。必須)。                                   |
| `last_verified_at` | 日付             |      | 情報確認日。                                                                     |
| `warnings`         | 複数テキスト     |      | 注意事項。                                                                       |

> microCMS の「バリデーション」タブで、slug の正規表現や required を設定しておくと運用時の事故を防げます。

### Articles (例: `articles`)

1. API ID を `articles` として作成。
2. ベースフィールド追加後、以下の項目を設定。

| Field        | Type             | 必須 | 設定例                                         |
| ------------ | ---------------- | ---- | ---------------------------------------------- |
| `type`       | ラジオ           | ✔   | 選択肢: `blog`, `guide`, `event`。             |
| `hero_image` | 画像             |      | 記事ヘッダ画像。                               |
| `body`       | リッチテキスト   | ✔   | 記事本文。Sanitize 済みで描画。                |
| `related`    | 参照 (spots)     |      | 関連スポット。複数可。                         |
| `cta_links`  | 繰り返しグループ |      | 子項目: `label` (テキスト), `url` (テキスト)。 |
| `author_ref` | テキスト         |      | 著者情報など任意。                             |

「公開後すぐに翻訳」させたい場合は ja 版をマスターとして登録し、translation webhook を設定しておきます。

### モデルコース / Itineraries (例: `itineraries`)

- API ID を `itineraries` にし、以下のフィールドを追加。

| Field               | Type             | 必須 | 設定例                                                                                                              |
| ------------------- | ---------------- | ---- | ------------------------------------------------------------------------------------------------------------------- |
| `audience_tags`     | 複数選択         |      | 子連れ/雨天/車なし/低予算/半日/1日 等。                                                                             |
| `total_time`        | 数値             | ✔   | 合計時間 (分)。                                                                                                     |
| `budget`            | 数値             |      | 目安予算 (JPY)。                                                                                                    |
| `season`            | セレクト         |      | 春/夏/秋/冬。                                                                                                       |
| `transport`         | セレクト         | ✔   | `walk`/`bus`/`car`/`mixed`。                                                                                        |
| `timeline`          | 繰り返しグループ | ✔   | 子項目: `time` (テキスト), `spot_ref` (テキスト or 参照), `stay_min` (数値), `move_min` (数値), `note` (テキスト)。 |
| `alternatives`      | 複数テキスト     |      | 代替案。                                                                                                            |
| `warnings`          | 複数テキスト     |      | 注意事項。                                                                                                          |
| `food_toilet_notes` | テキストエリア   |      | 食事/トイレ情報。                                                                                                   |
| `links`             | 繰り返しグループ |      | 子項目: `label`, `url`。                                                                                            |
| `map_link`          | テキスト         |      | Google Maps など。                                                                                                  |

`timeline` の `spot_ref` を参照フィールドにしておくと、スポットの URL を自動で生成するなど拡張しやすくなります。

> 詳細なスキーマ例は `docs/data-model.md` も参照してください。

## 2. 環境変数の設定

`.env.local` には以下を定義します。本番 (Vercel など) でも同じ値を設定してください。

```
MICROCMS_SERVICE_DOMAIN=xxxx
MICROCMS_API_KEY=xxxxxxxx
MICROCMS_SPOTS_ENDPOINT=spots        # 任意のエンドポイント名
MICROCMS_ARTICLES_ENDPOINT=articles
MICROCMS_ITINERARIES_ENDPOINT=itineraries
MICROCMS_BLOG_ENDPOINT=blogs
TRANSLATION_SECRET=translate-token
```

## 3. 編集フロー

1. microCMS で対象 API のエントリを作成し、`lang` と `translation_group_id` を言語ごとに揃える
2. `公開` すると ISR (30分) で自動反映。即時確認したい場合は `/api/revalidate?secret=...` を叩くか `pnpm dev` 中のローカルで確認
3. ドラフト確認: `/api/preview?slug=spots/naruto-whirlpool&draftKey=...` の形式でプレビュー可能

### 自動翻訳 (OpenAI)

- `src/app/api/translations/route.ts` に OpenAI + microCMS を使った翻訳 webhook を用意しています。
- microCMS の各 API で「公開」トリガーの webhook を設定し、URL を `https://<your-domain>/api/translations?secret=TRANSLATION_SECRET` にします。
- webhook の payload には少なくとも `endpoint` (例: `spots`) と `id` を含めてください。テンプレート例:

```json
{
  "endpoint": "spots",
  "id": "<%= id %>"
}
```

- これで日本語 (`lang=ja`) のエントリを更新すると、英語・中国語のレコードが自動生成/更新されます。`translation_group_id` を共通化することが前提です。

これで Articles/Spots/モデルコースはいずれも microCMS 上の変更だけで更新できます。必要に応じてタグやセレクトの選択肢を追加し、サイトの UI と整合するようにしてください。
