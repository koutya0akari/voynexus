"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { toast } from "@/components/toaster";
import { locales } from "@/lib/i18n";

type QuickPlanInput = {
  area: string;
  hours: "half" | "day" | "night";
  pace: "slow" | "balanced" | "active";
  transport: "walk" | "bus" | "car" | "mixed";
  weather: "sunny" | "rainy" | "cloudy";
  focus: string;
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
};

const hoursPresets: Record<QuickPlanInput["hours"], { label: string; start: string; end: string }> =
  {
    half: { label: "午前・午後のハーフデー", start: "09:00", end: "13:00" },
    day: { label: "1日ゆったり", start: "09:00", end: "18:00" },
    night: { label: "夕方〜夜のライトプラン", start: "16:00", end: "21:00" },
  };

const paceToBudget: Record<QuickPlanInput["pace"], number> = {
  slow: 3000,
  balanced: 6000,
  active: 9000,
};

const defaultInput: QuickPlanInput = {
  area: "徳島駅周辺",
  hours: "day",
  pace: "balanced",
  transport: "bus",
  weather: "sunny",
  focus: "culture,nature",
};

export function PlanBrain({ locale }: { locale: string }) {
  const [input, setInput] = useState(defaultInput);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedItinerary | null>(null);
  const [aiLang, setAiLang] = useState(locale);

  const selectedPreset = useMemo(() => hoursPresets[input.hours], [input.hours]);

  const handleChange = <K extends keyof QuickPlanInput>(key: K, value: QuickPlanInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        lang: aiLang,
        start: selectedPreset.start,
        end: selectedPreset.end,
        transport: input.transport,
        budget: paceToBudget[input.pace],
        party: "friends",
        interests:
          [input.focus, input.area ? `area:${input.area}` : null].filter(Boolean).join(",") ||
          "culture",
        weather: input.weather,
      };

      const response = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast("ログインするとAI旅程を生成できます。");
        }
        throw new Error("Failed to generate");
      }

      const data = (await response.json()) as GeneratedItinerary;
      setResult(data);
    } catch (error) {
      console.error("PlanBrain generation failed", error);
      toast("AI旅程の生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-brand">Plan Brain</p>
          <h2 className="text-2xl font-semibold text-slate-900">AIと作る旅の日程</h2>
          <p className="text-sm text-slate-600">
            行き先とペースを選ぶだけで、AIが営業時間と移動制約を考えた素案を提示します。
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs text-slate-500 md:items-end">
          <label className="flex items-center gap-2">
            <span>AIの出力言語</span>
            <select
              value={aiLang}
              onChange={(event) => setAiLang(event.target.value)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700"
            >
              {locales.map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <Link
            href={`/${locale}/plan` as Route}
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand/70"
          >
            詳細設定を開く →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <label className="flex flex-col text-sm text-slate-600">
            行きたいエリア
            <input
              value={input.area}
              onChange={(event) => handleChange("area", event.target.value)}
              className="rounded-2xl border border-slate-200 px-3 py-2"
              placeholder="例: 鳴門・徳島中心部"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            滞在時間
            <select
              value={input.hours}
              onChange={(event) =>
                handleChange("hours", event.target.value as QuickPlanInput["hours"])
              }
              className="rounded-2xl border border-slate-200 px-3 py-2"
            >
              {Object.entries(hoursPresets).map(([value, preset]) => (
                <option key={value} value={value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            旅のペース
            <select
              value={input.pace}
              onChange={(event) =>
                handleChange("pace", event.target.value as QuickPlanInput["pace"])
              }
              className="rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="slow">のんびり / 低予算</option>
              <option value="balanced">バランス</option>
              <option value="active">アクティブ / しっかり予算</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            移動手段
            <select
              value={input.transport}
              onChange={(event) =>
                handleChange("transport", event.target.value as QuickPlanInput["transport"])
              }
              className="rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="walk">徒歩中心</option>
              <option value="bus">路線バス / 電車</option>
              <option value="car">車 / レンタカー</option>
              <option value="mixed">複合</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            気になるテーマ
            <input
              value={input.focus}
              onChange={(event) => handleChange("focus", event.target.value)}
              className="rounded-2xl border border-slate-200 px-3 py-2"
              placeholder="culture,nature,food"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            天候
            <select
              value={input.weather}
              onChange={(event) =>
                handleChange("weather", event.target.value as QuickPlanInput["weather"])
              }
              className="rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="sunny">晴れ</option>
              <option value="cloudy">曇り</option>
              <option value="rainy">雨</option>
            </select>
          </label>

          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="w-full rounded-full bg-brand px-4 py-3 font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {loading ? "AIが考え中..." : "AIに旅程を提案してもらう"}
          </button>
        </div>

        <div className="rounded-2xl border border-dashed border-brand/40 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">プランの下書き</p>
          <p className="text-xs text-slate-500">
            {selectedPreset.start} - {selectedPreset.end} · {input.area}
          </p>
          {!result && !loading ? (
            <p className="mt-4 text-sm text-slate-600">
              生成すると、滞在の流れ・移動・注意点をここに表示します。
            </p>
          ) : null}
          {loading && <p className="mt-4 text-sm text-slate-500">AIが条件を整理しています...</p>}
          {result?.timeline?.length ? (
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {result.timeline.map((item) => (
                <li
                  key={`${item.time}-${item.title}`}
                  className="rounded-xl bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.time}</span>
                    <span>{item.duration} min</span>
                  </div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  {item.note ? <p>{item.note}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {result?.warnings?.length ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
              <p className="font-semibold">注意事項</p>
              <ul className="list-disc pl-4">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
