import Link from "next/link";
import { cookies } from "next/headers";
import { verifyMembershipTokenValue } from "@/lib/membership";

export default async function MembersPage() {
  const membershipCookie = cookies().get("membership_token")?.value;
  const membership = membershipCookie ? await verifyMembershipTokenValue(membershipCookie) : { ok: false };

  if (!membership.ok) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <p className="text-sm uppercase text-brand">Voynex Membership</p>
        <h1 className="text-3xl font-semibold text-slate-900">会員専用ページ</h1>
        <div className="rounded-3xl border border-rose-200 bg-white p-6 text-rose-700">
          <p>会員トークンが確認できませんでした。決済完了ページのリンクまたは会員トークン欄を利用してサインインしてください。</p>
        </div>
        <Link href="/" className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
          トップに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16">
      <p className="text-sm uppercase text-brand">Voynex Membership</p>
      <h1 className="text-3xl font-semibold text-slate-900">AI機能を使いこなす</h1>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">StripeカスタマーID: {membership.memberId}</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>トップページに戻り、AIチャットまたは旅程生成を開きます。</li>
          <li>「会員トークン」を確認しておくと別デバイスでも同期できます。</li>
          <li>Stripeポータルからいつでも支払い方法を更新できます。</li>
        </ol>
      </div>
      <Link href="/" className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
        ホームへ
      </Link>
    </div>
  );
}
