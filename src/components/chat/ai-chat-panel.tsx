"use client";

import { useState } from "react";
import { toast } from "@/components/toaster";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  locale: string;
};

export function AiChatPanel({ locale }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [references, setReferences] = useState<{ title: string; url: string }[]>([]);

  const send = async () => {
    if (!query.trim()) return;
    const pending: Message = { id: crypto.randomUUID(), role: "user", content: query };
    setMessages((prev) => [...prev, pending]);
    setQuery("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: locale, userQuery: pending.content })
      });
      if (!response.ok) throw new Error("failed");
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.answer as string }
      ]);
      setReferences(data.references ?? []);
    } catch (error) {
      console.error("AI chat failed", error);
      toast("コンシェルジュの呼び出しに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 space-y-3 overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "text-right" : "text-left"}
          >
            <p
              className={`inline-block rounded-2xl px-3 py-2 text-sm ${
                message.role === "user" ? "bg-brand text-white" : "bg-slate-100 text-slate-900"
              }`}
            >
              {message.content}
            </p>
          </div>
        ))}
        {loading && <p className="text-sm text-slate-400">AIが回答を生成中...</p>}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例: 雨の日に子連れで半日楽しめる渦潮周辺は？"
          className="h-24 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm"
        />
        <button
          type="button"
          className="mt-2 w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={send}
          disabled={loading}
        >
          {loading ? "回答中..." : "送信"}
        </button>
        {references.length ? (
          <div className="mt-4 space-y-1 text-xs text-slate-500">
            <p>参照した情報源</p>
            {references.map((ref) => (
              <a key={ref.url} href={ref.url} target="_blank" rel="noreferrer" className="text-brand">
                {ref.title}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
