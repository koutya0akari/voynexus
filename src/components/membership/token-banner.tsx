"use client";

import { useEffect, useState } from "react";
import { clearMembershipToken, getMembershipTokenFromStorage, saveMembershipToken } from "@/lib/membership-client";

const debugEnabled = process.env.NEXT_PUBLIC_MEMBERSHIP_DEBUG === "1";

export function MembershipTokenBanner() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!debugEnabled) return;
    const existing = getMembershipTokenFromStorage();
    if (existing) {
      setToken(existing);
      setStatus("token-loaded");
    }
    // debugEnabled is a build-time flag; safe to ignore exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!debugEnabled) {
    return (
      <div className="mb-4 rounded-2xl border border-dashed border-brand/40 bg-white/80 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">会員ステータス</p>
        <p className="text-xs text-slate-500">
          会員トークンはサーバー側で安全に管理されています。Stripe決済が完了すると自動的に会員機能が有効化されます。
        </p>
        <p className="mt-2 text-xs text-slate-500">問題が発生した場合はサポートまでご連絡ください。</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!token.trim()) {
      setStatus("empty");
      return;
    }
    saveMembershipToken(token.trim());
    setStatus("saved");
  };

  const handleClear = () => {
    clearMembershipToken();
    setToken("");
    setStatus("cleared");
  };

  return (
    <div className="mb-4 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/80 p-4 text-sm text-slate-600">
      <p className="font-semibold text-slate-900">管理者用: 会員トークン管理</p>
      <p className="text-xs text-slate-500">開発・検証のためにのみ使用してください。エンドユーザーには表示されません。</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="cus_xxx..."
          className="flex-1 rounded-xl border border-slate-200 p-2 text-sm"
        />
        <div className="flex gap-2">
          <button type="button" onClick={handleSave} className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white">
            保存
          </button>
          <button type="button" onClick={handleClear} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
            クリア
          </button>
        </div>
      </div>
      {status === "saved" && <p className="mt-2 text-xs text-emerald-600">保存しました。次回のAI呼び出しに使用されます。</p>}
      {status === "cleared" && <p className="mt-2 text-xs text-slate-500">トークンを削除しました。</p>}
      {status === "empty" && <p className="mt-2 text-xs text-rose-500">トークンを入力してください。</p>}
    </div>
  );
}
