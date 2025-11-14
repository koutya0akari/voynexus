import Link from "next/link";
import { Fragment } from "react";
import { sanitizeRichText } from "@/lib/sanitize";
import type { Blog } from "@/lib/types/cms";
import type { Locale } from "@/lib/i18n";
import styles from "./blog-id.module.css";

type Props = {
  blog: Blog;
  locale: Locale;
};

const copy: Record<Locale, { author: string; cost: string; tags: string; gallery: string }> = {
  ja: {
    author: "執筆",
    cost: "旅費目安",
    tags: "タグ",
    gallery: "フォトレポート",
  },
  en: {
    author: "Written by",
    cost: "Approx. budget",
    tags: "Tags",
    gallery: "Photo report",
  },
  zh: {
    author: "作者",
    cost: "預算目安",
    tags: "標籤",
    gallery: "照片報導",
  },
};

const dateLocaleMap: Record<Locale, string> = { ja: "ja-JP", en: "en-US", zh: "zh-TW" };

export default function BlogId({ blog, locale }: Props) {
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
  const localeCopy = copy[locale] ?? copy.ja;
  const dateLocale = dateLocaleMap[locale] ?? dateLocaleMap.ja;
  const formattedCost =
    typeof blog.cost === "number"
      ? new Intl.NumberFormat(dateLocale, {
          style: "currency",
          currency: "JPY",
          maximumFractionDigits: 0,
        }).format(blog.cost)
      : null;
  const tags = blog.tags?.map((tag) => tag.trim()).filter(Boolean);

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
          {new Date(blog.publishedAt).toLocaleDateString(dateLocale)}
        </p>
      ) : null}
      {blog.category?.name ? <p className={styles.category}>{blog.category.name}</p> : null}
      {(blog.studentId || formattedCost || (tags?.length ?? 0) > 0) && (
        <section className={styles.meta}>
          {blog.studentId ? (
            <div className={styles.metaItem}>
              <p className={styles.metaLabel}>{localeCopy.author}</p>
              <p className={styles.metaValue}>{blog.studentId}</p>
            </div>
          ) : null}
          {formattedCost ? (
            <div className={styles.metaItem}>
              <p className={styles.metaLabel}>{localeCopy.cost}</p>
              <p className={styles.metaValue}>{formattedCost}</p>
            </div>
          ) : null}
          {tags?.length ? (
            <div className={styles.metaItem}>
              <p className={styles.metaLabel}>{localeCopy.tags}</p>
              <div className={styles.tags}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}
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
      {blog.pictures?.length ? (
        <section className={styles.gallery}>
          <h2 className={styles.galleryTitle}>{localeCopy.gallery}</h2>
          <div className={styles.galleryGrid}>
            {blog.pictures.map((picture, index) => (
              <figure key={`${picture.url}-${index}`} className={styles.galleryItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={picture.url}
                  alt={picture.alt ?? blog.title}
                  loading="lazy"
                  decoding="async"
                />
                {picture.alt ? <figcaption>{picture.alt}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
