import { notFound } from "next/navigation";
import { getItineraries } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";

type Props = {
  params: { lang: Locale; slug: string };
};

async function fetchItinerary(locale: Locale, slug: string) {
  const { contents } = await getItineraries({ lang: locale, limit: 50 });
  return contents.find((item) => item.slug === slug);
}

export default async function ItineraryDetailPage({ params }: Props) {
  const itinerary = await fetchItinerary(params.lang, params.slug);
  if (!itinerary) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header>
        <p className="text-sm uppercase text-slate-500">Itinerary</p>
        <h1 className="text-3xl font-semibold text-slate-900">{itinerary.title}</h1>
        <p className="text-slate-600">{itinerary.summary}</p>
        <p className="text-sm text-slate-500">
          {Math.round(itinerary.totalTime / 60)}h / ¥{itinerary.budget.toLocaleString()}
        </p>
      </header>
      <section className="space-y-3">
        {itinerary.timeline.map((block) => (
          <div
            key={block.time}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{block.time}</span>
              <span>
                {block.stayMin}min + 移動 {block.moveMin}min
              </span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{block.spotRef}</p>
            <p className="text-sm text-slate-600">{block.note}</p>
          </div>
        ))}
      </section>
      {itinerary.warnings?.length ? (
        <aside className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">注意事項</p>
          <ul className="list-disc pl-5">
            {itinerary.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </aside>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button className="rounded-full border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900">
          アプリに保存
        </button>
        <button className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand">
          PDFでシェア
        </button>
      </div>
    </article>
  );
}
