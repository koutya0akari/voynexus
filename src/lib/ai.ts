import OpenAI from "openai";
import type { Locale } from "@/lib/i18n";
import { searchRag } from "@/lib/rag";

const openAiKey = process.env.OPENAI_API_KEY;
const client = openAiKey ? new OpenAI({ apiKey: openAiKey }) : null;

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

  const text = completion.output?.[0]?.content?.[0];
  const answer = typeof text === "object" && text?.type === "output_text" ? text.text : "情報を取得できませんでした。";

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
    ],
    response_format: { type: "json_object" }
  });

  const text = completion.output?.[0]?.content?.[0];
  if (typeof text === "object" && text?.type === "output_text") {
    try {
      const parsed = JSON.parse(text.text);
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
