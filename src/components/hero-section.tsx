import Link from "next/link";
import clsx from "clsx";

type Props = {
  locale: string;
  title: string;
  description: string;
  ctaPlan: string;
  ctaChat: string;
  className?: string;
};

export function HeroSection({ locale, title, description, ctaPlan, ctaChat, className }: Props) {
  return (
    <section
      className={clsx(
        "flex w-full flex-col gap-6 rounded-3xl bg-gradient-to-r from-brand to-slate-900 px-6 py-10 text-white md:flex-row md:items-center",
        className
      )}
    >
      <div className="flex-1 space-y-4">
        <p className="text-sm uppercase tracking-wide">Voynezus</p>
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="text-lg text-white/80">{description}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/plan`}
            className="rounded-full bg-white px-5 py-2 font-semibold text-brand shadow-lg shadow-brand/30"
          >
            {ctaPlan}
          </Link>
          <Link
            href={`/${locale}/chat`}
            className="rounded-full border border-white/40 px-5 py-2 font-semibold text-white"
          >
            {ctaChat}
          </Link>
        </div>
      </div>
      <div className="flex-1 rounded-2xl bg-white/10 p-4 text-sm text-white/80">
        <p className="font-semibold">Travel-ready AI concierge</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Routes that adjust automatically to weather, tides, and closures</li>
          <li>Offline-friendly notes with taxi phrases and bus stops</li>
          <li>Alerts for crowds, ticket limits, and last trains</li>
        </ul>
      </div>
    </section>
  );
}
