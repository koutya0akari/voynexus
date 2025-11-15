import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export async function FacilityWidgetCTA({ locale }: Props) {
  const t = await getTranslations({ locale });
  const bullets = [
    t("facility.bullets.first"),
    t("facility.bullets.second"),
    t("facility.bullets.third"),
  ];
  return (
    <section className="mx-auto mt-12 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase text-brand">{t("facility.eyebrow")}</p>
          <h3 className="text-xl font-semibold text-slate-900">{t("facility.title")}</h3>
        </div>
        <p className="text-sm text-slate-600">{t("facility.description")}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/partners`}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
          >
            {t("facility.ctaGuide")}
          </Link>
          <a
            href="mailto:info@voynexus.com"
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand"
          >
            {t("facility.ctaContact")}
          </a>
        </div>
      </div>
    </section>
  );
}
