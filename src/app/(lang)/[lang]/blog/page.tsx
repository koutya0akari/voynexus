import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { getBlogs } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";

type Props = {
  params: { lang: Locale };
};

export const revalidate = 300;

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

export default async function LocaleBlogIndexPage({ params }: Props) {
  const locale = params.lang;
  const t = await getTranslations({ locale });
  const { contents } = await getBlogs({ limit: 50 });
  const posts = contents ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase text-slate-500">{t("sections.blog")}</p>
        <h1 className="text-3xl font-semibold text-slate-900">{t("blog.spotlightTitle")}</h1>
        <p className="text-sm text-slate-500">{t("blog.listDescription")}</p>
      </header>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                <span>{post.category?.name ?? t("sections.blog")}</span>
                {post.publishedAt ? <span>{new Date(post.publishedAt).toLocaleDateString(locale)}</span> : null}
              </div>
              <Link
                href={`/${locale}/blog/${post.id}` as Route}
                className="text-2xl font-semibold text-slate-900 hover:text-brand"
              >
                {post.title}
              </Link>
              {post.body ? (
                <p className="text-sm text-slate-600">{stripHtml(post.body).slice(0, 140)}...</p>
              ) : null}
            </div>
          </li>
        ))}
        {!posts.length && (
          <li className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
            {t("blog.empty")}
          </li>
        )}
      </ul>
    </div>
  );
}
