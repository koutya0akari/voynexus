import { Suspense } from "react";
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

  const spotsResponse = await getSpots({ lang: params.lang, tags, area, limit: 24 });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-sm uppercase text-slate-500">Spots</p>
        <h1 className="text-3xl font-semibold text-slate-900">条件でスポットを探す</h1>
        <p className="text-sm text-slate-500">
          雨天対応 / 子連れ / 車なし / 予算などのフィルターを指定して最適な場所を見つけましょう。
        </p>
      </header>
      <Suspense fallback={<p>Loading...</p>}>
        <SpotGrid
          locale={params.lang}
          spots={spotsResponse.contents}
          title="検索結果"
        />
      </Suspense>
    </div>
  );
}
