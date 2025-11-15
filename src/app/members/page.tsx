import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import {
  verifyMembershipTokenValue,
  type MembershipSuccess,
  getMembershipStatusForUser,
} from "@/lib/membership";
import { getMeteredPassSummary } from "@/lib/metered-pass-store";

export default async function MembersPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (!session?.user || !userId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <p className="text-sm uppercase text-brand">Voynexus Membership</p>
        <h1 className="text-3xl font-semibold text-slate-900">会員専用ページ</h1>
        <div className="rounded-3xl border border-amber-200 bg-white p-6 text-slate-700">
          <p>会員ページを表示するにはGoogleアカウントでログインしてください。</p>
        </div>
        <Link
          href="/ja"
          className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
        >
          トップに戻る
        </Link>
      </div>
    );
  }

  const membershipCookie = cookies().get("membership_token")?.value;
  const membership = membershipCookie
    ? await verifyMembershipTokenValue(membershipCookie, userId)
    : await getMembershipStatusForUser(userId);
  const meteredSummary = await getMeteredPassSummary(userId);

  if (!membership.ok) {
    if (meteredSummary.totalRemaining > 0) {
      return (
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
          <p className="text-sm uppercase text-brand">Voynexus Membership</p>
          <h1 className="text-3xl font-semibold text-slate-900">従量パスのご利用状況</h1>
          <div className="rounded-3xl border border-dashed border-brand/40 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              サブスクリプションは未連携ですが、従量パスが残っています。AIチャット/旅程生成を実行すると1回ずつ消費されます。
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              残り {meteredSummary.totalRemaining} 回
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {meteredSummary.passes
                .filter((pass) => pass.remainingUses > 0)
                .map((pass) => (
                  <li key={pass.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <span className="font-semibold">{pass.planCode}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      残り {pass.remainingUses} 回
                      {pass.expiresAt
                        ? ` / 期限 ${new Date(pass.expiresAt).toLocaleDateString("ja-JP")}`
                        : ""}
                    </span>
                  </li>
                ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              使い切った後もAIを利用するには従量パスを追加でご購入ください。
            </p>
          </div>
          <Link
            href="/ja"
            className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
          >
            トップに戻る
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <p className="text-sm uppercase text-brand">Voynexus Membership</p>
        <h1 className="text-3xl font-semibold text-slate-900">会員専用ページ</h1>
        <div className="rounded-3xl border border-rose-200 bg-white p-6 text-rose-700">
          <p>
            {membership.message ??
              "会員トークンが確認できませんでした。決済完了ページのリンクから再度お試しください。"}
          </p>
        </div>
        <Link
          href="/ja"
          className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
        >
          トップに戻る
        </Link>
      </div>
    );
  }

  const activeMembership = membership as MembershipSuccess;

  if (activeMembership.accessType === "metered") {
    const remaining = activeMembership.meteredUsesRemaining ?? meteredSummary.totalRemaining;
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <p className="text-sm uppercase text-brand">Voynexus Membership</p>
        <h1 className="text-3xl font-semibold text-slate-900">従量パスのご利用状況</h1>
        <div className="rounded-3xl border border-dashed border-brand/40 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Googleアカウント: {session.user.email ?? "N/A"}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">残り {remaining} 回</p>
          <p className="mt-2 text-xs text-slate-500">
            AIチャットと旅程生成はいずれも1リクエストにつき1回分を消費します。
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {meteredSummary.passes
              .filter((pass) => pass.remainingUses > 0)
              .map((pass) => (
                <li key={pass.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <span className="font-semibold">{pass.planCode}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    残り {pass.remainingUses} 回
                    {pass.expiresAt
                      ? ` / 期限 ${new Date(pass.expiresAt).toLocaleDateString("ja-JP")}`
                      : ""}
                  </span>
                </li>
              ))}
          </ul>
        </div>
        <Link
          href="/ja"
          className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
        >
          ホームへ
        </Link>
      </div>
    );
  }

  const daysSincePayment = activeMembership.daysSincePayment ?? 0;
  const expiresAtDate = activeMembership.membershipExpiresAt
    ? new Date(activeMembership.membershipExpiresAt)
    : null;
  const daysRemaining = expiresAtDate
    ? Math.max(0, Math.ceil((expiresAtDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const hasMeteredAddOn = meteredSummary.totalRemaining > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16">
      <p className="text-sm uppercase text-brand">Voynexus Membership</p>
      <h1 className="text-3xl font-semibold text-slate-900">AI機能を使いこなす</h1>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">StripeカスタマーID: {activeMembership.memberId}</p>
        {session.user.email ? (
          <p className="mt-1 text-xs text-slate-500">
            リンク済みGoogleアカウント: {session.user.email}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-slate-500">最終決済から{daysSincePayment}日経過</p>
        <div className={`mt-4 grid gap-3 ${hasMeteredAddOn ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              メンバーシップ
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {daysRemaining !== null ? `${daysRemaining}日` : "更新待ち"}
            </p>
            {expiresAtDate ? (
              <p className="mt-1 text-[11px] text-slate-500">
                有効期限: {expiresAtDate.toLocaleString("ja-JP")}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-500">
                次の決済が完了すると残日数が表示されます。
              </p>
            )}
          </div>
          {hasMeteredAddOn ? (
            <div className="rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">従量パス</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {meteredSummary.totalRemaining}回
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                AIチャット／旅程生成を実行すると1回ずつ減ります。
              </p>
            </div>
          ) : null}
        </div>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>トップページに戻り、AIチャットまたは旅程生成を開きます。</li>
          <li>「会員トークン」を確認しておくと別デバイスでも同期できます。</li>
          <li>Stripeポータルからいつでも支払い方法を更新できます。</li>
        </ol>
      </div>
      <Link
        href="/ja"
        className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
      >
        ホームへ
      </Link>
      {meteredSummary.totalRemaining > 0 ? (
        <div className="rounded-3xl border border-dashed border-brand/40 bg-white/80 p-6 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">従量パスも併用できます</p>
          <p className="mt-1 text-xs text-slate-500">
            現在の残り: {meteredSummary.totalRemaining} 回
          </p>
          <p className="mt-2 text-xs text-slate-500">
            取材でサブスクを解約した後も、回数券でAI機能を引き続き利用できます。
          </p>
        </div>
      ) : null}
    </div>
  );
}
