import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogId from "@/components/blog/blog-id";
import { getBlogPost, getBlogs } from "@/lib/cms";

type Props = {
  params: { id: string };
};

export const revalidate = 300;

export async function generateStaticParams() {
  const { contents } = await getBlogs({ limit: 50 });
  return (contents ?? []).map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogPost(params.id);
  if (!blog) return {};

  return {
    title: blog.title,
    description: blog.body ? blog.body.replace(/<[^>]+>/g, "").slice(0, 120) : undefined,
    alternates: { canonical: `/blog/${params.id}` },
    openGraph: {
      title: blog.title,
      description: blog.body ? blog.body.replace(/<[^>]+>/g, "").slice(0, 160) : undefined,
      type: "article"
    }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const blog = await getBlogPost(params.id);

  if (!blog) {
    notFound();
  }

  return <BlogId blog={blog} />;
}
