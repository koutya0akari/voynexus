import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BillingSuccessContent } from "./content";

export const dynamic = "force-dynamic";

export const generateMetadata = async (): Promise<Metadata> => ({
  title: "Billing Success | voynexus",
  description: "Stripe決済が完了しました。会員トークンを保存しています。",
});

export default function BillingSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sessionIdParam =
    typeof searchParams.session_id === "string" ? searchParams.session_id : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
      <p className="text-sm uppercase text-brand">voynexus Billing</p>
      <h1 className="text-3xl font-semibold text-slate-900">決済が完了しました</h1>
      <Suspense
        fallback={
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            確認中...
          </div>
        }
      >
        <BillingSuccessContent fallbackSessionId={sessionIdParam} />
      </Suspense>
      <Link
        href="/ja"
        className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
