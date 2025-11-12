"use client";

import { useState } from "react";
import { toast } from "@/components/toaster";

type Props = {
  locale: string;
  widgetOrigin: string;
};

export function FacilityWidgetCTA({ locale, widgetOrigin }: Props) {
  const [copied, setCopied] = useState(false);
  const baseOrigin =
    widgetOrigin && widgetOrigin.trim().length > 0 ? widgetOrigin : "https://voynezus.com";
  const normalizedOrigin = baseOrigin.replace(/\/+$/, "");
  const scriptSrc = `${normalizedOrigin}/widget.js`;
  const snippet = `<script src="${scriptSrc}" data-lang="${locale}" async></script>`;

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
          <p className="text-sm uppercase text-brand">Facility & Ad Widget</p>
          <h3 className="text-xl font-semibold text-slate-900">
            旅前広告と現地FAQをひとつのタグで
          </h3>
        </div>
        <p className="text-sm text-slate-600">
          多言語AIがFAQを先に回答し、必要に応じてスポンサー枠・予約リンク・クーポンを明示して表示します。NGワード検知でスタッフへの引き継ぎも可能です。
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
            href="https://voynezus.com/partners"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand"
          >
            広告メニューを見る
          </a>
        </div>
      </div>
    </section>
  );
}
