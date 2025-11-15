"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/toaster";
import { MembershipTokenBanner } from "@/components/membership/token-banner";
import { locales } from "@/lib/i18n";
import { useMeteredUsage } from "@/hooks/use-metered-usage";
import { TimelineEditor } from "./timeline-editor";

type TravelPace = "relaxed" | "balanced" | "active";

const travelPaceLabels: Record<TravelPace, string> = {
  relaxed: "ゆったり / 滞在長め",
  balanced: "バランス / 標準",
  active: "アクティブ / 密度高め",
};

export type PlannerInput = {
  start: string;
  end: string;
  transport: string;
  budget: number;
  party: string;
  interests: string;
  weather: string;
  area: string;
  pace: TravelPace;
  mustVisit: string;
  cautions: string;
  diningFocus: string;
};

type GeneratedTimelineItem = {
  time: string;
  title: string;
  duration: number;
  note?: string;
};

type GeneratedItinerary = {
  timeline?: GeneratedTimelineItem[];
  warnings?: string[];
  references?: { title: string; url?: string }[];
};

export type SharedItineraryData = {
  timeline: GeneratedTimelineItem[];
  input?: Partial<PlannerInput>;
  warnings?: string[];
};

const previewTimeline: GeneratedTimelineItem[] = [
  { time: "09:00", title: "徳島駅集合", duration: 30, note: "チェックインと荷物預け" },
  { time: "10:00", title: "阿波おどり会館", duration: 60, note: "実演＆資料館を見学" },
  { time: "12:00", title: "地元食堂で昼食", duration: 60, note: "鳴門鯛の定食を想定" },
];

const defaultInput: PlannerInput = {
  start: "09:00",
  end: "18:00",
  transport: "bus",
  budget: 5000,
  party: "family",
  interests: "culture,nature",
  weather: "sunny",
  area: "",
  pace: "balanced",
  mustVisit: "",
  cautions: "",
  diningFocus: "",
};

type PlannerProps = {
  locale: string;
  canGenerate?: boolean;
  showPreview?: boolean;
  sharedData?: SharedItineraryData | null;
};

export function ItineraryPlanner({
  locale,
  canGenerate = true,
  showPreview = false,
  sharedData = null,
}: PlannerProps) {
  const [input, setInput] = useState<PlannerInput>(
    sharedData?.input ? { ...defaultInput, ...sharedData.input } : defaultInput
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedItinerary | null>(null);
  const [aiLang, setAiLang] = useState(locale);
  const [downloading, setDownloading] = useState(false);
  const [editableTimeline, setEditableTimeline] = useState<GeneratedTimelineItem[]>(
    sharedData?.timeline ?? (showPreview ? previewTimeline : [])
  );
  const [previewActive, setPreviewActive] = useState(showPreview || Boolean(sharedData));
  const { summary: meteredSummary, refresh: refreshMeteredUsage } = useMeteredUsage();
  const paceLabels = travelPaceLabels;

  useEffect(() => {
    if (sharedData?.input) {
      setInput((prev) => ({ ...prev, ...sharedData.input }));
    }
    if (sharedData?.timeline?.length) {
      setEditableTimeline(sharedData.timeline);
      setPreviewActive(true);
    }
  }, [sharedData]);

  useEffect(() => {
    if (showPreview && !sharedData) {
      setEditableTimeline(previewTimeline);
      setPreviewActive(true);
    }
  }, [showPreview, sharedData]);

  const update = (key: keyof PlannerInput, value: string | number) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const generate = async () => {
    if (!canGenerate) {
      toast("ログインし、従量パスをご購入いただくとAI旅程を生成できます。");
      return;
    }
    setLoading(true);
    setResult(null);
    setEditableTimeline([]);
    try {
      const response = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lang: aiLang, ...input }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast("Googleアカウントでログインすると旅程生成を利用できます。");
        } else if (response.status === 403) {
          toast("この会員情報は別のGoogleアカウントに紐付いています。");
        }
        throw new Error("Failed to generate");
      }
      const data = await response.json();
      setResult(data);
      setEditableTimeline(data.timeline ?? []);
      setPreviewActive(false);
      if (typeof data.meteredUsesRemaining === "number") {
        refreshMeteredUsage();
      }
    } catch (error) {
      console.error("Itinerary generation failed", error);
      toast("旅程生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const exportableResult = result ? { ...result, timeline: editableTimeline } : null;
  const shouldRenderEditor = Boolean(result) || previewActive || Boolean(sharedData);

  const handleCopyShareLink = async () => {
    if (!canGenerate) return;
    try {
      if (typeof window === "undefined") {
        toast("ブラウザ環境で共有リンクを生成してください。");
        return;
      }
      const sanitizedTimeline = sanitizeTimelineForExport(editableTimeline);
      if (!sanitizedTimeline.length) {
        toast("共有できる旅程がありません");
        return;
      }
      const payload = {
        timeline: sanitizedTimeline,
        input: {
          start: input.start,
          end: input.end,
          transport: input.transport,
          budget: input.budget,
          party: input.party,
          interests: input.interests,
          weather: input.weather,
          area: input.area,
          pace: input.pace,
          mustVisit: input.mustVisit,
          cautions: input.cautions,
          diningFocus: input.diningFocus,
        },
        warnings: result?.warnings ?? undefined,
      };
      const encoded = encodeURIComponent(encodeSharePayload(payload));
      const shareUrl = `${window.location.origin}/${locale}/plan?share=${encoded}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast("共有リンクをコピーしました");
    } catch (error) {
      console.error("Failed to copy share link", error);
      toast("共有リンクの生成に失敗しました");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <MembershipTokenBanner />
        {meteredSummary.totalRemaining > 0 ? (
          <div className="mb-4 rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">
              従量パス残り {meteredSummary.totalRemaining} 回
            </p>
            <p className="text-xs text-slate-500">旅程生成を実行すると1回分が消費されます。</p>
          </div>
        ) : null}
        <div className="mb-4 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>旅程の言語</span>
          <select
            value={aiLang}
            onChange={(event) => setAiLang(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm"
          >
            {locales.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">条件を入力</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col text-sm text-slate-600 sm:col-span-2">
            訪問エリア・都市
            <input
              value={input.area}
              onChange={(event) => update("area", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
              placeholder="例: 徳島市内・鳴門エリア"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            開始時間
            <input
              type="time"
              value={input.start}
              onChange={(event) => update("start", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            終了時間
            <input
              type="time"
              value={input.end}
              onChange={(event) => update("end", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            交通手段
            <select
              value={input.transport}
              onChange={(event) => update("transport", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
            >
              <option value="walk">徒歩</option>
              <option value="bus">バス</option>
              <option value="car">車</option>
              <option value="mixed">混在</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            ペース
            <select
              value={input.pace}
              onChange={(event) => update("pace", event.target.value as TravelPace)}
              className="rounded-lg border border-slate-200 p-2"
            >
              <option value="relaxed">{paceLabels.relaxed}</option>
              <option value="balanced">{paceLabels.balanced}</option>
              <option value="active">{paceLabels.active}</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            予算 (円)
            <input
              type="number"
              value={input.budget}
              onChange={(event) => update("budget", Number(event.target.value))}
              className="rounded-lg border border-slate-200 p-2"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            同行者
            <input
              value={input.party}
              onChange={(event) => update("party", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            興味
            <input
              value={input.interests}
              onChange={(event) => update("interests", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            天気
            <select
              value={input.weather}
              onChange={(event) => update("weather", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
            >
              <option value="sunny">晴</option>
              <option value="rainy">雨</option>
              <option value="cloudy">曇</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600 sm:col-span-2">
            必ず寄りたい場所・テーマ
            <textarea
              value={input.mustVisit}
              onChange={(event) => update("mustVisit", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
              rows={2}
              placeholder="例: 阿波おどり会館、地元の朝市、鳴門金時スイーツ"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600 sm:col-span-2">
            注意してほしいこと（移動制約・混雑回避など）
            <textarea
              value={input.cautions}
              onChange={(event) => update("cautions", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
              rows={2}
              placeholder="例: 雨天時は屋内優先、子連れで階段は避けたい"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            食の希望
            <input
              value={input.diningFocus}
              onChange={(event) => update("diningFocus", event.target.value)}
              className="rounded-lg border border-slate-200 p-2"
              placeholder="例: 地元の海鮮、ビーガン対応"
            />
          </label>
        </div>
        <button
          type="button"
          className="mt-6 w-full rounded-full bg-brand px-4 py-3 font-semibold text-white disabled:opacity-60"
          onClick={generate}
          disabled={loading || !canGenerate}
        >
          {loading ? "生成中..." : canGenerate ? "AIで旅程を生成" : "ログインしてAI生成"}
        </button>
        {!canGenerate && (
          <p className="mt-2 text-xs text-rose-500">
            旅程のプレビューを表示中です。Googleログインと従量パス購入で実際の旅程を生成できます。
          </p>
        )}
        {exportableResult?.timeline?.length ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {canGenerate && editableTimeline.length ? (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600"
              >
                共有リンクをコピー
              </button>
            ) : null}
            <button
              type="button"
              onClick={() =>
                downloadItineraryPdf(result, editableTimeline, input, aiLang, setDownloading)
              }
              className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
              disabled={downloading}
            >
              {downloading ? "生成中..." : "PDFとして保存"}
            </button>
          </div>
        ) : null}
      </div>
      <div className="rounded-2xl border border-dashed border-brand/40 bg-slate-50/50 p-5">
        {loading && <p className="text-sm text-slate-500">AIが制約をチェック中...</p>}
        {!loading && !result && (
          <p className="text-sm text-slate-500">
            営業時間・移動時間・最終バス・潮汐を考慮した旅程をここに表示します。AIが条件に沿って並べたステップは、好みに合わせて自由に編集・追加し、PDF保存やURL共有が可能です。
          </p>
        )}
        {shouldRenderEditor && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">旅程を編集</h3>
              {result ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditableTimeline(result.timeline ?? []);
                    setPreviewActive(false);
                  }}
                  className="text-xs font-semibold text-brand"
                >
                  AIの案にリセット
                </button>
              ) : null}
            </div>
            <TimelineEditor
              timeline={editableTimeline}
              onChange={setEditableTimeline}
              readOnly={!canGenerate || (!result && previewActive)}
            />
            {!result && previewActive ? (
              <p className="text-xs text-slate-500">
                サンプルの旅程を表示しています。AIで生成するとここに最新のステップが並び、編集が有効になります。
              </p>
            ) : null}
            {(result?.warnings?.length ?? sharedData?.warnings?.length) ? (
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-semibold">Warnings</p>
                <ul className="list-disc pl-4">
                  {(result?.warnings ?? sharedData?.warnings ?? []).map((warning: string) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

async function downloadItineraryPdf(
  baseResult: GeneratedItinerary | null,
  timeline: GeneratedTimelineItem[],
  input: PlannerInput,
  lang: string,
  setDownloading: (value: boolean) => void
) {
  if (!baseResult) {
    toast("旅程が生成されていません");
    return;
  }
  setDownloading(true);
  try {
    const detailPayload = {
      window: `${input.start} – ${input.end}`,
      area: input.area,
      pace: travelPaceLabels[input.pace] ?? input.pace,
      transport: input.transport,
      party: input.party,
      budget: `¥${input.budget.toLocaleString("ja-JP")}`,
      weather: input.weather,
      mustVisit: input.mustVisit,
      dining: input.diningFocus,
      cautions: input.cautions,
    };
    const references = baseResult.references?.map((reference) => ({
      title: reference.title,
      url: reference.url,
    }));
    const sanitizedTimeline = sanitizeTimelineForExport(timeline);

    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `voynexus itinerary (${lang.toUpperCase()})`,
        summary: `Transport: ${input.transport} / Party: ${input.party} / Budget: ¥${input.budget}`,
        details: detailPayload,
        timeline: sanitizedTimeline,
        warnings: baseResult.warnings ?? [],
        references,
      }),
    });
    if (!response.ok) throw new Error("pdf");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "voynexus-itinerary.pdf";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF download failed", error);
    toast("PDFの生成に失敗しました");
  } finally {
    setDownloading(false);
  }
}

function sanitizeTimelineForExport(items: GeneratedTimelineItem[]) {
  return items
    .map((item) => ({
      time: typeof item.time === "string" ? item.time : "",
      title: typeof item.title === "string" ? item.title : "",
      duration:
        typeof item.duration === "number" && !Number.isNaN(item.duration) ? item.duration : 0,
      note: typeof item.note === "string" && item.note.length ? item.note : undefined,
    }))
    .filter((item) => item.time && item.title);
}

function encodeSharePayload(payload: unknown) {
  if (typeof window === "undefined") {
    throw new Error("Share payload encoding requires browser APIs");
  }
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return window.btoa(binary);
}
