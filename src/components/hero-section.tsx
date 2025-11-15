import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

type Props = {
  locale: string;
  title: string;
  description: string;
  ctaPlan: string;
  ctaChat: string;
  sidebarTitle: string;
  sidebarItems: string[];
  imageAlt: string;
  className?: string;
};

export function HeroSection({
  locale,
  title,
  description,
  ctaPlan,
  ctaChat,
  sidebarTitle,
  sidebarItems,
  imageAlt,
  className,
}: Props) {
  return (
    <section
      className={clsx(
        "relative flex w-full flex-col gap-6 overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white md:flex-row md:items-center",
        className
      )}
    >
      <Image src="/home.png" alt={imageAlt} fill className="object-cover" priority />
      <div className="absolute inset-0 bg-slate-900/60" />
      <div className="relative z-10 flex-1 space-y-4">
        <p className="text-sm uppercase tracking-wide">voynexus</p>
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
      <div className="relative z-10 flex-1 rounded-2xl bg-white/10 p-4 text-sm text-white/80">
        <p className="font-semibold">{sidebarTitle}</p>
        <ul className="list-disc space-y-1 pl-5">
          {sidebarItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
