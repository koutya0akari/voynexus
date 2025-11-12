import { cookies } from "next/headers";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { verifyMembershipTokenValue, type MembershipSuccess } from "@/lib/membership";

export type AiAccessDeniedReason = "not-logged-in" | "missing-token" | "membership-invalid";

export type AiAccessAllowed = {
  ok: true;
  session: Session;
  membership: MembershipSuccess;
};

export type AiAccessDenied = {
  ok: false;
  reason: AiAccessDeniedReason;
  message: string;
  status: number;
};

export type AiAccessStatus = AiAccessAllowed | AiAccessDenied;

export async function getAiAccessStatus(): Promise<AiAccessStatus> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      reason: "not-logged-in",
      message: "GoogleアカウントでログインするとAI機能が解放されます。",
      status: 401,
    };
  }

  const token = cookies().get("membership_token")?.value;

  if (!token) {
    return {
      ok: false,
      reason: "missing-token",
      message: "AI機能を利用するには会員登録と決済が必要です。",
      status: 402,
    };
  }

  const membership = await verifyMembershipTokenValue(token, session.user.id);
  if (!membership.ok) {
    return {
      ok: false,
      reason: "membership-invalid",
      message: membership.message ?? "アクティブなメンバーシップが必要です。",
      status: membership.status ?? 403,
    };
  }

  return {
    ok: true,
    session,
    membership,
  };
}
