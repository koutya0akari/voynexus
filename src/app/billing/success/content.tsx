"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Props = {
  fallbackSessionId?: string;
};

export function BillingSuccessContent({ fallbackSessionId }: Props) {
  const localParams = useSearchParams();
  const sessionId = localParams?.get("session_id") ?? fallbackSessionId ?? null;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Stripe決済を確認しています...");
  const router = useRouter();
  const { data: authSession } = useSession();

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    async function fetchSession(attempt = 0) {
      if (!sessionId) {
        if (!cancelled) {
          setStatus("error");
          setMessage("session_id が見つかりませんでした。成功URLに {CHECKOUT_SESSION_ID} を含める必要があります。");
        }
        return;
      }

      try {
        const res = await fetch(`/api/billing/session?session_id=${encodeURIComponent(sessionId)}`, {
          credentials: "include"
        });

        if (res.status === 202) {
          if (attempt < 5) {
            if (!cancelled) {
              setStatus("loading");
              setMessage("決済情報を確認しています…少々お待ちください。");
            }
            retryTimer = setTimeout(() => fetchSession(attempt + 1), 1500);
            return;
          }
          throw new Error("session still pending after retries");
        }

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("login-required");
          }
          if (res.status === 403) {
            throw new Error("link-mismatch");
          }
          throw new Error(`session fetch failed (${res.status})`);
        }

        const data = await res.json();
        if (!data.customerId) {
          throw new Error("missing customerId");
        }
        if (cancelled) return;
        setStatus("success");
        if (data.linkStatus === "conflict") {
          setMessage("決済が別のGoogleアカウントに紐付いています。サポートへご連絡ください。");
          return;
        }
        if (authSession?.user && data.linkStatus !== "unauthenticated") {
          setMessage("会員トークンを保存しました。会員ページへ移動します...");
          router.replace("/members");
        } else {
          setMessage("会員トークンを保存しました。Googleアカウントでログインすると会員情報が連携されます。");
        }
      } catch (error) {
        console.error("Billing success error", error);
        if (cancelled) return;
        setStatus("error");
        if (error instanceof Error && error.message === "login-required") {
          setMessage("Googleアカウントでログインすると会員情報のリンクが完了します。");
        } else if (error instanceof Error && error.message === "link-mismatch") {
          setMessage("決済が別のGoogleアカウントに紐付いています。サポートへご連絡ください。");
        } else {
          setMessage("決済情報の取得に失敗しました。サポートへご連絡ください。");
        }
      }
    }

    fetchSession();

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [sessionId, router, authSession]);

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
