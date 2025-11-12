"use client";

import { useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import clsx from "clsx";

type Variant = "inline" | "block";

type Props = {
  variant?: Variant;
};

export function UserMenu({ variant = "inline" }: Props) {
  const { data, status } = useSession();
  const syncAttemptedRef = useRef(false);

  useEffect(() => {
    if (!data?.user?.id) {
      syncAttemptedRef.current = false;
      return;
    }
    if (syncAttemptedRef.current) {
      return;
    }
    syncAttemptedRef.current = true;
    fetch("/api/membership/sync", { method: "POST", credentials: "include" }).catch((error) => {
      console.warn("membership sync failed (non-blocking)", error);
    });
  }, [data?.user?.id]);

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
