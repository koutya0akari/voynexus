"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Route } from "next";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { LangSwitcher } from "./lang-switcher";
import { UserMenu } from "./user-menu";
import { SideNav } from "./side-nav";

type Props = {
  locale: Locale;
};

export function MainNav({ locale }: Props) {
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryLinks: { href: Route; label: string }[] = [
    { href: `/${locale}` as Route, label: t("nav.home") },
    { href: `/${locale}/spots` as Route, label: t("nav.spots") },
    { href: `/${locale}/articles` as Route, label: t("nav.articles") },
    { href: `/${locale}/events` as Route, label: t("nav.events") },
    { href: `/${locale}/plan` as Route, label: t("nav.plan") },
    { href: `/${locale}/blog` as Route, label: t("nav.blog") },
    { href: `/${locale}/blog/tokushima` as Route, label: t("nav.blogTokushima") },
  ];

  const secondaryLinks: { href: Route; label: string }[] = [
    { href: `/${locale}/chat` as Route, label: t("cta.chat") },
    { href: `/${locale}/upgrade` as Route, label: t("nav.membership") },
    { href: `/${locale}/partners` as Route, label: t("nav.partners") },
    { href: `/${locale}/contact` as Route, label: t("nav.contact") },
  ];

  const navItems: { href: Route; label: string }[] = [...primaryLinks];
  secondaryLinks.forEach((item) => {
    if (!navItems.find((entry) => entry.href === item.href)) {
      navItems.push(item);
    }
  });

  const handleMobileNavigate = () => setMobileMenuOpen(false);

  return (
    <>
      <SideNav locale={locale} links={navItems} />
      <nav className="border-b border-slate-100 bg-white/95 px-4 py-3 shadow-sm lg:hidden">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="font-semibold">
            voynexus
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
            aria-expanded={mobileMenuOpen}
            aria-label={t("nav.menu")}
          >
            {mobileMenuOpen ? t("nav.closeMenu") : t("nav.menu")}
          </button>
        </div>
        <div
          className={clsx("mt-3 flex-col gap-3", mobileMenuOpen ? "flex" : "hidden")}
          style={{ maxHeight: "calc(100vh - 6rem)", overflowY: "auto" }}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">{t("nav.languages")}</p>
            <div className="mt-2">
              <LangSwitcher current={locale} />
            </div>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMobileNavigate}
                className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">{t("nav.account")}</p>
            <div className="mt-3">
              <UserMenu variant="block" />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
