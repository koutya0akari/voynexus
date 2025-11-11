import fs from "node:fs/promises";
import { getArticles, getItineraries, getSpots } from "../src/lib/cms";
import { locales } from "../src/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://voynexus.com";

async function main() {
  const chunks: string[] = [];
  for (const locale of locales) {
    chunks.push(`<url><loc>${siteUrl}/${locale}</loc></url>`);
    const [spots, articles, itineraries] = await Promise.all([
      getSpots({ lang: locale, limit: 100 }),
      getArticles({ lang: locale, limit: 100 }),
      getItineraries({ lang: locale, limit: 100 })
    ]);
    spots.contents.forEach((spot) =>
      chunks.push(`<url><loc>${siteUrl}/${locale}/spots/${spot.slug}</loc></url>`)
    );
    articles.contents.forEach((article) =>
      chunks.push(`<url><loc>${siteUrl}/${locale}/articles/${article.slug}</loc></url>`)
    );
    itineraries.contents.forEach((itinerary) =>
      chunks.push(`<url><loc>${siteUrl}/${locale}/itineraries/${itinerary.slug}</loc></url>`)
    );
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunks.join(
    "\n"
  )}\n</urlset>`;

  await fs.writeFile("public/sitemap.xml", sitemap);
  console.log("Generated sitemap.xml");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
