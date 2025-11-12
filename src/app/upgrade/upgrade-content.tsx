import type { Locale } from "@/lib/i18n";
import { AiUpsell } from "@/components/ai/ai-upsell";

type Props = {
  locale: Locale;
};

export function UpgradePageContent({ locale }: Props) {
  return <AiUpsell locale={locale} />;
}
