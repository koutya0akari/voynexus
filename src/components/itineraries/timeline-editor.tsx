"use client";

import { useMemo } from "react";
import type { ChangeEvent } from "react";

export type EditableTimelineItem = {
  time: string;
  title: string;
  duration: number;
  note?: string;
};

type Props = {
  timeline: EditableTimelineItem[];
  onChange: (next: EditableTimelineItem[]) => void;
  readOnly?: boolean;
};

export function TimelineEditor({ timeline, onChange, readOnly = false }: Props) {
  const totalMinutes = useMemo(
    () => timeline.reduce((sum, item) => sum + (Number(item.duration) || 0), 0),
    [timeline]
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  if (readOnly) {
    return (
      <div className="space-y-3">
        {timeline.map((item, index) => (
          <div
            key={`${item.time}-${item.title}-${index}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-slate-400">ステップ {index + 1}</p>
            <p className="mt-1 text-xs text-slate-500">
              {item.time} ・ {item.duration ? `${item.duration} min` : "滞在時間サンプル"}
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">{item.title}</p>
            {item.note ? <p className="text-sm text-slate-600">{item.note}</p> : null}
          </div>
        ))}
        <p className="text-xs text-slate-500">
          ログインして従量パスを購入すると、この旅程を自由に編集できます。
        </p>
      </div>
    );
  }

  const updateItem = <K extends keyof EditableTimelineItem>(
    index: number,
    key: K,
    value: EditableTimelineItem[K]
  ) => {
    onChange(timeline.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)));
  };

  const handleInput = (
    index: number,
    key: keyof EditableTimelineItem,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = key === "duration" ? Number(event.target.value) : event.target.value;
    updateItem(index, key, value as EditableTimelineItem[keyof EditableTimelineItem]);
  };

  const addItem = () => {
    onChange([...timeline, { time: "", title: "新しいステップ", duration: 30, note: "" }]);
  };

  const removeItem = (index: number) => {
    onChange(timeline.filter((_, idx) => idx !== index));
  };

  const duplicateItem = (index: number) => {
    const clone = { ...timeline[index], title: `${timeline[index].title} (コピー)` };
    const next = [...timeline];
    next.splice(index + 1, 0, clone);
    onChange(next);
  };

  const reorderItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= timeline.length) return;
    const next = [...timeline];
    const [moved] = next.splice(index, 1);
    next.splice(newIndex, 0, moved);
    onChange(next);
  };

  const insertAfter = (index: number) => {
    const next = [...timeline];
    next.splice(index + 1, 0, { time: "", title: "追加ステップ", duration: 20, note: "" });
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs text-slate-600">
        <p className="font-semibold text-slate-900">
          合計 {totalMinutes} 分 ({totalHours}h)
        </p>
        <p>ステップ {timeline.length} 件</p>
        <button
          type="button"
          onClick={addItem}
          className="ml-auto rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:border-brand/60"
        >
          + ステップを追加
        </button>
      </div>
      {timeline.map((item, index) => (
        <div
          key={`${item.time}-${item.title}-${index}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">ステップ {index + 1}</span>
            <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => reorderItem(index, "up")}
                className="rounded-full border border-slate-200 px-2 py-1 hover:bg-slate-50"
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => reorderItem(index, "down")}
                className="rounded-full border border-slate-200 px-2 py-1 hover:bg-slate-50"
                disabled={index === timeline.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => duplicateItem(index)}
                className="rounded-full border border-slate-200 px-2 py-1 hover:bg-slate-50"
              >
                複製
              </button>
              <button
                type="button"
                onClick={() => insertAfter(index)}
                className="rounded-full border border-slate-200 px-2 py-1 hover:bg-slate-50"
              >
                追加
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-full border border-slate-200 px-2 py-1 text-red-500 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-xs text-slate-500">
              時間
              <input
                type="time"
                value={item.time}
                onChange={(event) => handleInput(index, "time", event)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-500">
              滞在分数
              <input
                type="number"
                min={0}
                value={item.duration}
                onChange={(event) => handleInput(index, "duration", event)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-500 md:col-span-1">
              タイトル
              <input
                value={item.title}
                onChange={(event) => handleInput(index, "title", event)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="mt-3 block text-xs text-slate-500">
            メモ
            <textarea
              value={item.note ?? ""}
              onChange={(event) => handleInput(index, "note", event)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={2}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
