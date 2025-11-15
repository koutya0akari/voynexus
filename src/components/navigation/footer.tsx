import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { UrlObject } from "url";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export async function Footer({ locale }: Props) {
  const t = await getTranslations({ locale });
  const localizedHref = (pathname: `/${string}`): UrlObject => ({ pathname });
  const withHash = (pathname: `/${string}`, hash: string): UrlObject => ({ pathname, hash });
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-slate-600 md:grid-cols-[2fr,1fr,1fr]">
        <div className="space-y-2 text-pretty leading-relaxed">
          <p className="font-semibold text-slate-900">voynexus Lab</p>
          <p>{t("footer.disclaimer")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href={localizedHref(`/${locale}/terms`)}>利用規約 / Terms</Link>
          <Link href={localizedHref(`/${locale}/privacy`)}>プライバシー / Privacy</Link>
          <Link href={localizedHref(`/${locale}/disclaimer`)}>免責事項</Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="mailto:info@voynexus.com">info@voynexus.com</Link>
          <Link href={localizedHref(`/${locale}/contact`)}>Contact</Link>
          <Link href={localizedHref(`/${locale}/partners`)}>Partners</Link>
          <Link href={withHash(`/${locale}/contact`, "ads")}>広告掲載・タイアップのご相談</Link>
          <Link href="/api/status">Status</Link>
        </div>
      </div>
    </footer>
  );
}
