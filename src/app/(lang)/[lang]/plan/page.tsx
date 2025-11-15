import Link from "next/link";
import { Buffer } from "node:buffer";
import type { Metadata } from "next";
import {
  ItineraryPlanner,
  type SharedItineraryData,
  type PlannerInput,
} from "@/components/itineraries/itinerary-planner";
import { AiUpsell } from "@/components/ai/ai-upsell";
import type { Locale } from "@/lib/i18n";
import { getAiAccessStatus } from "@/lib/ai-access";

type Props = {
  params: { lang: Locale };
  searchParams?: { share?: string };
};

export const metadata: Metadata = {
  title: "旅程生成 | voynexus",
};

const conciergeHighlights = [
  {
    title: "現地データ×AI",
    body: "雨天代替や最終バス、潮汐まで踏まえてスポットを提案。RAGで危険情報もケア。",
  },
  {
    title: "好み別チューニング",
    body: "「必ず寄りたい場所」「ペース」「食の希望」など細かな条件を反映。",
  },
  {
    title: "即編集・即共有",
    body: "生成後はタイムラインを自由に編集し、PDF/URLでそのまま共有できます。",
  },
];

const sharedInputStringFields = [
  "start",
  "end",
  "transport",
  "party",
  "interests",
  "weather",
  "area",
  "mustVisit",
  "cautions",
  "diningFocus",
] as const satisfies ReadonlyArray<keyof PlannerInput>;

export default async function PlanPage({ params, searchParams }: Props) {
  const access = await getAiAccessStatus();
  const canGenerate = access.ok;
  const membersHref = { pathname: `/${params.lang}/members` } as const;
  const contactHref = { pathname: `/${params.lang}/contact` } as const;
  const sharedData = parseSharedData(searchParams?.share);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <p className="text-sm uppercase text-slate-500">Planning</p>
        <h1 className="text-4xl font-semibold text-slate-900">AI＋ルールで旅程を生成</h1>
        <p className="text-sm text-slate-500">
          営業時間/移動時間/天候/潮汐/最終バスを考慮しながらAIが指定条件に合わせたベースプランを生成。旅のペースや「必ず寄りたい場所」などを指定すれば、AIが最適な旅程を組み立て、仕上げはタイムラインエディターで自由にカスタマイズできます。
        </p>
        <div className="mt-4 grid gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 md:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-900">1. 条件入力</p>
            <p>旅の開始終了時間や人数、興味をAIに伝えて制約を整理します。</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">2. 編集</p>
            <p>
              生成されたステップを編集・複製・順番入れ替えし、合計時間を確認。好みに合わせて即座に反映できます。
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">3. 共有/保存</p>
            <p>PDFダウンロードやURL共有で旅仲間とすぐに共有できます。</p>
          </div>
        </div>
        <p className="text-xs text-brand">
          条件を変えれば何度でもAIに再生成を依頼でき、旅人自身の感性に合わせて仕上げられる柔軟な編集体験を提供します。
        </p>
        {!canGenerate ? (
          <div className="mt-4 rounded-3xl border border-dashed border-brand/40 bg-brand/5 p-4 text-sm text-brand">
            Googleログインと従量パス購入でAI旅程生成を実行できます。いまはプレビュー表示中です。
          </div>
        ) : null}
      </header>
      <section className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-brand">AI Concierge ができること</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {conciergeHighlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600"
            >
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={membersHref}
            className="inline-flex items-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm"
          >
            従量パスを購入してAIを解放
          </Link>
          <Link
            href={contactHref}
            className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand"
          >
            導入相談
          </Link>
        </div>
      </section>
      <ItineraryPlanner
        locale={params.lang}
        canGenerate={canGenerate}
        showPreview={!canGenerate || Boolean(sharedData)}
        sharedData={sharedData}
      />
      {!canGenerate ? <AiUpsell locale={params.lang} denied={access} /> : null}
    </div>
  );
}

function parseSharedData(value?: string): SharedItineraryData | null {
  if (!value) return null;
  try {
    const decoded = Buffer.from(decodeURIComponent(value), "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as {
      timeline?: Array<{ time?: string; title?: string; duration?: number; note?: string }>;
      input?: Partial<PlannerInput>;
      warnings?: unknown[];
    };
    if (!Array.isArray(payload.timeline)) return null;
    const timeline = payload.timeline
      .map((item) => ({
        time: typeof item.time === "string" ? item.time : "",
        title: typeof item.title === "string" ? item.title : "",
        duration:
          typeof item.duration === "number" && !Number.isNaN(item.duration) ? item.duration : 0,
        note: typeof item.note === "string" && item.note.length ? item.note : undefined,
      }))
      .filter((item) => item.time && item.title);
    if (!timeline.length) return null;
    const warnings = Array.isArray(payload.warnings)
      ? payload.warnings.map((warning) => String(warning)).filter(Boolean)
      : undefined;
    const input = sanitizeSharedInput(payload.input);
    return { timeline, input, warnings };
  } catch (error) {
    console.error("Failed to parse shared itinerary", error);
    return null;
  }
}

function sanitizeSharedInput(raw: Partial<PlannerInput> | undefined | null) {
  if (!raw || typeof raw !== "object") return undefined;
  const input: Partial<PlannerInput> = {};
  sharedInputStringFields.forEach((field) => {
    const value = raw[field];
    if (typeof value === "string" && value.length) {
      input[field] = value;
    }
  });
  const pace = raw.pace;
  if (pace === "relaxed" || pace === "balanced" || pace === "active") {
    input.pace = pace;
  }
  const budget = raw.budget;
  if (typeof budget === "number" && !Number.isNaN(budget)) {
    input.budget = budget;
  } else if (typeof budget === "string") {
    const parsed = Number(budget);
    if (!Number.isNaN(parsed)) {
      input.budget = parsed;
    }
  }
  return Object.keys(input).length ? input : undefined;
}
