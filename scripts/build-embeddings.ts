import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { getArticles, getItineraries, getSpots } from "../src/lib/cms";
import type { Locale } from "../src/lib/i18n";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function collectTexts() {
  const locales: Locale[] = ["ja", "en", "zh"];
  const all = [];
  for (const locale of locales) {
    const [spots, itineraries, articles] = await Promise.all([
      getSpots({ lang: locale, limit: 100 }),
      getItineraries({ lang: locale, limit: 100 }),
      getArticles({ lang: locale, limit: 100 })
    ]);
    all.push(
      ...spots.contents.map((spot) => ({
        id: spot.id,
        type: "spot",
        lang: locale,
        text: `${spot.title}\n${spot.summary}\n${spot.tags.join(",")}`
      })),
      ...itineraries.contents.map((itinerary) => ({
        id: itinerary.id,
        type: "itinerary",
        lang: locale,
        text: `${itinerary.title}\n${itinerary.summary}\n${itinerary.timeline
          .map((stop) => stop.note)
          .join(" ")}`
      })),
      ...articles.contents.map((article) => ({
        id: article.id,
        type: "article",
        lang: locale,
        text: `${article.title}\n${article.summary}`
      }))
    );
  }
  return all;
}

async function main() {
  const entries = await collectTexts();
  if (!client) {
    console.warn("OPENAI_API_KEY not set. Writing plain text without embeddings.");
    await fs.mkdir("data", { recursive: true });
    await fs.writeFile(path.join("data", "embeddings.json"), JSON.stringify({ entries }, null, 2));
    return;
  }

  const payload = [];
  for (const entry of entries) {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: entry.text
    });
    payload.push({
      ...entry,
      embedding: response.data[0]?.embedding ?? []
    });
  }

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(path.join("data", "embeddings.json"), JSON.stringify({ entries: payload }, null, 2));
  console.log(`Saved ${payload.length} embeddings.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
