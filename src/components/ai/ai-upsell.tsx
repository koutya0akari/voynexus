"use client";

import Link from "next/link";
import type { Route } from "next";
import type { Locale } from "@/lib/i18n";
import type { AiAccessDenied, AiAccessDeniedReason } from "@/lib/ai-access";
import { BillingCheckoutCTA } from "@/components/billing/checkout-cta";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { useMeteredUsage } from "@/hooks/use-metered-usage";

type Props = {
  locale: Locale;
  denied?: AiAccessDenied;
};

const reasonCopy: Record<AiAccessDeniedReason, { badge: string; description: string }> = {
  "not-logged-in": {
    badge: "ログインが必要です",
    description:
      "voynexusのAI機能はGoogleアカウントでログインした状態でのみ利用できます。右上のログインボタン、もしくは下のボタンからサインインしてください。",
  },
  "missing-token": {
    badge: "決済が未完了です",
    description:
      "決済完了後に発行される会員トークンが確認できませんでした。Stripeでのサブスクリプション登録が完了しているかご確認ください。",
  },
  "membership-invalid": {
    badge: "メンバーシップを確認してください",
    description:
      "Stripeの課金ステータスを確認できませんでした。決済メールのリンクからもう一度完了ページを開くか、サポートまでご連絡ください。",
  },
};

const steps = [
  {
    title: "1. Googleでサインイン",
    body: "右上のメニュー、または下のボタンからGoogleログインします。旅の好みは後から変更できます。",
  },
  {
    title: "2. プランを選んで決済",
    body: "定額パス（1日/7日）か従量パス（回数制）を選び、メールアドレスを入力します。決済完了と同時に会員トークンが保存されます。",
  },
  {
    title: "3. AIチャット/旅程生成を起動",
    body: "現地での調整や離島移動もAIコンシェルジュがサポート。PDF保存や共有リンクも利用できます。",
  },
];

const benefits = [
  "現地取材データ＋RAGで安全な回答を得られるAIチャット",
  "営業時間/最終バス/潮汐を反映した旅程自動生成とPDF出力",
  "Stripeポータルでの支払い管理と領収書ダウンロード",
  "会員専用ウィジェット＆今後の機能プレビューへの早期アクセス",
  "スポンサー連携による限定クーポンや試遊会情報を優先表示",
];

export function AiUpsell({ locale, denied }: Props) {
  const membersHref = `/${locale}/members` as Route;
  const loginReason = denied ? reasonCopy[denied.reason] : null;
  const { summary: meteredSummary } = useMeteredUsage(0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <section className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-brand">voynexus Membership</p>
        <h1 className="text-3xl font-semibold text-slate-900">AIコンシェルジュは会員限定です</h1>
        <p className="text-sm text-slate-600">
          {loginReason?.description ??
            "Googleアカウントでログインし、定額または従量プランを選んでStripe決済を完了するとAIチャットと旅程生成が解放されます。"}
        </p>
        {meteredSummary.totalRemaining > 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            従量パスの残り: {meteredSummary.totalRemaining} 回
          </div>
        ) : null}
        {loginReason ? (
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold text-amber-800">
            {loginReason.badge}
          </span>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_minmax(320px,0.9fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">アクセス手順</h2>
          <ol className="mt-4 space-y-4 text-sm text-slate-600">
            {steps.map((step) => (
              <li key={step.title}>
                <p className="font-semibold text-slate-800">{step.title}</p>
                <p className="text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <GoogleLoginButton
              callbackUrl={`/${locale}/chat`}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-70"
            />
            <Link
              href={membersHref}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand hover:text-brand"
            >
              会員ステータスを確認
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            決済成功ページを表示すると会員トークンがHTTP-onlyクッキーとして保存され、安全にAIリクエストへ付与されます。
          </p>
        </div>
        <BillingCheckoutCTA locale={locale} />
      </div>

      <div className="rounded-3xl border border-dashed border-brand/40 bg-white/80 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">メンバー特典</h3>
        <ul className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="rounded-2xl border border-slate-100 bg-white/70 p-4">
              {benefit}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          Googleログインと決済が完了すると、AIチャット/旅程生成に加えて今後のアルファ機能にも優先的にアクセスできます。
        </p>
      </div>
    </div>
  );
}
