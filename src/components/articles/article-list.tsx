import type { Article } from "@/lib/types/cms";
import { ArticleCard } from "./article-card";

type Props = {
  locale: string;
  articles: Article[];
  title: string;
};

export function ArticleList({ locale, articles, title }: Props) {
  return (
    <section className="mx-auto mt-10 max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <span className="text-xs uppercase text-slate-400">Curated by local editors</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>
    </section>
  );
}
