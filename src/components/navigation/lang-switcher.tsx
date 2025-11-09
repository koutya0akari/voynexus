"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { locales, type Locale } from "@/lib/i18n";
import type { Route } from "next";

type Props = {
  current: Locale;
};

export function LangSwitcher({ current }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm">
      {locales.map((locale) => {
        const computedPath =
          pathname && pathname.startsWith(`/${current}`)
            ? pathname.replace(`/${current}`, `/${locale}`)
            : `/${locale}`;
        const nextPath = computedPath as Route;
        return (
          <Link
            key={locale}
            href={nextPath}
            prefetch
            className={clsx(
              "rounded-full px-2 py-0.5 font-medium transition",
              current === locale ? "bg-brand text-white" : "text-slate-600 hover:text-brand"
            )}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
