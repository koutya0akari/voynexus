type Props = {
  locale: string;
};

export function FacilityWidgetCTA({ locale }: Props) {
  const contactHref = `/${locale}/contact#ads`;

  return (
    <section className="mx-auto mt-12 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase text-brand">Local facility support</p>
          <h3 className="text-xl font-semibold text-slate-900">施設・観光案内所のみなさまへ</h3>
        </div>
        <p className="text-sm text-slate-600">
          Voynezusのチャット窓口とFAQボードを設置すると、多言語での問い合わせ対応やクーポン案内を旅行者向けアプリと同じ品質で提供できます。導入手順はシンプルで、案内資料に沿ってすぐに開始できます。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>雨天時や時間外でも自動案内できる多言語チャット</li>
          <li>スタッフにエスカレーションすべきワードは即時通知</li>
          <li>施設限定クーポンや予約ページを明示して案内</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <a
            href={contactHref}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
          >
            資料を請求する
          </a>
          <a
            href="mailto:partners@voynexus.jp"
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand"
          >
            導入について相談
          </a>
        </div>
      </div>
    </section>
  );
}
