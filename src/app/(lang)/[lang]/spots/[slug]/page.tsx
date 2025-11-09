import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSpotDetail } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";

type Props = {
  params: {
    lang: Locale;
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const spot = await getSpotDetail(params.slug, params.lang);
  if (!spot) {
    return {};
  }
  return {
    title: `${spot.name} | 徳島観光`,
    description: spot.summary,
    alternates: {
      canonical: `/${params.lang}/spots/${spot.slug}`
    },
    openGraph: {
      title: spot.name,
      description: spot.summary,
      type: "article",
      url: `/${params.lang}/spots/${spot.slug}`,
      images: spot.images?.[0]?.url ? [spot.images[0].url] : undefined
    }
  };
}

export default async function SpotDetailPage({ params }: Props) {
  const locale = params.lang;
  const spot = await getSpotDetail(params.slug, locale);
  const t = await getTranslations({ locale });

  if (!spot) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: spot.name,
    description: spot.summary,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/spots/${spot.slug}`,
    image: spot.images?.[0]?.url,
    areaServed: spot.area,
    accessibilitySummary: spot.accessibility
      ? Object.entries(spot.accessibility)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(", ")
      : undefined
  };

  return (
    <article className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header>
        <p className="text-sm uppercase text-slate-500">{spot.area}</p>
        <h1 className="text-3xl font-semibold text-slate-900">{spot.name}</h1>
        <p className="mt-2 text-slate-600">{spot.summary}</p>
        <div className="mt-2 text-xs text-slate-500">
          {t("spot.lastVerified")}: {spot.lastVerifiedAt && new Date(spot.lastVerifiedAt).toLocaleDateString(locale)}
        </div>
      </header>
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <div>
          <h2 className="font-semibold text-slate-900">{t("spot.access")}</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {spot.access.busLine && <li>Bus: {spot.access.busLine}</li>}
            {spot.access.stop && <li>Stop: {spot.access.stop}</li>}
            {spot.access.lastBusTime && <li>Last bus: {spot.access.lastBusTime}</li>}
            {spot.access.parking && <li>Parking: {spot.access.parking}</li>}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{t("spot.tags")}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {spot.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
      {spot.warnings?.length ? (
        <aside className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">注意事項</p>
          <ul className="list-disc pl-5">
            {spot.warnings?.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </aside>
      ) : null}
      <section>
        <h2 className="text-xl font-semibold text-slate-900">詳細情報</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{spot.openHours}</p>
        {spot.closedDays && <p className="text-sm text-slate-500">休業日: {spot.closedDays}</p>}
        {spot.price && <p className="text-sm text-slate-500">料金: {spot.price}</p>}
      </section>
      {spot.officialUrl && (
        <a href={spot.officialUrl} className="inline-flex text-brand">
          公式サイトを見る →
        </a>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
