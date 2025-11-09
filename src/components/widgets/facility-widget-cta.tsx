"use client";

import { useState } from "react";
import { toast } from "@/components/toaster";

type Props = {
  locale: string;
};

export function FacilityWidgetCTA({ locale }: Props) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokushima.example.com"}/widget.js" data-lang="${locale}" async></script>`;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast("Widget code copied! Add it to your facility site.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mx-auto mt-12 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm uppercase text-brand">Facility Widget</p>
          <h3 className="text-xl font-semibold text-slate-900">多言語AIウィジェットで問い合わせ削減</h3>
        </div>
        <p className="text-sm text-slate-600">
          FAQ優先回答 / 予約リンク誘導 / NGワード検知→スタッフ連絡先表示 のフローを1つのスクリプトで。
        </p>
        <code className="rounded-xl bg-slate-900/90 p-3 text-xs text-slate-100">{snippet}</code>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copy}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
          >
            {copied ? "Copied!" : "コピー"}
          </button>
          <a
            href="https://form.tokushima.example.com/widget-demo"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand"
          >
            デモを見る
          </a>
        </div>
      </div>
    </section>
  );
}
