"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function UserMenu() {
  const { data, status } = useSession();

  if (status === "loading") {
    return <span className="text-xs text-slate-400">認証を確認中...</span>;
  }

  if (!data?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google")}
        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand hover:text-brand"
      >
        Googleでログイン
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-slate-500 sm:inline">{data.user.email ?? "ログイン中"}</span>
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
