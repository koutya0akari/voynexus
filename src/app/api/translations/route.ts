import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "microcms-js-sdk";
import type { Locale } from "@/lib/i18n";
import type { Article, Itinerary, Spot } from "@/lib/types/cms";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
const translationSecret = process.env.TRANSLATION_SECRET;
const openaiApiKey = process.env.OPENAI_API_KEY;

const spotEndpoint = process.env.MICROCMS_SPOTS_ENDPOINT || "spots";
const articleEndpoint = process.env.MICROCMS_ARTICLES_ENDPOINT || "articles";
const itineraryEndpoint = process.env.MICROCMS_ITINERARIES_ENDPOINT || "itineraries";

const targetLangs: Locale[] = ["en", "zh"];

if (!serviceDomain || !apiKey) {
  throw new Error("microCMS credentials are not configured");
}

if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY is not configured");
}

const microcms = createClient({ serviceDomain, apiKey });
const openai = new OpenAI({ apiKey: openaiApiKey });

type TranslationHandler = (entry: Spot | Article | Itinerary) => Promise<void>;

const endpointHandlers: Record<string, TranslationHandler> = {
  [spotEndpoint]: (entry) => translateSpotEntry(entry as Spot),
  [articleEndpoint]: (entry) => translateArticleEntry(entry as Article),
  [itineraryEndpoint]: (entry) => translateItineraryEntry(entry as Itinerary)
};

export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!translationSecret || secret !== translationSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const endpoint = body?.endpoint as string | undefined;
  const contentId = body?.id as string | undefined;

  if (!endpoint || !contentId) {
    return NextResponse.json({ error: "Missing endpoint or id" }, { status: 400 });
  }

  const handler = endpointHandlers[endpoint];
  if (!handler) {
    return NextResponse.json({ message: `No translation handler for ${endpoint}` });
  }

  try {
    const entry = await microcms.getListDetail({ endpoint, contentId });
    await handler(entry);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("translation webhook error", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}

async function translateSpotEntry(entry: Spot) {
  await Promise.all(
    targetLangs.map(async (lang) => {
      if (entry.lang === lang) return;
      const existingId = await getExistingTranslationId(spotEndpoint, entry.translationGroupId, lang);
      const payload = buildSpotTranslationPayload(entry);
      const translated = await translateStructured(payload, lang);
      const content = buildSpotContent(entry, translated, lang);
      await createOrUpdateEntry(spotEndpoint, entry.translationGroupId, lang, content, existingId);
    })
  );
}

async function translateArticleEntry(entry: Article) {
  await Promise.all(
    targetLangs.map(async (lang) => {
      if (entry.lang === lang) return;
      const existingId = await getExistingTranslationId(articleEndpoint, entry.translationGroupId, lang);
      const payload = buildArticleTranslationPayload(entry);
      const translated = await translateStructured(payload, lang);
      const content = buildArticleContent(entry, translated, lang);
      await createOrUpdateEntry(articleEndpoint, entry.translationGroupId, lang, content, existingId);
    })
  );
}

async function translateItineraryEntry(entry: Itinerary) {
  await Promise.all(
    targetLangs.map(async (lang) => {
      if (entry.lang === lang) return;
      const existingId = await getExistingTranslationId(itineraryEndpoint, entry.translationGroupId, lang);
      const payload = buildItineraryTranslationPayload(entry);
      const translated = await translateStructured(payload, lang);
      const content = buildItineraryContent(entry, translated, lang);
      await createOrUpdateEntry(itineraryEndpoint, entry.translationGroupId, lang, content, existingId);
    })
  );
}

async function getExistingTranslationId(endpoint: string, translationGroupId: string, lang: Locale) {
  const { contents } = await microcms.getList({
    endpoint,
    queries: {
      filters: `translation_group_id[equals]${translationGroupId}[and]lang[equals]${lang}`,
      limit: 1
    }
  });
  return contents[0]?.id as string | undefined;
}

async function createOrUpdateEntry(
  endpoint: string,
  translationGroupId: string,
  lang: Locale,
  content: Record<string, unknown>,
  existingContentId?: string
) {
  const contentId = existingContentId ?? `${translationGroupId}-${lang}`;
  if (existingContentId) {
    await microcms.update({ endpoint, contentId, content });
  } else {
    await microcms.create({ endpoint, contentId, content });
  }
}

type SpotTranslationFields = ReturnType<typeof buildSpotTranslationPayload>;
type ArticleTranslationFields = ReturnType<typeof buildArticleTranslationPayload>;
type ItineraryTranslationFields = ReturnType<typeof buildItineraryTranslationPayload>;

function buildSpotTranslationPayload(entry: Spot) {
  return pruneEmpty({
    title: entry.title,
    summary: entry.summary,
    name: entry.name,
    openHours: entry.openHours,
    access: entry.access
      ? {
          busLine: entry.access.busLine,
          stop: entry.access.stop,
          platform: entry.access.platform,
          lastBusTime: entry.access.lastBusTime,
          parking: entry.access.parking
        }
      : undefined,
    warnings: entry.warnings,
    images: entry.images?.map((image) => ({ alt: image.alt }))
  });
}

function buildSpotContent(entry: Spot, translated: SpotTranslationFields, lang: Locale) {
  const slug = `${entry.slug}-${lang}`;
  const images = entry.images?.map((image, index) => ({
    ...image,
    alt: translated.images?.[index]?.alt ?? image.alt
  }));

  const access = entry.access ? { ...entry.access } : undefined;
  if (access && translated.access) {
    access.busLine = translated.access.busLine ?? access.busLine;
    access.stop = translated.access.stop ?? access.stop;
    access.platform = translated.access.platform ?? access.platform;
    access.lastBusTime = translated.access.lastBusTime ?? access.lastBusTime;
    access.parking = translated.access.parking ?? access.parking;
  }

  return pruneEmpty({
    lang,
    translationGroupId: entry.translationGroupId,
    slug,
    title: translated.title ?? entry.title,
    summary: translated.summary ?? entry.summary,
    ogImage: entry.ogImage,
    name: translated.name ?? entry.name,
    area: entry.area,
    tags: entry.tags,
    openHours: translated.openHours ?? entry.openHours,
    requiredTime: entry.requiredTime,
    access,
    accessibility: entry.accessibility,
    officialUrl: entry.officialUrl,
    mapLink: entry.mapLink,
    images,
    lastVerifiedAt: entry.lastVerifiedAt,
    warnings: translated.warnings ?? entry.warnings
  });
}

function buildArticleTranslationPayload(entry: Article) {
  return pruneEmpty({
    title: entry.title,
    summary: entry.summary,
    body: entry.body,
    ctaLinks: entry.ctaLinks?.map((cta) => ({ label: cta.label }))
  });
}

function buildArticleContent(entry: Article, translated: ArticleTranslationFields, lang: Locale) {
  const slug = `${entry.slug}-${lang}`;
  const ctaLinks = entry.ctaLinks?.map((cta, index) => ({
    ...cta,
    label: translated.ctaLinks?.[index]?.label ?? cta.label
  }));

  return pruneEmpty({
    lang,
    translationGroupId: entry.translationGroupId,
    slug,
    title: translated.title ?? entry.title,
    summary: translated.summary ?? entry.summary,
    type: entry.type,
    body: translated.body ?? entry.body,
    heroImage: entry.heroImage,
    ogImage: entry.ogImage,
    related: entry.related,
    ctaLinks
  });
}

function buildItineraryTranslationPayload(entry: Itinerary) {
  return pruneEmpty({
    title: entry.title,
    summary: entry.summary,
    timeline: entry.timeline?.map((item) => ({ note: item.note ?? "" })),
    alternatives: entry.alternatives,
    warnings: entry.warnings,
    foodToiletNotes: entry.foodToiletNotes,
    links: entry.links?.map((link) => ({ label: link.label }))
  });
}

function buildItineraryContent(entry: Itinerary, translated: ItineraryTranslationFields, lang: Locale) {
  const slug = `${entry.slug}-${lang}`;
  const timeline = entry.timeline?.map((item, index) => ({
    ...item,
    note: translated.timeline?.[index]?.note ?? item.note
  }));
  const links = entry.links?.map((link, index) => ({
    ...link,
    label: translated.links?.[index]?.label ?? link.label
  }));

  return pruneEmpty({
    lang,
    translationGroupId: entry.translationGroupId,
    slug,
    title: translated.title ?? entry.title,
    summary: translated.summary ?? entry.summary,
    audienceTags: entry.audienceTags,
    totalTime: entry.totalTime,
    budget: entry.budget,
    season: entry.season,
    transport: entry.transport,
    timeline,
    alternatives: translated.alternatives ?? entry.alternatives,
    warnings: translated.warnings ?? entry.warnings,
    foodToiletNotes: translated.foodToiletNotes ?? entry.foodToiletNotes,
    links,
    mapLink: entry.mapLink
  });
}

async function translateStructured<T>(payload: T, targetLang: Locale): Promise<T> {
  const cleaned = pruneEmpty(payload);
  if (!cleaned || (typeof cleaned === "object" && Object.keys(cleaned).length === 0)) {
    return payload;
  }

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_TRANSLATION_MODEL || "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You translate Japanese tourism content into the requested language. Keep HTML tags intact, preserve JSON keys, and translate only string values."
      },
      {
        role: "user",
        content: `Translate every string value in this JSON into ${targetLang}. JSON:${JSON.stringify(cleaned)}`
      }
    ]
  });

  const message = completion.choices[0]?.message?.content;
  if (!message) {
    return payload;
  }

  try {
    return JSON.parse(message) as T;
  } catch (error) {
    console.warn("Failed to parse translation JSON", error, message);
    return payload;
  }
}

function pruneEmpty<T>(value: T): T {
  if (Array.isArray(value)) {
    const arr = value
      .map((item) => pruneEmpty(item))
      .filter((item) => item !== undefined && item !== null && !(typeof item === "string" && item.trim() === ""));
    return arr as unknown as T;
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value)
      .map(([key, val]) => [key, pruneEmpty(val)])
      .filter(([, val]) => val !== undefined && val !== null && !(typeof val === "string" && val.trim() === ""));
    return Object.fromEntries(entries) as T;
  }
  return value;
}
