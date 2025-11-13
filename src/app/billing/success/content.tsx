"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Props = {
  fallbackSessionId?: string;
};

type Diagnostics = Record<string, unknown>;

const MAX_ATTEMPTS = 6;

export function BillingSuccessContent({ fallbackSessionId }: Props) {
  const localParams = useSearchParams();
  const sessionId = localParams?.get("session_id") ?? fallbackSessionId ?? null;
  const [status, setStatus] = useState<"loading" | "pending" | "success" | "error">("loading");
  const [message, setMessage] = useState("決済を確認しています...");
  const [pendingAttempt, setPendingAttempt] = useState(0);
  const router = useRouter();
  const { data: authSession } = useSession();

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    async function fetchSession(attempt = 0) {
      if (!sessionId) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            "決済情報を読み込めませんでした。決済完了メールからもう一度アクセスするかサポートまでご連絡ください。"
          );
        }
        return;
      }

      try {
        const res = await fetch(
          `/api/billing/session?session_id=${encodeURIComponent(sessionId)}`,
          {
            credentials: "include",
          }
        );
        const payload = await res.json().catch(() => null);

        if (res.status === 202) {
          const pendingReason =
            (payload as { pendingReason?: string } | null)?.pendingReason ?? "session-incomplete";
          if (!cancelled) {
            setStatus("pending");
            setPendingAttempt(attempt + 1);
            setMessage(describePendingReason(pendingReason));
          }
          if (attempt + 1 < MAX_ATTEMPTS) {
            retryTimer = setTimeout(() => fetchSession(attempt + 1), 1500);
            return;
          }
          throw new PendingTimeoutError(pendingReason, payload ?? undefined);
        }

        if (!res.ok) {
          const errorType =
            res.status === 401
              ? "login-required"
              : res.status === 403
                ? "link-mismatch"
                : "api-error";
          throw new ApiError(errorType, res.status, payload ?? undefined);
        }

        const data = payload;
        if (!data?.customerId) {
          throw new Error("missing customerId");
        }
        if (cancelled) return;
        setPendingAttempt(0);
        setStatus("success");
        if (data.linkStatus === "conflict") {
          setMessage("決済が別のGoogleアカウントに紐付いています。サポートへご連絡ください。");
          return;
        }
        if (authSession?.user && data.linkStatus !== "unauthenticated") {
          setMessage("会員トークンを保存しました。会員ページへ移動します...");
          router.replace("/members");
        } else {
          setMessage(
            "会員トークンを保存しました。Googleアカウントでログインすると会員情報が連携されます。"
          );
        }
      } catch (error) {
        console.error("Billing success error", error);
        if (cancelled) return;
        setPendingAttempt(0);
        setStatus("error");
        if (error instanceof ApiError && error.type === "login-required") {
          setMessage("Googleアカウントでログインすると会員情報のリンクが完了します。");
        } else if (error instanceof ApiError && error.type === "link-mismatch") {
          setMessage("決済が別のGoogleアカウントに紐付いています。サポートへご連絡ください。");
        } else if (error instanceof ApiError && error.type === "api-error") {
          setMessage("決済情報の確認でエラーが発生しました。時間を空けて再度お試しください。");
        } else if (error instanceof PendingTimeoutError) {
          setMessage(
            "カード会社での確認が完了していないか通信に時間がかかっています。決済完了メールを開き直すか、数分後に再読み込みしてください。"
          );
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
      <p
        className={
          status === "error"
            ? "text-rose-600"
            : status === "pending"
              ? "text-amber-700"
              : "text-slate-700"
        }
      >
        {message}
      </p>
      {status === "pending" && (
        <p className="mt-2 text-xs text-amber-700">
          {`確認を再試行中 (${Math.min(Math.max(pendingAttempt, 1), MAX_ATTEMPTS)}/${MAX_ATTEMPTS})`}
        </p>
      )}
      {status === "success" && (
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>ホームに戻り、AIコンシェルジュや旅程生成をお試しください。</p>
          <p>メールに送付された領収書からStripeポータルを開くこともできます。</p>
        </div>
      )}
      {sessionId && status !== "success" ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">サポートコード</p>
          <p className="mt-1 font-mono text-base text-slate-900">{sessionId}</p>
          <p className="mt-1">お問い合わせの際は上記のコードをお伝えください。</p>
        </div>
      ) : null}
    </div>
  );
}

class ApiError extends Error {
  constructor(
    readonly type: "login-required" | "link-mismatch" | "api-error",
    readonly status: number,
    readonly info?: Diagnostics | null
  ) {
    super(type);
    this.name = "ApiError";
  }
}

class PendingTimeoutError extends Error {
  constructor(
    readonly reason: string,
    readonly info?: Diagnostics
  ) {
    super("pending-timeout");
    this.name = "PendingTimeoutError";
  }
}

function describePendingReason(reason: string) {
  switch (reason) {
    case "missing-customer":
      return "決済サービスから会員情報を受け取っている途中です。決済完了メールを確認するか少し待ってから再読み込みしてください。";
    case "payment-incomplete":
      return "カード認証がまだ完了していない可能性があります。3Dセキュアの画面やカード会社アプリをご確認ください。";
    case "session-incomplete":
    default:
      return "決済情報を確認しています。そのままお待ちください。";
  }
}
