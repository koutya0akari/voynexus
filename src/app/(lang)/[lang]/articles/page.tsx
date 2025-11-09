import { getArticles } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";
import { ArticleList } from "@/components/articles/article-list";

type Props = {
  params: { lang: Locale };
  searchParams: { q?: string; type?: string };
};

export default async function ArticlesPage({ params, searchParams }: Props) {
  const { contents } = await getArticles({
    lang: params.lang,
    q: searchParams.q,
    type: searchParams.type,
    limit: 24
  });

  return (
    <div className="space-y-8 px-4 py-8">
      <header className="mx-auto max-w-4xl text-center">
        <p className="text-sm uppercase text-slate-500">Articles</p>
        <h1 className="text-3xl font-semibold text-slate-900">学生ライターと連携した現地記事</h1>
        <p className="text-sm text-slate-500">
          microCMS上のドラフトは`/api/preview`経由で確認できます。公開後はISRで30分キャッシュ。
        </p>
      </header>
      <ArticleList locale={params.lang} articles={contents} title="記事一覧" />
    </div>
  );
}
