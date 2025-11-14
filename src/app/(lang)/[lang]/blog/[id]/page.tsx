import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogId from "@/components/blog/blog-id";
import { getBlogPost, getBlogs } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";

type Props = {
  params: { lang: Locale; id: string };
};

export const revalidate = 300;

export async function generateStaticParams() {
  const { contents } = await getBlogs({ limit: 50 });
  return locales.flatMap((lang) => (contents ?? []).map((post) => ({ lang, id: post.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogPost(params.id);
  if (!blog) return {};

  const plain = blog.body ? blog.body.replace(/<[^>]+>/g, "").slice(0, 160) : undefined;

  return {
    title: blog.title,
    description: plain,
    alternates: { canonical: `/${params.lang}/blog/${params.id}` },
    openGraph: {
      title: blog.title,
      description: plain,
      type: "article",
    },
  };
}

export default async function LocaleBlogDetailPage({ params }: Props) {
  const blog = await getBlogPost(params.id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="px-4 py-10">
      <BlogId blog={blog} locale={params.lang} />
    </div>
  );
}
