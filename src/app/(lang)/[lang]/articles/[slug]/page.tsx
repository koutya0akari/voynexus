import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getArticleDetail } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";
import { sanitizeRichText } from "@/lib/sanitize";

type Props = {
  params: { lang: Locale; slug: string };
};

async function fetchArticle(lang: Locale, slug: string) {
  return getArticleDetail(slug, lang);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await fetchArticle(params.lang, params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/${params.lang}/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      images: article.heroImage ? [article.heroImage] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const locale = params.lang;
  const article = await fetchArticle(locale, params.slug);
  const t = await getTranslations({ locale });

  if (!article) {
    notFound();
  }

  const sanitizedBody = sanitizeRichText(article.body);

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header>
        <p className="text-xs uppercase text-slate-500">{article.type}</p>
        <h1 className="text-3xl font-semibold text-slate-900">{article.title}</h1>
        <p className="text-sm text-slate-500">
          {new Date(article.updatedAt).toLocaleDateString(locale)} | {t("sections.latestArticles")}
        </p>
      </header>
      <section className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
      <aside className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold">旅のメモ</p>
        <p>
          紹介リンクにはvoynexus経由の目印が付きます。予約サイトでクーポンが表示されない場合は公式情報も併せてご確認ください。
        </p>
      </aside>
      {article.ctaLinks?.length ? (
        <div className="flex flex-wrap gap-3">
          {article.ctaLinks.map((cta) => (
            <a
              key={cta.url}
              href={`${cta.url}?utm_source=voynexus_app&utm_medium=referral&utm_campaign=${article.slug}`}
              className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand"
            >
              {cta.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
