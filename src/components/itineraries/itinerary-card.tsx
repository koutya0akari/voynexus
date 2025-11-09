import Link from "next/link";
import type { Itinerary } from "@/lib/types/cms";

type Props = {
  locale: string;
  itinerary: Itinerary;
};

export function ItineraryCard({ locale, itinerary }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-900/90 p-4 text-white">
      <div className="flex items-center justify-between text-xs uppercase text-white/70">
        <span>{itinerary.transport}</span>
        <span>{Math.round(itinerary.totalTime / 60)}h</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold">{itinerary.title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-white/80">
        {itinerary.timeline.slice(0, 3).map((block) => (
          <li key={block.time} className="flex items-center gap-2">
            <span className="font-mono text-xs text-white/60">{block.time}</span>
            <span>{block.spotRef}</span>
            <span className="text-white/60">{block.stayMin} min</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/${locale}/itineraries/${itinerary.slug}`}
        className="mt-4 inline-flex text-sm font-semibold text-accent hover:underline"
      >
        View details →
      </Link>
    </article>
  );
}
