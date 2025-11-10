"use client";

import { useEffect, useState } from "react";
import { clearMembershipToken, getMembershipTokenFromStorage, saveMembershipToken } from "@/lib/membership-client";

export function MembershipTokenBanner() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const existing = getMembershipTokenFromStorage();
    if (existing) {
      setToken(existing);
      setStatus("token-loaded");
    }
  }, []);

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
    <div className="mb-4 rounded-2xl border border-dashed border-brand/40 bg-white/80 p-4 text-sm text-slate-600">
      <p className="font-semibold text-slate-900">会員トークン</p>
      <p className="text-xs text-slate-500">Stripe決済後に表示されるカスタマーIDを貼り付けるとAI機能を解放できます。</p>
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
