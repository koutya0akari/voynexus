import type Stripe from "stripe";
import { auth } from "@/auth";
import { verifyMembershipToken } from "@/lib/membership-token";
import { getMembershipByCustomerId } from "@/lib/membership-store";
import { stripe } from "@/lib/stripe";

const fallbackToken = process.env.MEMBERSHIP_TEST_TOKEN;
const allowedStatuses = new Set(["active", "trialing", "past_due"]);

export type MembershipSuccess = {
  ok: true;
  memberId: string;
  email?: string;
  daysSincePayment?: number;
  membershipExpiresAt?: string;
  linkedGoogleUserId?: string;
};

export type MembershipFailure = {
  ok: false;
  status: number;
  message: string;
};

function extractToken(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  const headerToken = request.headers.get("x-membership-token");
  if (headerToken) {
    return headerToken;
  }
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split(";");
  for (const entry of cookies) {
    const [name, ...rest] = entry.split("=");
    if (name.trim() === "membership_token") {
      return decodeURIComponent(rest.join("=") ?? "").trim() || null;
    }
  }
  return null;
}

export async function verifyMembership(request: Request): Promise<MembershipSuccess | MembershipFailure> {
  const token = extractToken(request);
  if (!token) {
    return { ok: false, status: 401, message: "Membership token is required." };
  }
  if (fallbackToken && token === fallbackToken) {
    return { ok: true, memberId: "test" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, status: 401, message: "Googleアカウントでのログインが必要です。" };
  }

  return verifyMembershipTokenValue(token, session.user.id);
}

export async function verifyMembershipTokenValue(token: string, googleUserId?: string): Promise<MembershipSuccess | MembershipFailure> {
  if (fallbackToken && token === fallbackToken) {
    return { ok: true, memberId: "test", linkedGoogleUserId: googleUserId };
  }

  const tokenInfo = verifyMembershipToken(token);
  const customerId = tokenInfo?.customerId ?? token;

  if (!stripe) {
    console.error("Stripe is not configured; cannot verify membership");
    return { ok: false, status: 500, message: "Membership service unavailable." };
  }

  try {
    const membershipRecord = await getMembershipByCustomerId(customerId);
    if (membershipRecord && googleUserId && membershipRecord.googleUserId !== googleUserId) {
      return { ok: false, status: 403, message: "この会員情報は別のGoogleアカウントに紐付いています。" };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method"],
      limit: 10
    });

    const active = subscriptions.data.find((sub) => allowedStatuses.has(sub.status));
    if (!active) {
      return { ok: false, status: 402, message: "Active membership required." };
    }

    const now = Date.now();
    let daysSincePayment: number | undefined;
    let membershipExpiresAt: string | undefined;
    let email: string | undefined;

    if (membershipRecord) {
      const lastPaymentTime = membershipRecord.lastPaymentAt.getTime();
      daysSincePayment = Math.floor((now - lastPaymentTime) / (1000 * 60 * 60 * 24));
      membershipExpiresAt = membershipRecord.membershipExpiresAt.toISOString();
      email = membershipRecord.email;
    } else {
      const periodInfo = active as Stripe.Subscription & {
        current_period_start?: number | null;
        current_period_end?: number | null;
      };
      if (periodInfo.current_period_start) {
        daysSincePayment = Math.floor((now - periodInfo.current_period_start * 1000) / (1000 * 60 * 60 * 24));
      }
      if (periodInfo.current_period_end) {
        membershipExpiresAt = new Date(periodInfo.current_period_end * 1000).toISOString();
      }
    }

    return {
      ok: true,
      memberId: customerId,
      email,
      daysSincePayment,
      membershipExpiresAt,
      linkedGoogleUserId: membershipRecord?.googleUserId ?? googleUserId
    };
  } catch (error) {
    console.error("Stripe membership lookup failed", error);
    return { ok: false, status: 502, message: "Membership service unavailable." };
  }
}
