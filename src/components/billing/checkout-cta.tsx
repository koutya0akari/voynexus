"use client";

import Link from "next/link";
import type { Route } from "next";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { toast } from "@/components/toaster";
import { billingPlans, planTypeCopy, type PlanType } from "@/data/billing-plans";

type Props = {
  locale?: Locale;
};

export function BillingCheckoutCTA({ locale }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState<PlanType>("flat");
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    () => billingPlans.find((plan) => plan.type === "flat")?.id ?? billingPlans[0].id
  );

  const groupPlans = useMemo(
    () => billingPlans.filter((plan) => plan.type === activeGroup),
    [activeGroup]
  );

  useEffect(() => {
    if (!groupPlans.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId(groupPlans[0]?.id ?? billingPlans[0].id);
    }
  }, [groupPlans, selectedPlanId]);

  const selectedPlan =
    groupPlans.find((plan) => plan.id === selectedPlanId) ?? groupPlans[0] ?? billingPlans[0];

  const formatPrice = (value: number) => new Intl.NumberFormat("ja-JP").format(value);

  const contactHref = useMemo(
    () => ({
      pathname: (locale ? `/${locale}/contact` : "/contact") as Route,
      query: { topic: "billing" },
    }),
    [locale]
  );
  const partnersHref = useMemo(
    () => (locale ? `/${locale}/partners` : "/partners") as Route,
    [locale]
  );

  const startCheckout = async () => {
    if (!selectedPlan.supportsCheckout) {
      toast("従量プランはお問い合わせフォームからご購入いただけます。");
      return;
    }
    if (!email.trim()) {
      toast("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          planId: selectedPlan.productCode,
          planName: selectedPlan.displayName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to create checkout session");
      }
      if (!(data as { url?: string }).url) {
        throw new Error("Missing checkout URL");
      }
      window.location.href = (data as { url: string }).url;
    } catch (error) {
      console.error("Checkout start failed", error);
      toast(error instanceof Error ? error.message : "決済ページの生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const groupCopy = planTypeCopy[activeGroup];
  const planHints = groupPlans.map(
    (plan) => `${plan.displayName}: ¥${formatPrice(plan.priceJPY)} / ${plan.unitLabel}`
  );

  return (
    <div className="rounded-3xl border border-brand/40 bg-white/80 p-6 shadow-sm">
      <p className="text-xs uppercase text-brand">voynexus Membership</p>
      <h2 className="text-2xl font-semibold text-slate-900">プランを選んでAIパスを取得</h2>
      <p className="text-sm text-slate-600">
        長期ロケや連泊が多い方には定額パス、出張ついでの下見やFAQ確認だけなら従量パスがおすすめです。利用スタイルに合わせてプランを切り替えてください。
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["flat", "metered"] as PlanType[]).map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setActiveGroup(group)}
            className={clsx(
              "rounded-full border px-4 py-1 text-xs font-semibold transition",
              activeGroup === group
                ? "border-brand bg-brand/10 text-brand"
                : "border-slate-200 text-slate-500 hover:border-brand/40"
            )}
          >
            {planTypeCopy[group].title}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        {groupCopy.description}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {groupPlans.map((plan) => {
          const isSelected = plan.id === selectedPlan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={clsx(
                "w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition",
                isSelected
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand/40"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{plan.displayName}</p>
                {plan.badge ? (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                    {plan.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                ¥{formatPrice(plan.priceJPY)}
                <span className="ml-1 text-xs font-normal text-slate-500">{plan.unitLabel}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-500">{selectedPlan.bestFor}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500">
        {planHints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-slate-500">
        企業・自治体向けの紹介ページは{" "}
        <Link href={partnersHref} className="text-brand underline underline-offset-2">
          こちら
        </Link>
        からご覧いただけます。
      </p>

      {selectedPlan.supportsCheckout ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-xl border border-slate-200 p-3 text-sm"
          />
          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "処理中..." : `${selectedPlan.displayName}を購入`}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4 text-sm text-slate-700">
          <p>
            従量パスは担当スタッフが回数券を即時発行します。内容を確認のうえメールまたはお問い合わせフォームからご依頼ください。
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href="mailto:billing@voynexus.jp"
              className="rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand"
            >
              billing@voynexus.jp
            </a>
            <Link
              href={contactHref}
              className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
            >
              フォームで連絡
            </Link>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        決済完了後は確認メールに領収書と会員ポータルへのリンクが届きます。従量パスの場合は担当者から合計金額と支払い方法をご案内します。
      </p>
    </div>
  );
}
