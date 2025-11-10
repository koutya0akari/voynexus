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
        body: JSON.stringify({ email: email.trim() })
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
      <p className="text-xs uppercase text-brand">Voynex Membership</p>
      <h2 className="text-2xl font-semibold text-slate-900">AIコンシェルジュを開放</h2>
      <p className="text-sm text-slate-600">メールを入力し決済に進むと、完了後に会員トークンが自動保存されます。</p>
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
      <p className="mt-2 text-xs text-slate-500">テスト中はStripeのテストカードで決済できます。</p>
    </div>
  );
}
