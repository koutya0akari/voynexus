import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { getBlogs } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";
import type { Blog } from "@/lib/types/cms";

type Props = {
  params: { lang: Locale };
};

export const revalidate = 300;

const TOKUSHIMA_KEYWORDS = ["tokushima", "徳島", "awa", "阿波", "naruto", "鳴門"];

function stripHtml(value = "") {
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

function containsTokushima(text?: string | null) {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return TOKUSHIMA_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function isTokushimaPost(post: Blog) {
  if (containsTokushima(post.title)) return true;
  if (containsTokushima(post.category?.name)) return true;
  if (post.tags?.some((tag) => containsTokushima(tag))) return true;
  if (containsTokushima(stripHtml(post.body))) return true;
  if (containsTokushima(stripHtml(post.content))) return true;
  return false;
}

export default async function TokushimaBlogPage({ params }: Props) {
  const locale = params.lang;
  const t = await getTranslations({ locale });
  const { contents } = await getBlogs({ limit: 50 });
  const posts = (contents ?? []).filter((post) => isTokushimaPost(post));

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="relative h-60 w-full md:h-72">
          <Image
            src="/blog_tokushima.png"
            alt="voynexus徳島ローカルブログの背景"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/60" />
          <div className="relative z-10 flex h-full flex-col justify-end space-y-2 px-6 py-8 text-white md:px-10">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-200">
              {t("blogTokushima.badge")}
            </p>
            <h1 className="text-3xl font-semibold">{t("blogTokushima.title")}</h1>
            <p className="text-sm text-white/85">{t("blogTokushima.description")}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-600 md:max-w-xl">{t("blogTokushima.listDescription")}</p>
        <Link
          href={`/${locale}/blog` as Route}
          className="inline-flex items-center justify-center rounded-full border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
        >
          {t("blogTokushima.ctaNational")} →
        </Link>
      </div>

      <ul className="space-y-5">
        {posts.map((post) => {
          const formattedCost = formatCost(post.cost, locale);
          return (
            <li
              key={post.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-2">
                {post.eyecatch?.url ? (
                  <div className="overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.eyecatch.url}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                  <span>{post.category?.name ?? t("sections.blogTokushima")}</span>
                  {post.publishedAt ? (
                    <span>{new Date(post.publishedAt).toLocaleDateString(locale)}</span>
                  ) : null}
                </div>
                <Link
                  href={`/${locale}/blog/${post.id}` as Route}
                  className="text-2xl font-semibold text-slate-900 hover:text-brand"
                >
                  {post.title}
                </Link>
                {post.studentId ? (
                  <p className="text-xs font-medium text-slate-500">{post.studentId}</p>
                ) : null}
                {formattedCost ? (
                  <p className="text-sm font-semibold text-brand">{formattedCost}</p>
                ) : null}
                {post.body ? (
                  <p className="text-sm text-slate-600">{stripHtml(post.body).slice(0, 140)}...</p>
                ) : null}
                {post.tags?.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={`${post.id}-${tag}`}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
        {!posts.length && (
          <li className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
            {t("blogTokushima.empty")}
          </li>
        )}
      </ul>
    </div>
  );
}
