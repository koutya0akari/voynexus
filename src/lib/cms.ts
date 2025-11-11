import { createClient, type MicroCMSQueries } from "microcms-js-sdk";
import type { Locale } from "@/lib/i18n";
import type { Article, Blog, EventContent, GlobalSettings, Itinerary, Spot, Sponsor } from "@/lib/types/cms";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

const client = serviceDomain && apiKey ? createClient({ serviceDomain, apiKey }) : null;
const blogEndpoint = process.env.MICROCMS_BLOG_ENDPOINT || "blogs";
const spotEndpoint = process.env.MICROCMS_SPOTS_ENDPOINT || "spots";
const articleEndpoint = process.env.MICROCMS_ARTICLES_ENDPOINT || "articles";
const itineraryEndpoint = process.env.MICROCMS_ITINERARIES_ENDPOINT || "itineraries";

const fallbackSpots: Spot[] = [
  {
    id: "naruto-whirlpool",
    lang: "ja",
    translationGroupId: "grp-naruto-whirlpool",
    slug: "naruto-whirlpool",
    title: "鳴門の渦潮クルーズ",
    summary: "潮が最大になる時間帯をAIが提案し、渦潮観測船のチケットリンクを提供。",
    ogImage: "/sample/naruto.png",
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    name: "鳴門の渦潮",
    area: "鳴門",
    tags: ["自然", "雨天OK", "車なし"],
    openHours: "9:00-17:00",
    requiredTime: 120,
    access: {
      busLine: "徳島バス",
      stop: "鳴門公園",
      lastBusTime: "18:10"
    },
    accessibility: {
      stepFree: true,
      stroller: true
    },
    mapLink: "https://maps.google.com/?q=naruto+whirlpool",
    images: [{ url: "/sample/naruto.png", alt: "鳴門の渦潮" }],
    lastVerifiedAt: new Date().toISOString()
  }
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
      { time: "11:00", spotRef: "naruto-whirlpool", stayMin: 90, moveMin: 30 }
    ],
    alternatives: ["屋外公園"],
    foodToiletNotes: "館内に授乳室あり",
    warnings: ["最終バス 17:30 までに帰路へ"],
    links: [{ label: "PDF", url: "/sample/sample.pdf" }],
    mapLink: "https://maps.google.com/?q=tokushima"
  }
];

const fallbackArticles: Article[] = [
  {
    id: "awa-odori-guide",
    lang: "ja",
    translationGroupId: "grp-awa-odori-guide",
    slug: "awa-odori-guide",
    title: "阿波おどりを120%楽しむ学生ガイド",
    summary: "混雑回避や雨天の持ち物などを学生ライターが現地からレポート。",
    ogImage: "/sample/awa.png",
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    type: "guide",
    body: "<p>本文リッチテキスト</p>",
    heroImage: "/sample/awa.png",
    related: ["naruto-whirlpool"]
  }
];

const fallbackBlogs: Blog[] = [
  {
    id: "welcome-to-tokushima",
    slug: "welcome-to-tokushima",
    title: "徳島トラベルブログを公開しました",
    publishedAt: new Date().toISOString(),
    category: { name: "お知らせ" },
    body: "<p>徳島での旅のヒントやイベント情報を発信するブログをスタートしました。microCMSのブログAPIを有効化すれば、ここにCMSで管理した本文が表示されます。</p>"
  }
];

const fallbackSponsors: Sponsor[] = [
  {
    id: "sponsor-hotel",
    lang: "ja",
    translationGroupId: "grp-sponsor-hotel",
    slug: "sponsor-hotel",
    title: "徳島シーサイドホテル",
    summary: "渦潮エリア徒歩5分のホテル。",
    ogImage: "/sample/hotel.png",
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tier: "A",
    asset: { url: "/sample/hotel.png", alt: "ホテルバナー" },
  destinationUrl: "https://hotel.example.com?utm_source=voynexus_app&utm_medium=referral",
    positions: ["top", "spots"],
    activeFrom: new Date().toISOString(),
    activeTo: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
  }
];

function getFallbackList<T>(endpoint: string, queries?: MicroCMSQueries) {
  switch (endpoint) {
    case spotEndpoint:
      return { contents: fallbackSpots as T[], totalCount: fallbackSpots.length, offset: 0, limit: fallbackSpots.length };
    case itineraryEndpoint:
      return {
        contents: fallbackItineraries as T[],
        totalCount: fallbackItineraries.length,
        offset: 0,
        limit: fallbackItineraries.length
      };
    case articleEndpoint:
      return { contents: fallbackArticles as T[], totalCount: fallbackArticles.length, offset: 0, limit: fallbackArticles.length };
    case blogEndpoint:
      return { contents: fallbackBlogs as T[], totalCount: fallbackBlogs.length, offset: 0, limit: fallbackBlogs.length };
    case "sponsors":
      return { contents: fallbackSponsors as T[], totalCount: fallbackSponsors.length, offset: 0, limit: fallbackSponsors.length };
    default:
      return { contents: [] as T[], totalCount: 0, offset: 0, limit: queries?.limit ?? 0 };
  }
}

type FallbackEntity = { id: string; slug?: string };

type BlogLike = Blog & {
  content?: string;
  category?: Blog["category"] & { category?: string };
};

function normalizeBlogEntry(entry: BlogLike): Blog {
  const categoryName = entry.category?.name ?? entry.category?.category;
  return {
    ...entry,
    body: entry.body ?? entry.content ?? "",
    category: entry.category ? { ...entry.category, name: categoryName } : undefined
  };
}

function getFallbackDetail<T>(endpoint: string, contentId: string) {
  const fallbackMap: Record<string, FallbackEntity[]> = {
    [spotEndpoint]: fallbackSpots,
    [itineraryEndpoint]: fallbackItineraries,
    [articleEndpoint]: fallbackArticles,
    [blogEndpoint]: fallbackBlogs
  };
  const match = fallbackMap[endpoint]?.find((item) => item.id === contentId || item.slug === contentId);
  if (!match) {
    throw new Error(`Fallback ${endpoint} not found: ${contentId}`);
  }
  return match as T;
}

async function safeGetList<T>(endpoint: string, queries?: MicroCMSQueries) {
  if (!client) {
    return getFallbackList<T>(endpoint, queries);
  }

  try {
    return await client.getList<T>({ endpoint, queries });
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
    return await client.getListDetail<T>({ endpoint, contentId, queries });
  } catch (error) {
    console.warn(`[microCMS] Falling back to mock detail for ${endpoint}:${contentId}`, error);
    return getFallbackDetail<T>(endpoint, contentId);
  }
}

export async function getSpots(params: { lang?: Locale; area?: string; tags?: string[]; limit?: number }) {
  const filters = [
    params.lang ? `lang[equals]${params.lang}` : null,
    params.area ? `area[equals]${params.area}` : null,
    params.tags?.length ? params.tags.map((tag) => `tags[contains]${tag}`).join("[and]") : null
  ]
    .filter(Boolean)
    .join("[and]");

  return safeGetList<Spot>(spotEndpoint, {
    filters: filters || undefined,
    limit: params.limit ?? 24,
    orders: "-updatedAt"
  });
}

export async function getSpotDetail(slug: string, lang: Locale, draftKey?: string): Promise<Spot | undefined> {
  if (!client) {
    return safeGetDetail<Spot>(spotEndpoint, slug);
  }

  try {
    const data = await client.getList<Spot>({
      endpoint: spotEndpoint,
      queries: {
        filters: `slug[equals]${slug}[and]lang[equals]${lang}`,
        limit: 1,
        draftKey
      }
    });

    return data.contents[0];
  } catch (error) {
    console.warn(`[microCMS] Falling back to mock spot detail for slug=${slug}`, error);
    return safeGetDetail<Spot>(spotEndpoint, slug);
  }
}

export async function getItineraries(params: { lang?: Locale; audienceTag?: string; limit?: number }) {
  const filters = [
    params.lang ? `lang[equals]${params.lang}` : null,
    params.audienceTag ? `audience_tags[contains]${params.audienceTag}` : null
  ]
    .filter(Boolean)
    .join("[and]");

  return safeGetList<Itinerary>(itineraryEndpoint, {
    filters: filters || undefined,
    limit: params.limit ?? 5,
    orders: "-updatedAt"
  });
}

export async function getArticles(params: { lang?: Locale; type?: string; limit?: number; q?: string }) {
  const filters = [
    params.lang ? `lang[equals]${params.lang}` : null,
    params.type ? `type[equals]${params.type}` : null
  ]
    .filter(Boolean)
    .join("[and]");

  return safeGetList<Article>(articleEndpoint, {
    filters: filters || undefined,
    limit: params.limit ?? 12,
    q: params.q,
    orders: "-updatedAt"
  });
}

export async function getBlogs(params?: { limit?: number; q?: string; order?: string }) {
  const response = await safeGetList<Blog>(blogEndpoint, {
    limit: params?.limit ?? 10,
    q: params?.q,
    orders: params?.order ?? "-publishedAt"
  });
  return {
    ...response,
    contents: response.contents.map((entry) => normalizeBlogEntry(entry as BlogLike))
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
    orders: "-updatedAt"
  });
}

export async function getSponsors(params: { position?: string; lang?: Locale }) {
  const filters = [
    params.lang ? `lang[equals]${params.lang}` : null,
    params.position ? `positions[contains]${params.position}` : null
  ]
    .filter(Boolean)
    .join("[and]");

  return safeGetList<Sponsor>("sponsors", {
    filters: filters || undefined,
    orders: "tier"
  });
}

export async function getGlobals(): Promise<GlobalSettings | null> {
  if (!client) {
    return {
      disclaimer: "表示の料金等は変更になる場合があります。",
      warnings: ["最終バスにはご注意ください"]
    };
  }

  const result = await client.getObject<GlobalSettings>({ endpoint: "globals" });
  return result;
}
