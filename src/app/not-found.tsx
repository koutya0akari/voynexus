"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-sm uppercase text-slate-500">404</p>
      <h1 className="text-3xl font-semibold text-slate-900">ページが見つかりません</h1>
      <p className="text-slate-500">URLをご確認いただくかトップへお戻りください。</p>
      <Link href="/ja" className="rounded-full bg-brand px-4 py-2 font-semibold text-white">
        トップへ戻る
      </Link>
    </div>
  );
}
