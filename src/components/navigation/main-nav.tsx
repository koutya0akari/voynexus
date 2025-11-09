"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n";
import { LangSwitcher } from "./lang-switcher";

type Props = {
  locale: Locale;
};

export function MainNav({ locale }: Props) {
  const t = useTranslations();

  const primaryLinks: { href: string; label: string }[] = [
    { href: `/${locale}`, label: "Home" },
    { href: `/${locale}/spots`, label: "Spots" },
    { href: `/${locale}/articles`, label: "Articles" },
    { href: `/${locale}/events`, label: "Events" },
    { href: `/${locale}/plan`, label: "Plan" },
    { href: "/blog", label: "Blog" }
  ];

  const secondaryLinks: { href: string; label: string }[] = [
    { href: `/${locale}/chat`, label: t("cta.chat") },
    { href: `/${locale}/contact`, label: "Contact" },
    { href: "/blog", label: "Blog" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href={`/${locale}`} className="font-semibold">
              Tokushima Travel
            </Link>
            <p className="hidden text-xs text-slate-500 md:block">Local picks · AI concierge · Blog</p>
          </div>

          <nav className="hidden items-center gap-4 text-sm md:flex">
            {primaryLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-700 transition hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/plan`}
              className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand/90 md:inline-flex"
            >
              {t("cta.planTrip")}
            </Link>
            <LangSwitcher current={locale} />
          </div>
        </div>
        <div className="mt-2 hidden items-center gap-3 text-xs text-slate-500 md:flex">
          {secondaryLinks.map((item) => (
            <Link key={item.href} href={item.href} className="inline-flex items-center gap-1 text-slate-500 hover:text-brand">
              <span className="h-2 w-2 rounded-full bg-slate-200" />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 md:hidden">
          {[...primaryLinks, ...secondaryLinks].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full border border-slate-200 px-3 py-1">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
