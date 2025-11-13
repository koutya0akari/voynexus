import Link from "next/link";
import { Fragment } from "react";
import { sanitizeRichText } from "@/lib/sanitize";
import type { Blog } from "@/lib/types/cms";
import styles from "./blog-id.module.css";

type Props = {
  blog: Blog;
};

export default function BlogId({ blog }: Props) {
  const safeBody = sanitizeRichText(blog.body ?? "");
  const segments = safeBody
    .split(/(?=<(?:p|figure|img|blockquote|h2|h3|h4|ul|ol|pre|code))/gi)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const sponsorBlock = (
    <aside className={styles.sponsor}>
      <p className={styles.sponsorBadge}>Sponsored</p>
      <h3 className={styles.sponsorTitle}>施設・自治体向けサポート</h3>
      <p className={styles.sponsorBody}>
        FAQやAIチャットをサイトに埋め込むと、営業時間外でも旅行者の問い合わせを自動対応できます。
        サイトにタグを1つ貼るだけで導入は完了します。
      </p>
      <div className={styles.sponsorActions}>
        <Link href="/ja/partners" className={styles.primaryCta}>
          仕組みを見る
        </Link>
        <Link href="/ja/contact?topic=sponsor" className={styles.secondaryCta}>
          担当者に相談
        </Link>
      </div>
    </aside>
  );

  const sponsorInsertIndex = segments.length > 1 ? Math.floor(segments.length / 2) : 0;

  return (
    <main className={styles.main}>
      {blog.eyecatch?.url ? (
        <div className={styles.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={blog.eyecatch.url} alt={blog.title} />
        </div>
      ) : null}
      <h1 className={styles.title}>{blog.title}</h1>
      {blog.publishedAt ? (
        <p className={styles.publishedAt}>
          {new Date(blog.publishedAt).toLocaleDateString("ja-JP")}
        </p>
      ) : null}
      {blog.category?.name ? <p className={styles.category}>{blog.category.name}</p> : null}
      <div className={styles.post}>
        {segments.length ? (
          segments.map((segment, index) => (
            <Fragment key={`segment-${index}`}>
              <div dangerouslySetInnerHTML={{ __html: segment }} />
              {index === sponsorInsertIndex ? sponsorBlock : null}
            </Fragment>
          ))
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: safeBody }} />
            {sponsorBlock}
          </>
        )}
      </div>
    </main>
  );
}
