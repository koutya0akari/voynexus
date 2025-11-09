import Link from "next/link";
import type { Blog } from "@/lib/types/cms";

type Props = {
  posts: Blog[];
};

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

export function BlogSpotlight({ posts }: Props) {
  const visiblePosts = posts.slice(0, 3);

  return (
    <aside className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Travel Blog</h2>
        <Link href="/blog" className="text-sm font-semibold text-brand">
          View all →
        </Link>
      </div>
      {visiblePosts.length ? (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-slate-100 bg-white/70 p-4">
              <p className="text-xs uppercase text-slate-400">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ja-JP") : "New"}
              </p>
              <Link href={`/blog/${post.id}`} className="text-base font-semibold text-slate-900 hover:text-brand">
                {post.title}
              </Link>
              {post.category?.name ? <p className="text-xs text-slate-500">{post.category.name}</p> : null}
              {post.body ? <p className="mt-2 text-sm text-slate-600">{stripHtml(post.body).slice(0, 80)}...</p> : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          <p>microCMSにブログ記事を公開するとここに最新3件が表示されます。</p>
        </div>
      )}
      <div className="rounded-2xl bg-slate-900/90 px-4 py-3 text-sm text-white">
        ブログはCMSから直接編集でき、PWAでもすぐに反映されます。
      </div>
    </aside>
  );
}
