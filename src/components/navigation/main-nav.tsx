"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n";
import type { Route } from "next";
import { LangSwitcher } from "./lang-switcher";

type Props = {
  locale: Locale;
};

export function MainNav({ locale }: Props) {
  const t = useTranslations();

  const links: { href: Route; label: string }[] = [
    { href: `/${locale}/spots` as Route, label: "Spots" },
    { href: `/${locale}/articles` as Route, label: "Articles" },
    { href: `/${locale}/plan` as Route, label: "Plan" },
    { href: `/${locale}/events` as Route, label: "Events" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${locale}`} className="font-semibold">
          Tokushima Travel
        </Link>

        <nav className="hidden items-center gap-4 text-sm md:flex">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-700 hover:text-brand">
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
    </header>
  );
}
