import Link from "next/link";

type Props = {
  locale: string;
};

export function FacilityWidgetCTA({ locale }: Props) {
  return (
    <section className="mx-auto mt-12 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase text-brand">Local facility support</p>
          <h3 className="text-xl font-semibold text-slate-900">施設・観光案内所のみなさまへ</h3>
        </div>
        <p className="text-sm text-slate-600">
          voynexusのチャット窓口とFAQボードを設置すると、多言語での問い合わせやクーポン案内を旅行者アプリと同じ品質で提供できます。導入方法やスポンサー掲載ルールをまとめた専用ページを公開しました。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>雨天時や時間外でも自動案内できる多言語チャット</li>
          <li>スタッフにエスカレーションすべきワードは即時通知</li>
          <li>施設限定クーポンや予約ページを明示して案内</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/partners`}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
          >
            専用ページを見る
          </Link>
          <a
            href="mailto:info@voynexus.com"
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand"
          >
            導入について相談
          </a>
        </div>
      </div>
    </section>
  );
}
