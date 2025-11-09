"use client";

import { useEffect } from "react";
import { toast } from "@/components/toaster";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    toast("問題が発生しました。再読み込みしてください。");
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">エラーが発生しました</h1>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-brand px-4 py-2 font-semibold text-white"
      >
        再試行
      </button>
    </div>
  );
}
