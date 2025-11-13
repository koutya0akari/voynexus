import type { Spot } from "@/lib/types/cms";
import { SpotCard } from "./spot-card";

type Props = {
  locale: string;
  spots: Spot[];
  title: string;
};

export function SpotGrid({ locale, spots, title }: Props) {
  return (
    <section className="mx-auto mt-10 max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">最終訪問日と注意点を現地スタッフが確認済み</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} locale={locale} />
        ))}
      </div>
    </section>
  );
}
