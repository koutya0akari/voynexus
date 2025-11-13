import type { Metadata } from "next";
import { ItineraryPlanner } from "@/components/itineraries/itinerary-planner";
import { AiUpsell } from "@/components/ai/ai-upsell";
import type { Locale } from "@/lib/i18n";
import { getAiAccessStatus } from "@/lib/ai-access";

type Props = {
  params: { lang: Locale };
};

export const metadata: Metadata = {
  title: "旅程生成 | voynexus",
};

export default async function PlanPage({ params }: Props) {
  const access = await getAiAccessStatus();

  if (!access.ok) {
    return <AiUpsell locale={params.lang} denied={access} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <p className="text-sm uppercase text-slate-500">Plan</p>
        <h1 className="text-4xl font-semibold text-slate-900">AI＋ルールで旅程を生成</h1>
        <p className="text-sm text-slate-500">
          営業時間/移動時間/天候/潮汐/最終バスを考慮した旅程を生成し、PDFやURLで保存できます。
        </p>
      </header>
      <ItineraryPlanner locale={params.lang} />
    </div>
  );
}
