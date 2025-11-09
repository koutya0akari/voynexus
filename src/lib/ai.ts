import OpenAI from "openai";
import type { Locale } from "@/lib/i18n";
import { searchRag } from "@/lib/rag";

const openAiKey = process.env.OPENAI_API_KEY;
const client = openAiKey ? new OpenAI({ apiKey: openAiKey }) : null;

function extractOutputText(chunk: unknown): string | null {
  if (!chunk || typeof chunk !== "object" || !("content" in chunk)) {
    return null;
  }
  const content = (chunk as { content?: unknown }).content;
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }
  const first = content[0];
  if (
    first &&
    typeof first === "object" &&
    "type" in first &&
    (first as { type?: unknown }).type === "output_text" &&
    "text" in first &&
    typeof (first as { text?: unknown }).text === "string"
  ) {
    return (first as { text: string }).text;
  }
  return null;
}

export type ChatPayload = {
  lang: Locale;
  userQuery: string;
  userContext?: string;
};

export type ChatResult = {
  answer: string;
  references: { title: string; url: string }[];
  warnings?: string[];
};

export type ItineraryPayload = {
  lang: Locale;
  start: string;
  end: string;
  transport: string;
  budget: number;
  party: string;
  interests: string;
  weather: string;
  tidesHint?: string;
};

export async function generateChatResponse(payload: ChatPayload): Promise<ChatResult> {
  const docs = await searchRag(payload.userQuery, payload.lang);

  if (!client) {
    return {
      answer: `- ${docs[0]?.summary ?? "準備中"}`,
      references: docs.map((doc) => ({ title: doc.title, url: doc.url })),
      warnings: ["OPENAI_API_KEY not configured. Returning fallback answer."]
    };
  }

  const prompt = [
    "You are a Tokushima tourism concierge.",
    "Follow safety rules: highlight official links, avoid speculation.",
    "Prioritize bullet answers and mention if data is unavailable.",
    `User context: ${payload.userContext ?? "N/A"}`,
    `Documents: ${docs.map((doc) => `${doc.title}: ${doc.summary} (${doc.url})`).join("\n")}`
  ].join("\n\n");

  const completion = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: prompt },
      { role: "user", content: payload.userQuery }
    ]
  });

  const answer = extractOutputText(completion.output?.[0]) ?? "情報を取得できませんでした。";

  return {
    answer,
    references: docs.map((doc) => ({ title: doc.title, url: doc.url }))
  };
}

export async function generateItinerary(payload: ItineraryPayload) {
  const docs = await searchRag(payload.interests, payload.lang);

  if (!client) {
    return {
      timeline: [
        { time: payload.start, title: "徳島駅集合", duration: 30, note: "待ち合わせと注意事項" },
        { time: "10:00", title: "鳴門の渦潮", duration: 120, note: "最終バス 17:30" }
      ],
      warnings: ["OPENAI_API_KEY not configured. Returning mock itinerary."],
      references: docs
    };
  }

  const prompt = [
    "You are an itinerary planner abiding by strict rules.",
    "- Respect opening hours / travel time / last bus.",
    "- Output JSON with timeline (time,title,duration,note) and warnings array.",
    `Travel window: ${payload.start} - ${payload.end}`,
    `Transport: ${payload.transport}`,
    `Budget: ¥${payload.budget}`,
    `Party: ${payload.party}`,
    `Weather: ${payload.weather}`,
    `Docs: ${docs.map((doc) => `${doc.title}:${doc.summary}`).join("|")}`
  ].join("\n");

  const completion = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: prompt },
      { role: "user", content: "Generate itinerary JSON." }
    ]
  });

  const embeddedContent = extractOutputText(completion.output?.[0]);
  if (embeddedContent) {
    try {
      const parsed = JSON.parse(embeddedContent);
      return { ...parsed, references: docs };
    } catch (error) {
      console.error("Failed to parse itinerary JSON", error);
    }
  }

  return {
    timeline: [],
    warnings: ["AI出力の解析に失敗しました。再試行してください。"],
    references: docs
  };
}
