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
  const paragraphs = safeBody.match(/<p[\s\S]*?<\/p>/g);
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

  const sponsorInsertIndex =
    paragraphs && paragraphs.length > 1 ? Math.floor(paragraphs.length / 2) : 0;

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{blog.title}</h1>
      {blog.publishedAt ? (
        <p className={styles.publishedAt}>
          {new Date(blog.publishedAt).toLocaleDateString("ja-JP")}
        </p>
      ) : null}
      {blog.category?.name ? <p className={styles.category}>{blog.category.name}</p> : null}
      <div className={styles.post}>
        {paragraphs ? (
          paragraphs.map((paragraph, index) => (
            <Fragment key={`paragraph-${index}`}>
              <div dangerouslySetInnerHTML={{ __html: paragraph }} />
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
