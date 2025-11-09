import { sanitizeRichText } from "@/lib/sanitize";
import type { Blog } from "@/lib/types/cms";
import styles from "./blog-id.module.css";

type Props = {
  blog: Blog;
};

export default function BlogId({ blog }: Props) {
  const safeBody = sanitizeRichText(blog.body ?? "");

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{blog.title}</h1>
      {blog.publishedAt ? (
        <p className={styles.publishedAt}>{new Date(blog.publishedAt).toLocaleDateString("ja-JP")}</p>
      ) : null}
      {blog.category?.name ? <p className={styles.category}>{blog.category.name}</p> : null}
      <div className={styles.post} dangerouslySetInnerHTML={{ __html: safeBody }} />
    </main>
  );
}
