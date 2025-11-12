import type { MetadataRoute } from "next";
import { getArticles, getItineraries, getSpots } from "@/lib/cms";
import { locales } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://voynezusus.com";

const toDate = (value?: string) => (value ? new Date(value) : undefined);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
  ];

  for (const locale of locales) {
    const [spots, articles, itineraries] = await Promise.all([
      getSpots({ lang: locale, limit: 100 }),
      getArticles({ lang: locale, limit: 100 }),
      getItineraries({ lang: locale, limit: 100 }),
    ]);

    entries.push({
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
    });

    spots.contents.forEach((spot) => {
      entries.push({
        url: `${siteUrl}/${locale}/spots/${spot.slug}`,
        lastModified: toDate(spot.updatedAt),
      });
    });

    articles.contents.forEach((article) => {
      entries.push({
        url: `${siteUrl}/${locale}/articles/${article.slug}`,
        lastModified: toDate(article.updatedAt),
      });
    });

    itineraries.contents.forEach((itinerary) => {
      entries.push({
        url: `${siteUrl}/${locale}/itineraries/${itinerary.slug}`,
        lastModified: toDate(itinerary.updatedAt),
      });
    });
  }

  return entries;
}
