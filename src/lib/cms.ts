import { createClient, type MicroCMSQueries } from "microcms-js-sdk";
import type { Locale } from "@/lib/i18n";
import type {
  Article,
  Blog,
  EventContent,
  GlobalSettings,
  Itinerary,
  Spot,
  Sponsor,
} from "@/lib/types/cms";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

const client = serviceDomain && apiKey ? createClient({ serviceDomain, apiKey }) : null;
const blogEndpoint = process.env.MICROCMS_BLOG_ENDPOINT || "blogs";
const spotEndpoint = process.env.MICROCMS_SPOTS_ENDPOINT || "spots";
const articleEndpoint = process.env.MICROCMS_ARTICLES_ENDPOINT || "articles";
const itineraryEndpoint = process.env.MICROCMS_ITINERARIES_ENDPOINT || "itineraries";

type PrimitiveRecord = Record<string, unknown>;

type BlogLike = Omit<
  Blog,
  "tags" | "category" | "pictures" | "studentId" | "cost" | "body" | "eyecatch"
> &
  Partial<Pick<Blog, "eyecatch">> & {
    body?: string;
    content?: string;
    contents?: string;
    studentid?: string;
    studentId?: string;
    tags?: (PrimitiveRecord | string)[];
    categories?: PrimitiveRecord | PrimitiveRecord[];
    category?: Blog["category"] & { category?: string; categories?: string };
    costs?: number;
    cost?: number;
    pictures?: PrimitiveRecord[];
  };

const preferredCategoryKeys = ["name", "category", "categories", "title"];
const preferredTagKeys = ["tags", "tag", "name", "title", "label"];

const fallbackSpots: Spot[] = [
  {
    id: "seaside-sunrise",
    lang: "ja",
    translationGroupId: "grp-seaside-sunrise",
    slug: "seaside-sunrise",
    title: "ベイエリアサンライズクルーズ",
    summary: "潮の動きと天候をAIが提案し、観光船のチケットリンクを提供。",
    ogImage: "/sample/naruto.png",
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    name: "サンライズクルーズ",
    area: "横浜",
    tags: ["自然", "雨天OK", "車なし"],
    openHours: "9:00-17:00",
    requiredTime: 120,
    access: {
      busLine: "シティバス",
      stop: "みなと公園",
      lastBusTime: "18:10",
    },
    accessibility: {
      stepFree: true,
      stroller: true,
    },
    mapLink: "https://maps.google.com/?q=seaside+sunrise+cruise",
    images: [{ url: "/sample/naruto.png", alt: "ベイエリアサンライズクルーズ" }],
    lastVerifiedAt: new Date().toISOString(),
  },
];

const fallbackItineraries: Itinerary[] = [
  {
    id: "family-halfday",
    lang: "ja",
    translationGroupId: "grp-family-halfday",
    slug: "family-halfday",
    title: "子連れ半日モデルコース",
    summary: "雨天でも楽しめるよう屋内施設を組み合わせた半日プラン。",
    ogImage: "/sample/family.png",
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    audienceTags: ["子連れ", "雨天"],
    totalTime: 240,
    budget: 4000,
    season: "spring",
    transport: "bus",
    timeline: [
      { time: "09:00", spotRef: "museum", stayMin: 60, moveMin: 20, note: "ワークショップ参加" },
      { time: "11:00", spotRef: "seaside-sunrise", stayMin: 90, moveMin: 30 },
    ],
    alternatives: ["屋外公園"],
    foodToiletNotes: "館内に授乳室あり",
    warnings: ["最終バス 17:30 までに帰路へ"],
    links: [{ label: "PDF", url: "/sample/sample.pdf" }],
    mapLink: "https://maps.google.com/?q=japan+family+course",
  },
];

const fallbackArticles: Article[] = [
  {
    id: "fireworks-guide",
    lang: "ja",
    translationGroupId: "grp-awa-odori-guide",
    slug: "fireworks-guide",
    title: "全国花火フェスを120%楽しむガイド",
    summary: "混雑回避や雨天の持ち物などを学生ライターが現地からレポート。",
    ogImage: "/sample/awa.png",
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    type: "guide",
    body: "<p>本文リッチテキスト</p>",
    heroImage: "/sample/awa.png",
    related: ["seaside-sunrise"],
  },
];

const fallbackBlogs: BlogLike[] = [
  {
    id: "welcome-to-voynexus",
    slug: "welcome-to-voynexus",
    title: "全国トラベルブログを公開しました",
    publishedAt: new Date().toISOString(),
    eyecatch: { url: "/sample/awa.png", width: 1200, height: 630 },
    studentid: "voynexus編集部",
    categories: [{ id: "category-news", name: "お知らせ" }],
    tags: [{ name: "リリース" }, { name: "お知らせ" }],
    costs: 18000,
    contents:
      "<p>全国の旅のヒントやイベント情報を発信するブログをスタートしました。現地スタッフや学生ライターのリポートを順次公開していきます。</p>",
    pictures: [
      {
        image: { url: "/sample/awa.png", width: 1200, height: 800 },
        caption: "voynexus ブログ",
      },
      {
        image: { url: "/sample/naruto.png", width: 1200, height: 800 },
        caption: "現地取材の様子",
      },
    ],
  },
];

const fallbackSponsors: Sponsor[] = [
  {
    id: "sponsor-hotel",
    lang: "ja",
    translationGroupId: "grp-sponsor-hotel",
    slug: "sponsor-hotel",
    title: "ベイエリアシーサイドホテル",
    summary: "港エリア徒歩5分のホテル。",
    ogImage: "/sample/hotel.png",
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tier: "A",
    asset: { url: "/sample/hotel.png", alt: "ホテルバナー" },
    destinationUrl: "https://hotel.example.com?utm_source=voynexus_app&utm_medium=referral",
    positions: ["top", "spots"],
    activeFrom: new Date().toISOString(),
    activeTo: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
  },
];

function getFallbackList<T>(endpoint: string, queries?: MicroCMSQueries) {
  switch (endpoint) {
    case spotEndpoint:
      return {
        contents: fallbackSpots as T[],
        totalCount: fallbackSpots.length,
        offset: 0,
        limit: fallbackSpots.length,
      };
    case itineraryEndpoint:
      return {
        contents: fallbackItineraries as T[],
        totalCount: fallbackItineraries.length,
        offset: 0,
        limit: fallbackItineraries.length,
      };
    case articleEndpoint:
      return {
        contents: fallbackArticles as T[],
        totalCount: fallbackArticles.length,
        offset: 0,
        limit: fallbackArticles.length,
      };
    case blogEndpoint:
      return {
        contents: fallbackBlogs as T[],
        totalCount: fallbackBlogs.length,
        offset: 0,
        limit: fallbackBlogs.length,
      };
    case "sponsors":
      return {
        contents: fallbackSponsors as T[],
        totalCount: fallbackSponsors.length,
        offset: 0,
        limit: fallbackSponsors.length,
      };
    default:
      return { contents: [] as T[], totalCount: 0, offset: 0, limit: queries?.limit ?? 0 };
  }
}

type FallbackEntity = { id: string; slug?: string };

function readStringField(record: PrimitiveRecord | undefined, keys: string[]) {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length) {
      return value;
    }
  }
  return undefined;
}

function normalizePictures(title: string, pictures?: PrimitiveRecord[]) {
  if (!Array.isArray(pictures)) return undefined;
  const normalized = pictures
    .map((picture) => {
      if (!picture) return null;
      const imageCandidate = picture["image"];
      const image =
        imageCandidate && typeof imageCandidate === "object"
          ? (imageCandidate as PrimitiveRecord)
          : picture;
      const urlValue = image["url"];
      const url = typeof urlValue === "string" ? urlValue : undefined;
      if (!url) return null;
      const widthValue = image["width"];
      const heightValue = image["height"];
      const width = typeof widthValue === "number" ? widthValue : undefined;
      const height = typeof heightValue === "number" ? heightValue : undefined;
      const alt =
        (typeof picture["alt"] === "string" && (picture["alt"] as string).trim().length
          ? (picture["alt"] as string)
          : typeof picture["caption"] === "string" && (picture["caption"] as string).trim().length
            ? (picture["caption"] as string)
            : typeof picture["description"] === "string" &&
                (picture["description"] as string).trim().length
              ? (picture["description"] as string)
              : undefined) ?? title;
      return { url, width, height, alt };
    })
    .filter(Boolean);
  return normalized.length ? (normalized as Blog["pictures"]) : undefined;
}

function normalizeBlogEntry(entry: BlogLike): Blog {
  const categoryRecord =
    (entry.category as PrimitiveRecord | undefined) ??
    (Array.isArray(entry.categories)
      ? (entry.categories[0] as PrimitiveRecord | undefined)
      : typeof entry.categories === "object"
        ? (entry.categories as PrimitiveRecord)
        : undefined);
  const categoryName = readStringField(categoryRecord, preferredCategoryKeys);
  const categoryIdValue =
    (categoryRecord && typeof categoryRecord["id"] === "string"
      ? (categoryRecord["id"] as string)
      : undefined) ?? entry.category?.id;
  const tags = Array.isArray(entry.tags)
    ? (
        entry.tags
          .map((tag) =>
            typeof tag === "object" && tag
              ? readStringField(tag as PrimitiveRecord, preferredTagKeys)
              : typeof tag === "string"
                ? tag
                : null
          )
          .filter(Boolean) as string[]
      ).filter((value, index, array) => array.indexOf(value) === index)
    : entry.tags;
  const costValue =
    typeof entry.cost === "number"
      ? entry.cost
      : typeof entry.costs === "number"
        ? entry.costs
        : undefined;

  return {
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
    publishedAt: entry.publishedAt,
    eyecatch: entry.eyecatch,
    studentId: entry.studentId ?? entry.studentid,
    tags,
    cost: costValue,
    pictures: normalizePictures(entry.title, entry.pictures),
    body: entry.body ?? entry.content ?? entry.contents ?? "",
    category:
      categoryName || categoryIdValue ? { id: categoryIdValue, name: categoryName } : undefined,
  };
}

function getFallbackDetail<T>(endpoint: string, contentId: string) {
  const fallbackMap: Record<string, FallbackEntity[]> = {
    [spotEndpoint]: fallbackSpots,
    [itineraryEndpoint]: fallbackItineraries,
    [articleEndpoint]: fallbackArticles,
    [blogEndpoint]: fallbackBlogs,
  };
  const match = fallbackMap[endpoint]?.find(
    (item) => item.id === contentId || item.slug === contentId
  );
  if (!match) {
    throw new Error(`Fallback ${endpoint} not found: ${contentId}`);
  }
  return match as T;
}

const cmsRevalidateSeconds = Number(process.env.MICROCMS_REVALIDATE_SECONDS ?? "60");
const normalizedRevalidate =
  Number.isFinite(cmsRevalidateSeconds) && cmsRevalidateSeconds > 0 ? cmsRevalidateSeconds : 60;
const microCmsRequestInit = {
  next: {
    revalidate: normalizedRevalidate,
  },
};

async function safeGetList<T>(endpoint: string, queries?: MicroCMSQueries) {
  if (!client) {
    return getFallbackList<T>(endpoint, queries);
  }

  try {
    return await client.getList<T>({ endpoint, queries, customRequestInit: microCmsRequestInit });
  } catch (error) {
    console.warn(`[microCMS] Falling back to mock data for ${endpoint}`, error);
    return getFallbackList<T>(endpoint, queries);
  }
}

async function safeGetDetail<T>(endpoint: string, contentId: string, queries?: MicroCMSQueries) {
  if (!client) {
    return getFallbackDetail<T>(endpoint, contentId);
  }

  try {
    return await client.getListDetail<T>({
      endpoint,
      contentId,
      queries,
      customRequestInit: microCmsRequestInit,
    });
  } catch (error) {
    console.warn(`[microCMS] Falling back to mock detail for ${endpoint}:${contentId}`, error);
    return getFallbackDetail<T>(endpoint, contentId);
  }
}

export async function getSpots(params: {
  lang?: Locale;
  area?: string;
  tags?: string[];
  limit?: number;
}) {
  const filters = [
    params.lang ? `lang[equals]${params.lang}` : null,
    params.area ? `area[equals]${params.area}` : null,
    params.tags?.length ? params.tags.map((tag) => `tags[contains]${tag}`).join("[and]") : null,
  ]
    .filter(Boolean)
    .join("[and]");

  return safeGetList<Spot>(spotEndpoint, {
    filters: filters || undefined,
    limit: params.limit ?? 24,
    orders: "-updatedAt",
  });
}

export async function getSpotDetail(
  slug: string,
  lang: Locale,
  draftKey?: string
): Promise<Spot | undefined> {
  if (!client) {
    return safeGetDetail<Spot>(spotEndpoint, slug);
  }

  try {
    const data = await client.getList<Spot>({
      endpoint: spotEndpoint,
      queries: {
        filters: `slug[equals]${slug}[and]lang[equals]${lang}`,
        limit: 1,
        draftKey,
      },
    });

    return data.contents[0];
  } catch (error) {
    console.warn(`[microCMS] Falling back to mock spot detail for slug=${slug}`, error);
    return safeGetDetail<Spot>(spotEndpoint, slug);
  }
}

export async function getArticleDetail(
  slug: string,
  lang: Locale,
  draftKey?: string
): Promise<Article | undefined> {
  if (!client) {
    return safeGetDetail<Article>(articleEndpoint, slug);
  }

  try {
    const data = await client.getList<Article>({
      endpoint: articleEndpoint,
      queries: {
        filters: `slug[equals]${slug}[and]lang[equals]${lang}`,
        limit: 1,
        draftKey,
      },
    });

    return data.contents[0];
  } catch (error) {
    console.warn(`[microCMS] Falling back to mock article detail for slug=${slug}`, error);
    return safeGetDetail<Article>(articleEndpoint, slug);
  }
}

export async function getItineraries(params: {
  lang?: Locale;
  audienceTag?: string;
  limit?: number;
}) {
  const filters = [
    params.lang ? `lang[equals]${params.lang}` : null,
    params.audienceTag ? `audience_tags[contains]${params.audienceTag}` : null,
  ]
    .filter(Boolean)
    .join("[and]");

  return safeGetList<Itinerary>(itineraryEndpoint, {
    filters: filters || undefined,
    limit: params.limit ?? 5,
    orders: "-updatedAt",
  });
}

export async function getArticles(params: {
  lang?: Locale;
  type?: string;
  limit?: number;
  q?: string;
}) {
  const filters = [
    params.lang ? `lang[equals]${params.lang}` : null,
    params.type ? `type[equals]${params.type}` : null,
  ]
    .filter(Boolean)
    .join("[and]");

  return safeGetList<Article>(articleEndpoint, {
    filters: filters || undefined,
    limit: params.limit ?? 12,
    q: params.q,
    orders: "-updatedAt",
  });
}

export async function getBlogs(params?: { limit?: number; q?: string; order?: string }) {
  const response = await safeGetList<Blog>(blogEndpoint, {
    limit: params?.limit ?? 10,
    q: params?.q,
    orders: params?.order ?? "-publishedAt",
  });
  return {
    ...response,
    contents: response.contents.map((entry) => normalizeBlogEntry(entry as BlogLike)),
  };
}

export async function getBlogPost(contentId: string): Promise<Blog | null> {
  try {
    const entry = await safeGetDetail<Blog>(blogEndpoint, contentId);
    return normalizeBlogEntry(entry as BlogLike);
  } catch (error) {
    console.warn(`[microCMS] Blog not found: ${contentId}`, error);
    return null;
  }
}

export async function getEvents(params: { lang?: Locale }) {
  return safeGetList<EventContent>("events", {
    filters: params.lang ? `lang[equals]${params.lang}` : undefined,
    orders: "-updatedAt",
  });
}

export async function getSponsors(params: { position?: string; lang?: Locale }) {
  const filters = [
    params.lang ? `lang[equals]${params.lang}` : null,
    params.position ? `positions[contains]${params.position}` : null,
  ]
    .filter(Boolean)
    .join("[and]");

  return safeGetList<Sponsor>("sponsors", {
    filters: filters || undefined,
    orders: "tier",
  });
}

export async function getGlobals(): Promise<GlobalSettings | null> {
  if (!client) {
    return {
      disclaimer: "表示の料金等は変更になる場合があります。",
      warnings: ["最終バスにはご注意ください"],
    };
  }

  const result = await client.getObject<GlobalSettings>({ endpoint: "globals" });
  return result;
}
