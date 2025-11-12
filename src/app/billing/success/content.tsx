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
  const [message, setMessage] = useState("Stripe決済を確認しています...");
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
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
            "session_id が見つかりませんでした。成功URLに {CHECKOUT_SESSION_ID} を含める必要があります。"
          );
          setDiagnostics({ phase: "error", reason: "missing-session-id" });
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
            setDiagnostics({
              phase: "pending",
              attempt,
              pendingReason,
              sessionStatus: (payload as { sessionStatus?: string } | null)?.sessionStatus,
              paymentStatus: (payload as { paymentStatus?: string } | null)?.paymentStatus,
              customerPresent: (payload as { customerPresent?: boolean } | null)?.customerPresent,
              sessionId,
            });
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
        setStatus("success");
        setDiagnostics({
          phase: "success",
          sessionId,
          customerId: data.customerId,
          linkStatus: data.linkStatus,
          sessionStatus: data.sessionStatus,
          paymentStatus: data.paymentStatus,
          livemode: data.livemode,
          amountTotal: data.amountTotal,
          currency: data.currency,
          lineItems: data.lineItems,
        });
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
        setStatus("error");
        if (error instanceof ApiError && error.type === "login-required") {
          setMessage("Googleアカウントでログインすると会員情報のリンクが完了します。");
          setDiagnostics(error.info ?? null);
        } else if (error instanceof ApiError && error.type === "link-mismatch") {
          setMessage("決済が別のGoogleアカウントに紐付いています。サポートへご連絡ください。");
          setDiagnostics(error.info ?? null);
        } else if (error instanceof ApiError && error.type === "api-error") {
          setMessage(
            "Stripeセッションの取得でエラーが発生しました。下記の診断情報をサポートへ共有してください。"
          );
          setDiagnostics({
            phase: "error",
            status: error.status,
            sessionId,
            info: error.info,
          });
        } else if (error instanceof PendingTimeoutError) {
          setMessage(
            "決済が完了ステータスになりません。Stripeダッシュボードで支払い状況をご確認ください。"
          );
          setDiagnostics({
            phase: "timeout",
            sessionId,
            reason: error.reason,
            info: error.info,
          });
        } else {
          setMessage("決済情報の取得に失敗しました。サポートへご連絡ください。");
          setDiagnostics({
            phase: "error",
            sessionId,
            message: error instanceof Error ? error.message : String(error),
          });
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
          {`セッションID: ${sessionId ?? "不明"} / 再試行 ${diagnostics && "attempt" in diagnostics ? (diagnostics.attempt as number) + 1 : 1} / ${MAX_ATTEMPTS}`}
        </p>
      )}
      {status === "success" && (
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>ホームに戻り、AIコンシェルジュや旅程生成をお試しください。</p>
          <p>メールに送付された領収書からStripeポータルを開くこともできます。</p>
        </div>
      )}
      {diagnostics ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-600">
            診断情報を表示
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-2xl bg-slate-900/90 p-4 text-[11px] leading-tight text-emerald-100">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </details>
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
      return "顧客IDがまだStripeセッションに紐付いていません。決済完了メールを確認するか数秒後に再読み込みしてください。";
    case "payment-incomplete":
      return "決済が未確定のためStripeから完了通知が届いていません。カードの認証や3Dセキュアを完了してください。";
    case "session-incomplete":
    default:
      return "決済情報を確認しています…少々お待ちください。";
  }
}
