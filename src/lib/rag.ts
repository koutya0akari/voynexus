import type { Locale } from "@/lib/i18n";

export type RagDocument = {
  id: string;
  type: "spot" | "article" | "itinerary";
  title: string;
  summary: string;
  url: string;
  lang: Locale;
};

const fallbackDocs: RagDocument[] = [
  {
    id: "seaside-guide",
    type: "spot",
    title: "ベイエリアクルーズの見頃",
    summary: "潮位に合わせたおすすめ時間帯と雨天時の代替案を紹介。",
    url: "/ja/spots/seaside-sunrise",
    lang: "ja",
  },
];

export async function searchRag(query: string, lang: Locale): Promise<RagDocument[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return fallbackDocs.filter((doc) => doc.lang === lang);
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/vector-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query, lang, topK: 5 }),
    });

    if (!response.ok) {
      throw new Error("Failed to query vector DB");
    }

    const data = await response.json();
    return data.matches as RagDocument[];
  } catch (error) {
    console.error("RAG fallback", error);
    return fallbackDocs.filter((doc) => doc.lang === lang);
  }
}
