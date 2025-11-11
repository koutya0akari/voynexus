"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Route } from "next";
import type { Locale } from "@/lib/i18n";
import { LangSwitcher } from "./lang-switcher";
import { UserMenu } from "./user-menu";

type Props = {
  locale: Locale;
};

export function MainNav({ locale }: Props) {
  const t = useTranslations();

  const primaryLinks: { href: Route; label: string }[] = [
    { href: `/${locale}` as Route, label: "Home" },
    { href: `/${locale}/spots` as Route, label: "Spots" },
    { href: `/${locale}/articles` as Route, label: "Articles" },
    { href: `/${locale}/events` as Route, label: "Events" },
    { href: `/${locale}/plan` as Route, label: "Plan" },
    { href: `/${locale}/blog` as Route, label: "Blog" }
  ];

  const secondaryLinks: { href: Route; label: string }[] = [
    { href: `/${locale}/chat` as Route, label: t("cta.chat") },
    { href: `/${locale}/contact` as Route, label: "Contact" },
    { href: `/${locale}/blog` as Route, label: "Blog" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href={`/${locale}`} className="font-semibold">
              Voynex
            </Link>
            <p className="hidden text-xs text-slate-500 md:block">Voynex Travel OS · Local data · AI concierge</p>
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
            <UserMenu />
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
