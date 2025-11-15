import type { Spot } from "@/lib/types/cms";
import type { Locale } from "@/lib/i18n";
import { SpotCard } from "./spot-card";

type Props = {
  locale: Locale;
  spots: Spot[];
  title: string;
  subtitle: string;
  verifiedLabel: string;
  viewLabel: string;
};

export function SpotGrid({ locale, spots, title, subtitle, verifiedLabel, viewLabel }: Props) {
  return (
    <section className="mx-auto mt-10 max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            locale={locale}
            verifiedLabel={verifiedLabel}
            viewLabel={viewLabel}
          />
        ))}
      </div>
    </section>
  );
}
