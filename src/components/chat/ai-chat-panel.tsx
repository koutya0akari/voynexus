"use client";

import { useState } from "react";
import { toast } from "@/components/toaster";
import { MembershipTokenBanner } from "@/components/membership/token-banner";
import { locales } from "@/lib/i18n";

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
  const [aiLang, setAiLang] = useState(locale);
  const [downloading, setDownloading] = useState(false);

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
        credentials: "include",
        body: JSON.stringify({ lang: aiLang, userQuery: pending.content })
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast("GoogleアカウントでログインするとAIチャットを利用できます。");
        } else if (response.status === 403) {
          toast("この会員情報は別のGoogleアカウントに紐付いています。");
        }
        throw new Error("failed");
      }
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
      <MembershipTokenBanner />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>回答言語</span>
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
        <div className="space-y-3 overflow-auto rounded-2xl border border-slate-100 bg-white/50 p-4">
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
        {messages.length ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={saveConversation(messages, aiLang)}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600"
            >
              会話を保存
            </button>
            <button
              type="button"
              disabled={downloading}
              onClick={() => downloadConversation(messages, aiLang, setDownloading)}
              className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {downloading ? "生成中..." : "テキストを保存"}
            </button>
          </div>
        ) : null}
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

function saveConversation(messages: Message[], lang: string) {
  return () => {
    try {
      const key = "voynex_chat_history";
      const existingRaw = typeof window === "undefined" ? null : localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), lang, messages });
      if (existing.length > 30) existing.pop();
      localStorage.setItem(key, JSON.stringify(existing));
      toast("会話を保存しました");
    } catch (error) {
      console.error("Failed to save chat", error);
      toast("保存に失敗しました");
    }
  };
}

async function downloadConversation(
  messages: Message[],
  lang: string,
  setDownloading: (value: boolean) => void
) {
  setDownloading(true);
  try {
    const content = [`Voynex Chat (${lang.toUpperCase()})`, ""].concat(
      messages.map((message) => `${message.role === "user" ? "User" : "AI"}: ${message.content}`)
    );
    const blob = new Blob([content.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "voynex-chat.txt";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download conversation failed", error);
    toast("テキスト保存に失敗しました");
  } finally {
    setDownloading(false);
  }
}
