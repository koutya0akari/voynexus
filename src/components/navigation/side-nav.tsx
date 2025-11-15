"use client";

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import type { Route } from "next";
import type { Locale } from "@/lib/i18n";
import { LangSwitcher } from "./lang-switcher";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

type Props = {
  locale: Locale;
  links: { href: Route; label: string }[];
};

export function SideNav({ locale, links }: Props) {
  const pathname = usePathname();
  const t = useTranslations();

  const ctaLinks = [
    { href: `/${locale}/plan` as Route, label: t("nav.planCta"), variant: "primary" },
    { href: `/${locale}/chat` as Route, label: t("nav.chatCta"), variant: "ghost" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white/95 px-4 py-5 shadow-sm lg:flex">
      <div>
        <Link href={`/${locale}`} className="text-lg font-semibold text-slate-900">
          voynexus
        </Link>
        <p className="mt-1 text-xs text-slate-500">{t("nav.tagline")}</p>
      </div>

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
        {links.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "block rounded-xl px-3 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3">
        <LangSwitcher current={locale} />
        <ThemeToggle variant="block" />
        <UserMenu variant="block" />
        <div className="space-y-2">
          {ctaLinks.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={clsx(
                "block rounded-xl px-3 py-2 text-center text-sm font-semibold",
                cta.variant === "primary"
                  ? "bg-brand text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:border-brand hover:text-brand"
              )}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
