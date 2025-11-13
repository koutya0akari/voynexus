import type { Metadata } from "next";
import { UpgradePageContent } from "@/app/upgrade/upgrade-content";
import type { Locale } from "@/lib/i18n";

type Props = {
  params: { lang: Locale };
};

export const metadata: Metadata = {
  title: "voynexus Membership",
};

export default function LocaleUpgradePage({ params }: Props) {
  return <UpgradePageContent locale={params.lang} />;
}
