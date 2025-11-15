import Image from "next/image";
import { getEvents } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";

type Props = {
  params: { lang: Locale };
};

export default async function EventsPage({ params }: Props) {
  const { contents } = await getEvents({ lang: params.lang });
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900">
        <Image
          src="/event.png"
          alt="voynexusのイベント特集イメージ"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative z-10 px-6 py-10 text-white md:px-10 md:py-14">
          <p className="text-sm uppercase text-slate-200">Events</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">イベント特集と臨時情報</h1>
        </div>
      </section>
      <div className="mt-6 grid gap-4">
        {contents.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-slate-500">{event.dateRange}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{event.title}</h2>
            <p className="text-sm text-slate-600">{event.summary}</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
              <p>雨天: {event.rainPolicy}</p>
              <p>交通: {event.trafficNotes}</p>
              <p>チケット: {event.ticketInfo}</p>
              <p>FAQ: {event.faqRefs?.length ?? 0}件</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
