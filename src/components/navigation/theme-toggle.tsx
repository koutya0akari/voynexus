"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

type Theme = "light" | "dark";
type Variant = "inline" | "block";
type Props = {
  variant?: Variant;
};

const STORAGE_KEY = "voynexus-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function ThemeToggle({ variant = "inline" }: Props) {
  const [theme, setTheme] = useState<Theme>("light");
  const t = useTranslations();

  const applyTheme = (next: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (next === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const label = theme === "dark" ? t("themeToggle.toLight") : t("themeToggle.toDark");

  return (
    <button
      type="button"
      onClick={toggle}
      className={clsx(
        "flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition",
        variant === "block"
          ? "w-full border-slate-200 text-slate-600 hover:border-brand hover:text-brand"
          : "border-slate-200 text-slate-600 hover:border-brand hover:text-brand"
      )}
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? "🌙" : "☀️"} <span className="ml-1">{label}</span>
    </button>
  );
}
