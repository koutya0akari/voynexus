import type { Locale } from "@/lib/i18n";
import { UpgradePageContent } from "@/app/upgrade/upgrade-content";
export { metadata } from "@/app/upgrade/page";

export default function LocaleUpgradePage({ params }: { params: { lang: Locale } }) {
  return <UpgradePageContent locale={params.lang} />;
}
