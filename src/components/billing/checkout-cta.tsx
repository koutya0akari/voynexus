"use client";

import { useState } from "react";
import { toast } from "@/components/toaster";

export function BillingCheckoutCTA() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    if (!email.trim()) {
      toast("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to create checkout session");
      }
      if (!data.url) {
        throw new Error("Missing checkout URL");
      }
      window.location.href = data.url as string;
    } catch (error) {
      console.error("Checkout start failed", error);
      toast(error instanceof Error ? error.message : "決済ページの生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-brand/40 bg-white/80 p-6 shadow-sm">
      <p className="text-xs uppercase text-brand">Voynezus Membership</p>
      <h2 className="text-2xl font-semibold text-slate-900">旅人のためのAIパス</h2>
      <p className="text-sm text-slate-600">
        メールを入力して決済すると、AIチャット・旅程生成・オフラインPDFが解放されます。現地の混雑情報や
        FAQもスポンサー表示を明示したうえで受け取れます。
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>天候・潮汐・最終バスを考慮したAI旅程</li>
        <li>スポットごとのオフラインメモ＆PDF</li>
        <li>スポンサー特集や限定クーポンも一括管理</li>
      </ul>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-xl border border-slate-200 p-3 text-sm"
        />
        <button
          type="button"
          onClick={startCheckout}
          disabled={loading}
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "処理中..." : "決済に進む"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        決済完了後は確認メールに領収書と会員ポータルへのリンクが届きます。ご不明点はフッターの問い合わせ先までご連絡ください。
      </p>
    </div>
  );
}
