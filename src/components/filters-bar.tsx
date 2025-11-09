"use client";

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import clsx from "clsx";

export type FilterValue = {
  kidFriendly: boolean;
  noCar: boolean;
  rainy: boolean;
  lowBudget: boolean;
  duration: "half" | "full" | "multi";
};

const defaultFilters: FilterValue = {
  kidFriendly: false,
  noCar: false,
  rainy: false,
  lowBudget: false,
  duration: "half"
};

type Props = {
  onChange?: (filters: FilterValue) => void;
};

export function FiltersBar({ onChange }: Props) {
  const t = useTranslations();
  const [filters, setFilters] = useState<FilterValue>(defaultFilters);

  const toggle = (key: keyof FilterValue) => {
    const next = { ...filters, [key]: !filters[key] };
    setFilters(next);
    onChange?.(next);
  };

  return (
    <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">{t("filters.title")}</p>
      {(["kidFriendly", "noCar", "rainy", "lowBudget"] as const).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => toggle(key)}
          className={clsx(
            "rounded-full px-3 py-1 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand",
            filters[key] ? "bg-brand text-white shadow-brand/40" : "bg-slate-100 text-slate-600"
          )}
        >
          {t(`filters.${key}`)}
        </button>
      ))}
    </div>
  );
}
