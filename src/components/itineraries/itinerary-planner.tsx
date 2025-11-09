"use client";

import { useState } from "react";
import { toast } from "@/components/toaster";

type PlannerInput = {
  start: string;
  end: string;
  transport: string;
  budget: number;
  party: string;
  interests: string;
  weather: string;
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

const defaultInput: PlannerInput = {
  start: "09:00",
  end: "18:00",
  transport: "bus",
  budget: 5000,
  party: "family",
  interests: "culture,nature",
  weather: "sunny"
};

export function ItineraryPlanner({ locale }: { locale: string }) {
  const [input, setInput] = useState(defaultInput);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedItinerary | null>(null);

  const update = (key: keyof PlannerInput, value: string | number) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: locale, ...input })
      });
      if (!response.ok) {
        throw new Error("Failed to generate");
      }
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Itinerary generation failed", error);
      toast("旅程生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">条件を入力</h2>
        <div className="mt-4 grid gap-4">
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
        </div>
        <button
          type="button"
          className="mt-6 w-full rounded-full bg-brand px-4 py-3 font-semibold text-white disabled:opacity-60"
          onClick={generate}
          disabled={loading}
        >
          {loading ? "生成中..." : "AIで旅程を生成"}
        </button>
      </div>
      <div className="rounded-2xl border border-dashed border-brand/40 bg-slate-50/50 p-5">
        {loading && <p className="text-sm text-slate-500">AIが制約をチェック中...</p>}
        {!loading && !result && (
          <p className="text-sm text-slate-500">
            営業時間・移動時間・最終バス・潮汐を考慮した旅程をここに表示します。生成後はPDF保存やURL共有が可能です。
          </p>
        )}
            {result && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">生成結果</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {result.timeline?.map((item) => (
                <li key={item.time} className="rounded-xl bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.time}</span>
                    <span>{item.duration} min</span>
                  </div>
                  <p className="font-semibold">{item.title}</p>
                  <p>{item.note}</p>
                </li>
              ))}
            </ul>
            {result.warnings?.length ? (
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-semibold">Warnings</p>
                <ul className="list-disc pl-4">
                  {result.warnings.map((warning: string) => (
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
