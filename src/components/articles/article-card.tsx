import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types/cms";

type Props = {
  locale: string;
  article: Article;
};

export function ArticleCard({ locale, article }: Props) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-slate-100">
        {article.heroImage && (
          <Image src={article.heroImage} alt={article.title} fill className="object-cover" sizes="50vw" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs uppercase text-slate-500">{article.type}</span>
        <h3 className="text-lg font-semibold text-slate-900">{article.title}</h3>
        <p className="line-clamp-3 text-sm text-slate-600">{article.summary}</p>
        <div className="mt-auto">
          <Link
            href={`/${locale}/articles/${article.slug}`}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
