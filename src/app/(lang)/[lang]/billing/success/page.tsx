import Link from "next/link";
import { Suspense } from "react";
import { BillingSuccessContent } from "@/app/billing/success/content";

export const dynamic = "force-dynamic";

export default function LocaleBillingSuccessPage({
  params,
  searchParams
}: {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sessionIdParam = typeof searchParams.session_id === "string" ? searchParams.session_id : undefined;
  const homeHref = `/${params.lang}` as const;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
      <p className="text-sm uppercase text-brand">Voynex Billing</p>
      <h1 className="text-3xl font-semibold text-slate-900">決済が完了しました</h1>
      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">確認中...</div>}>
        <BillingSuccessContent fallbackSessionId={sessionIdParam} />
      </Suspense>
      <Link href={homeHref} className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
        ホームに戻る
      </Link>
    </div>
  );
}

export { generateMetadata } from "@/app/billing/success/page";
