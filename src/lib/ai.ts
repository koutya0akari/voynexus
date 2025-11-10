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

function tryParseJson<T = unknown>(text?: string | null): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function extractJsonPayload(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
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
    "You are Voynex, a Tokushima tourism concierge.",
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
    "You are Voynex itineraries, a planner that only outputs strict JSON.",
    "Return an object with 'timeline' (array of {time,title,duration,note}) and 'warnings' (array of strings).",
    "Durations are minutes, note is optional. Mention last bus / weather constraints in warnings if relevant.",
    `Travel window: ${payload.start} - ${payload.end}`,
    `Transport: ${payload.transport}`,
    `Budget: ¥${payload.budget}`,
    `Party: ${payload.party}`,
    `Weather: ${payload.weather}`,
    payload.tidesHint ? `Tides: ${payload.tidesHint}` : "",
    `Docs: ${docs.map((doc) => `${doc.title}:${doc.summary}`).join("|")}`
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: prompt },
      {
        role: "user",
        content:
          "Respond with valid JSON only. Example: {\"timeline\":[{\"time\":\"09:00\",\"title\":\"Naruto Whirlpool\",\"duration\":120,\"note\":\"catch 11:30 bus\"}],\"warnings\":[\"Last bus 17:30\"]}."
      }
    ]
  });

  const embeddedContent = extractOutputText(completion.output?.[0])?.trim();
  if (embeddedContent) {
    const parsed = tryParseJson(embeddedContent) ?? tryParseJson(extractJsonPayload(embeddedContent));
    if (parsed) {
      return { ...parsed, references: docs };
    }
    console.error("Failed to parse itinerary JSON", embeddedContent.slice(0, 200));
  }

  return {
    timeline: [],
    warnings: ["AI出力の解析に失敗しました。再試行してください。"],
    references: docs
  };
}
