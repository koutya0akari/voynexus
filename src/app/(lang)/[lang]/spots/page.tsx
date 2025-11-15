import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getSpots } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";
import { SpotGrid } from "@/components/spots/spot-grid";

type Props = {
  params: { lang: Locale };
  searchParams: { tags?: string; area?: string };
};

export default async function SpotsPage({ params, searchParams }: Props) {
  const tags = searchParams.tags?.split(",").filter(Boolean);
  const area = searchParams.area;
  const t = await getTranslations({ locale: params.lang });

  const spotsResponse = await getSpots({ lang: params.lang, tags, area, limit: 24 });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-sm uppercase text-slate-500">{t("spotsPage.eyebrow")}</p>
        <h1 className="text-3xl font-semibold text-slate-900">{t("spotsPage.title")}</h1>
        <p className="text-sm text-slate-500">{t("spotsPage.description")}</p>
      </header>
      <Suspense fallback={<p>{t("spotsPage.loading")}</p>}>
        <SpotGrid
          locale={params.lang}
          spots={spotsResponse.contents}
          title={t("spotsPage.resultsTitle")}
          subtitle={t("spotGrid.subtitle")}
          verifiedLabel={t("spot.lastVerified")}
          viewLabel={t("spotCard.view")}
        />
      </Suspense>
    </div>
  );
}
