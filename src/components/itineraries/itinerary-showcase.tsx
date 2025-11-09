import type { Itinerary } from "@/lib/types/cms";
import { ItineraryCard } from "./itinerary-card";

type Props = {
  locale: string;
  itineraries: Itinerary[];
  title: string;
};

export function ItineraryShowcase({ locale, itineraries, title }: Props) {
  return (
    <section className="mx-auto mt-10 max-w-6xl rounded-3xl bg-slate-900 px-6 py-8 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-white/70">AI + rule-based validation</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {itineraries.map((itinerary) => (
          <ItineraryCard key={itinerary.id} itinerary={itinerary} locale={locale} />
        ))}
      </div>
    </section>
  );
}
