import Link from "next/link";
import type { Route } from "next";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { Blog } from "@/lib/types/cms";

type Props = {
  locale: Locale;
  posts: Blog[];
  title: string;
  description?: string;
  ctaLabel: string;
  emptyMessage: string;
  tip?: string;
  variant?: "default" | "compact";
};

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

function costLocale(locale: Locale) {
  if (locale === "en") return "en-US";
  if (locale === "zh") return "zh-TW";
  return "ja-JP";
}

function formatCost(cost: number | undefined, locale: Locale) {
  if (typeof cost !== "number") return null;
  return new Intl.NumberFormat(costLocale(locale), {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(cost);
}

export function BlogSpotlight({
  locale,
  posts,
  title,
  description,
  ctaLabel,
  emptyMessage,
  tip,
  variant = "default",
}: Props) {
  const isCompact = variant === "compact";
  const visiblePosts = posts.slice(0, isCompact ? 2 : 3);
  const containerClasses = clsx(
    "flex h-full flex-col rounded-3xl border border-slate-200 bg-white/80 shadow-sm",
    isCompact ? "gap-3 p-4" : "gap-4 p-6"
  );
  const cardClasses = clsx(
    "rounded-2xl border border-slate-100 bg-white/70",
    isCompact ? "p-3" : "p-4"
  );

  return (
    <aside className={containerClasses}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={clsx("font-semibold text-slate-900", isCompact ? "text-base" : "text-lg")}>
            {title}
          </h2>
          {description ? (
            <p className={clsx("text-slate-500", isCompact ? "text-xs" : "text-sm")}>
              {description}
            </p>
          ) : null}
        </div>
        <Link
          href={`/${locale}/blog` as Route}
          className={clsx(
            "text-brand",
            isCompact ? "text-xs font-semibold" : "text-sm font-semibold"
          )}
        >
          {ctaLabel} →
        </Link>
      </div>
      {visiblePosts.length ? (
        <div className={clsx("space-y-3", !isCompact && "space-y-4")}>
          {visiblePosts.map((post) => {
            const formattedCost = formatCost(post.cost, locale);
            const tags = post.tags?.slice(0, isCompact ? 2 : 3);
            return (
              <article key={post.id} className={cardClasses}>
                {post.eyecatch?.url ? (
                  <div className="mb-2 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.eyecatch.url}
                      alt={post.title}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                ) : null}
                <p className="text-[10px] uppercase text-slate-400">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale) : "New"}
                </p>
                <Link
                  href={`/${locale}/blog/${post.id}` as Route}
                  className={clsx(
                    "font-semibold text-slate-900 hover:text-brand",
                    isCompact ? "text-sm" : "text-base"
                  )}
                >
                  {post.title}
                </Link>
                {post.studentId ? (
                  <p className={clsx("text-slate-500", isCompact ? "text-[11px]" : "text-xs")}>
                    {post.studentId}
                  </p>
                ) : null}
                {post.category?.name ? (
                  <p className={clsx("text-slate-500", isCompact ? "text-[11px]" : "text-xs")}>
                    {post.category.name}
                  </p>
                ) : null}
                {formattedCost ? (
                  <p
                    className={clsx("font-semibold text-brand", isCompact ? "text-xs" : "text-sm")}
                  >
                    {formattedCost}
                  </p>
                ) : null}
                {post.body ? (
                  <p
                    className={clsx("text-slate-600", isCompact ? "mt-1 text-xs" : "mt-2 text-sm")}
                  >
                    {stripHtml(post.body).slice(0, isCompact ? 60 : 80)}...
                  </p>
                ) : null}
                {tags?.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={`${post.id}-${tag}`}
                        className={clsx(
                          "rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600",
                          isCompact ? "text-[10px]" : "text-[11px]"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div
          className={clsx(
            "rounded-2xl border border-dashed border-slate-200 text-slate-500",
            isCompact ? "p-3 text-xs" : "p-4 text-sm"
          )}
        >
          <p className={isCompact ? "text-xs" : "text-sm"}>{emptyMessage}</p>
        </div>
      )}
      {tip ? (
        <div
          className={clsx(
            "rounded-2xl bg-slate-900/90 text-white",
            isCompact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
          )}
        >
          {tip}
        </div>
      ) : null}
    </aside>
  );
}
