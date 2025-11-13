import Link from "next/link";
import { getTranslations } from "next-intl/server";

type Props = {
  locale: string;
};

export async function Footer({ locale }: Props) {
  const t = await getTranslations({ locale });
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-900">voynexus Lab</p>
          <p>{t("footer.disclaimer")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href={`/${locale}/terms`}>利用規約 / Terms</Link>
          <Link href={`/${locale}/privacy`}>プライバシー / Privacy</Link>
          <Link href={`/${locale}/disclaimer`}>免責事項</Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="mailto:info@voynexus.com">info@voynexus.com</Link>
          <Link href={`/${locale}/contact`}>Contact</Link>
          <Link href={`/${locale}/partners`}>Partners</Link>
          <Link href={`/${locale}/contact#ads`}>広告掲載・タイアップのご相談</Link>
          <Link href="/api/status">Status</Link>
        </div>
      </div>
    </footer>
  );
}
