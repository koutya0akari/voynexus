"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { saveMembershipToken } from "@/lib/membership-client";

type Props = {
  fallbackSessionId?: string;
};

export function BillingSuccessContent({ fallbackSessionId }: Props) {
  const localParams = useSearchParams();
  const sessionId = localParams?.get("session_id") ?? fallbackSessionId ?? null;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Stripe決済を確認しています...");
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) {
        setStatus("error");
        setMessage("session_id が見つかりませんでした。");
        return;
      }
      try {
        const res = await fetch(`/api/billing/session?session_id=${encodeURIComponent(sessionId)}`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("session fetch failed");
        const data = await res.json();
        if (!data.customerId) throw new Error("missing customerId");
        if (data.token) {
          saveMembershipToken(data.token);
        }
        setStatus("success");
        setMessage("会員トークンを保存しました。AIコンシェルジュを開いてみてください。");
        setTimeout(() => router.push("/members"), 1200);
      } catch (error) {
        console.error("Billing success error", error);
        setStatus("error");
        setMessage("決済情報の取得に失敗しました。サポートへご連絡ください。");
      }
    }
    fetchSession();
  }, [sessionId, router]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className={status === "error" ? "text-rose-600" : "text-slate-700"}>{message}</p>
      {status === "success" && (
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>ホームに戻り、AIコンシェルジュや旅程生成をお試しください。</p>
          <p>メールに送付された領収書からStripeポータルを開くこともできます。</p>
        </div>
      )}
    </div>
  );
}
