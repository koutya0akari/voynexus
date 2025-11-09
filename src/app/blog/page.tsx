import Link from "next/link";
import { getBlogs } from "@/lib/cms";

export const revalidate = 300;

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

export default async function BlogIndexPage() {
  const { contents } = await getBlogs({ limit: 20 });
  const posts = contents ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase text-slate-500">Blog</p>
        <h1 className="text-3xl font-semibold text-slate-900">徳島の旅ブログ</h1>
        <p className="text-sm text-slate-500">microCMSで作成したブログ記事が自動でここに並びます。</p>
      </header>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                <span>{post.category?.name ?? "Blog"}</span>
                {post.publishedAt ? <span>{new Date(post.publishedAt).toLocaleDateString("ja-JP")}</span> : null}
              </div>
              <Link href={`/blog/${post.id}`} className="text-2xl font-semibold text-slate-900 hover:text-brand">
                {post.title}
              </Link>
              {post.body ? (
                <p className="text-sm text-slate-600">{stripHtml(post.body).slice(0, 120)}...</p>
              ) : null}
            </div>
          </li>
        ))}
        {!posts.length && <li className="text-center text-sm text-slate-500">投稿がまだありません。</li>}
      </ul>
    </div>
  );
}
