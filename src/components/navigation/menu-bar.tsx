import Link from "next/link";
import type { Route } from "next";

type MenuItem = {
  title: string;
  description: string;
  href: Route;
  icon?: string;
};

type Props = {
  items: MenuItem[];
  ariaLabel?: string;
};

export function MenuBar({ items, ariaLabel }: Props) {
  if (!items.length) return null;

  return (
    <nav aria-label={ariaLabel ?? "voynexus shortcuts"} className="mx-auto max-w-6xl px-4 py-4">
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg"
              aria-hidden="true"
            >
              {item.icon ?? "•"}
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
