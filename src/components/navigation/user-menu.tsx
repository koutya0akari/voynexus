"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import clsx from "clsx";

type Variant = "inline" | "block";

type Props = {
  variant?: Variant;
};

export function UserMenu({ variant = "inline" }: Props) {
  const { data, status } = useSession();
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.user?.id) {
      setSyncState("idle");
      setSyncMessage(null);
      return;
    }
    if (syncState !== "idle") {
      return;
    }
    let cancelled = false;
    setSyncState("syncing");
    fetch("/api/membership/sync", { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const message = body?.error ?? "会員情報の同期に失敗しました。";
          throw new Error(message);
        }
        if (!cancelled) {
          setSyncState("done");
          setSyncMessage(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setSyncState("error");
          setSyncMessage(error instanceof Error ? error.message : "会員情報の同期に失敗しました。");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [data?.user?.id, syncState]);

  if (status === "loading") {
    return (
      <span className={variant === "block" ? "text-sm text-slate-500" : "text-xs text-slate-400"}>
        認証を確認中...
      </span>
    );
  }

  if (!data?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google")}
        className={clsx(
          "font-semibold transition",
          variant === "block"
            ? "w-full rounded-full bg-brand px-4 py-2 text-sm text-white hover:bg-brand/90"
            : "rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand hover:text-brand"
        )}
      >
        Googleでログイン
      </button>
    );
  }

  if (variant === "block") {
    return (
      <div className="w-full space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            ログイン中のアカウント
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {data.user.email ?? data.user.name ?? "Signed in"}
          </p>
        </div>
        {syncState === "syncing" && (
          <p className="text-xs text-slate-500">会員情報を同期しています...</p>
        )}
        {syncState === "error" && syncMessage ? (
          <p className="text-xs text-rose-500">{syncMessage}</p>
        ) : null}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-slate-500 sm:inline">
        {data.user.email ?? "ログイン中"}
      </span>
      {syncState === "syncing" && <span className="text-[10px] text-slate-500">会員同期中...</span>}
      {syncState === "error" && syncMessage ? (
        <span className="text-[10px] text-rose-500">{syncMessage}</span>
      ) : null}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
      >
        ログアウト
      </button>
    </div>
  );
}
