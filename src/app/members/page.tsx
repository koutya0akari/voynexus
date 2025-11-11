import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { verifyMembershipTokenValue, type MembershipSuccess } from "@/lib/membership";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <p className="text-sm uppercase text-brand">Voynex Membership</p>
        <h1 className="text-3xl font-semibold text-slate-900">会員専用ページ</h1>
        <div className="rounded-3xl border border-amber-200 bg-white p-6 text-slate-700">
          <p>会員ページを表示するにはGoogleアカウントでログインしてください。</p>
        </div>
        <Link href="/ja" className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
          トップに戻る
        </Link>
      </div>
    );
  }

  const membershipCookie = cookies().get("membership_token")?.value;
  const membership = membershipCookie
    ? await verifyMembershipTokenValue(membershipCookie, session.user.id)
    : { ok: false, status: 401, message: "会員トークンが見つかりませんでした。" };

  if (!membership.ok) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <p className="text-sm uppercase text-brand">Voynex Membership</p>
        <h1 className="text-3xl font-semibold text-slate-900">会員専用ページ</h1>
        <div className="rounded-3xl border border-rose-200 bg-white p-6 text-rose-700">
          <p>{membership.message ?? "会員トークンが確認できませんでした。決済完了ページのリンクから再度お試しください。"}</p>
        </div>
        <Link href="/ja" className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
          トップに戻る
        </Link>
      </div>
    );
  }

  const activeMembership = membership as MembershipSuccess;
  const daysSincePayment = activeMembership.daysSincePayment ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16">
      <p className="text-sm uppercase text-brand">Voynex Membership</p>
      <h1 className="text-3xl font-semibold text-slate-900">AI機能を使いこなす</h1>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">StripeカスタマーID: {activeMembership.memberId}</p>
        {session.user.email ? (
          <p className="mt-1 text-xs text-slate-500">リンク済みGoogleアカウント: {session.user.email}</p>
        ) : null}
        {activeMembership.membershipExpiresAt ? (
          <p className="mt-2 text-xs text-slate-500">
            最終決済から{daysSincePayment}日経過・有効期限: {new Date(activeMembership.membershipExpiresAt).toLocaleString("ja-JP")}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">最終決済から{daysSincePayment}日経過</p>
        )}
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>トップページに戻り、AIチャットまたは旅程生成を開きます。</li>
          <li>「会員トークン」を確認しておくと別デバイスでも同期できます。</li>
          <li>Stripeポータルからいつでも支払い方法を更新できます。</li>
        </ol>
      </div>
      <Link href="/ja" className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">
        ホームへ
      </Link>
    </div>
  );
}
