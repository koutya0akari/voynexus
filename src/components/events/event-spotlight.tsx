import Link from "next/link";
import type { EventContent } from "@/lib/types/cms";

type Props = {
  locale: string;
  events: EventContent[];
  title: string;
};

export function EventSpotlight({ locale, events, title }: Props) {
  if (!events.length) return null;

  return (
    <section className="mx-auto mt-10 max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <Link href={`/${locale}/events`} className="text-sm font-semibold text-brand">
          All events →
        </Link>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <article key={event.id} className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">{event.dateRange}</p>
            <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
            <p className="text-sm text-slate-600">{event.summary}</p>
            <div className="mt-3 text-sm text-slate-500">
              <p>{event.rainPolicy}</p>
              <p>{event.trafficNotes}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
