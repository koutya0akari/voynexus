"use client";

import Link from "next/link";
import type { Route } from "next";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n";
import { toast } from "@/components/toaster";
import { billingPlans } from "@/data/billing-plans";

type Props = {
  locale?: Locale;
};

export function BillingCheckoutCTA({ locale }: Props) {
  const tBilling = useTranslations("billing");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => billingPlans[0]?.id ?? "");

  const localizedPlans = billingPlans.map((plan) => ({
    ...plan,
    unitLabel: tBilling(`plans.${plan.id}.unitLabel`),
    description: tBilling(`plans.${plan.id}.description`),
    bestFor: tBilling(`plans.${plan.id}.bestFor`),
  }));

  const selectedPlan =
    localizedPlans.find((plan) => plan.id === selectedPlanId) ?? localizedPlans[0];

  const formatPrice = (value: number) => new Intl.NumberFormat(locale ?? "ja-JP").format(value);

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
    if (!selectedPlan) {
      toast(tBilling("toasts.noPlan"));
      return;
    }
    if (!selectedPlan.supportsCheckout) {
      toast(tBilling("toasts.contactSales"));
      return;
    }
    if (!email.trim()) {
      toast(tBilling("toasts.emailRequired"));
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
        throw new Error((data as { error?: string }).error ?? tBilling("toasts.checkoutError"));
      }
      if (!(data as { url?: string }).url) {
        throw new Error(tBilling("errors.missingCheckoutUrl"));
      }
      window.location.href = (data as { url: string }).url;
    } catch (error) {
      console.error("Checkout start failed", error);
      toast(error instanceof Error ? error.message : tBilling("toasts.checkoutError"));
    } finally {
      setLoading(false);
    }
  };

  const planHints = localizedPlans.map((plan) =>
    tBilling("planHint", {
      name: plan.displayName,
      price: formatPrice(plan.priceJPY),
      unit: plan.unitLabel,
    })
  );

  return (
    <div className="rounded-3xl border border-brand/40 bg-white/80 p-6 shadow-sm">
      <p className="text-xs uppercase text-brand">{tBilling("eyebrow")}</p>
      <h2 className="text-2xl font-semibold text-slate-900">{tBilling("title")}</h2>
      <p className="text-sm text-slate-600">{tBilling("description")}</p>

      <p className="mt-4 text-xs uppercase text-brand">{tBilling("planType.metered.title")}</p>
      <div className="mt-1 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        {tBilling("planType.metered.description")}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {localizedPlans.map((plan) => {
          const isSelected = plan.id === selectedPlan?.id;
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

      {selectedPlan ? (
        <>
          <p className="mt-3 text-xs text-slate-500">{selectedPlan.bestFor}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500">
            {planHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-xs text-rose-500">{tBilling("noPlans")}</p>
      )}
      <p className="mt-2 text-xs text-slate-500">
        {tBilling("partners.description")}{" "}
        <Link href={partnersHref} className="text-brand underline underline-offset-2">
          {tBilling("partners.linkLabel")}
        </Link>{" "}
        {tBilling("partners.suffix")}
      </p>

      {selectedPlan?.supportsCheckout ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={tBilling("form.emailPlaceholder")}
            className="flex-1 rounded-xl border border-slate-200 p-3 text-sm"
          />
          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading
              ? tBilling("form.processing")
              : tBilling("form.purchase", { plan: selectedPlan.displayName })}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4 text-sm text-slate-700">
          <p>{tBilling("manual.description")}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href="mailto:info@voynexus.com"
              className="rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand"
            >
              info@voynexus.com
            </a>
            <Link
              href={contactHref}
              className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
            >
              {tBilling("manual.contactButton")}
            </Link>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">{tBilling("notes.checkoutInfo")}</p>
    </div>
  );
}
