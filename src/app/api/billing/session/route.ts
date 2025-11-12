import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createMembershipToken } from "@/lib/membership-token";
import { upsertMembershipRecord } from "@/lib/membership-store";
import { retrieveSessionWithFallback } from "@/lib/stripe";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id query param is required" }, { status: 400 });
  }
  const secureCookie = process.env.NODE_ENV === "production";

  try {
    const session = await retrieveSessionWithFallback(sessionId);
    const customer = session.customer;
    const paymentStatus = session.payment_status ?? "unpaid";
    const paymentSettled = paymentStatus === "paid" || paymentStatus === "no_payment_required";
    const completed = session.status === "complete" && paymentSettled;

    if (!completed || !customer) {
      const pendingReason = !customer
        ? "missing-customer"
        : paymentSettled
          ? "session-incomplete"
          : "payment-incomplete";
      return NextResponse.json(
        {
          pending: true,
          pendingReason,
          sessionStatus: session.status,
          paymentStatus,
          customerPresent: Boolean(customer),
          sessionId,
        },
        { status: 202 }
      );
    }
    const customerId = typeof customer === "string" ? customer : customer.id;
    const lineItems = session.line_items?.data?.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amountSubtotal: item.amount_subtotal,
      amountTotal: item.amount_total,
      currency: item.currency,
    }));

    const token = createMembershipToken(customerId);
    let linkStatus: "linked" | "skipped" | "conflict" | "unauthenticated" = "skipped";

    try {
      const sessionUser = await auth();
      if (sessionUser?.user?.id && sessionUser.user.email) {
        const createdAt = session.created ? new Date(session.created * 1000) : new Date();
        let lastPaymentAt = createdAt;
        let membershipExpiresAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        const subscription =
          session.subscription && typeof session.subscription !== "string"
            ? (session.subscription as Stripe.Subscription)
            : null;
        if (subscription) {
          const periodStart = (
            subscription as Stripe.Subscription & { current_period_start?: number | null }
          ).current_period_start;
          const periodEnd = (
            subscription as Stripe.Subscription & { current_period_end?: number | null }
          ).current_period_end;
          if (periodStart) {
            lastPaymentAt = new Date(periodStart * 1000);
          }
          if (periodEnd) {
            membershipExpiresAt = new Date(periodEnd * 1000);
          }
        }

        const result = await upsertMembershipRecord({
          googleUserId: sessionUser.user.id,
          email: sessionUser.user.email,
          stripeCustomerId: customerId,
          lastPaymentAt,
          membershipExpiresAt,
        });
        linkStatus = result;
      } else {
        linkStatus = "unauthenticated";
      }
    } catch (linkError) {
      console.error("Failed to link membership record", linkError);
    }

    const response = NextResponse.json({
      customerId,
      amountTotal: session.amount_total,
      currency: session.currency,
      lineItems,
      linkStatus,
      sessionStatus: session.status,
      paymentStatus,
      livemode: session.livemode,
    });
    response.cookies.set({
      name: "membership_token",
      value: token,
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    return response;
  } catch (error) {
    console.error("Stripe session lookup failed", error);
    const fallbackToken = process.env.MEMBERSHIP_TEST_TOKEN;
    if (fallbackToken) {
      // Allow local development to continue even when Stripe is not reachable.
      const response = NextResponse.json({
        customerId: "test-customer",
        fallback: true,
        linkStatus: "skipped",
      });
      response.cookies.set({
        name: "membership_token",
        value: fallbackToken,
        httpOnly: true,
        secure: secureCookie,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }
    const detail = error instanceof Error ? error.message : "Unknown error";
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code)
        : undefined;
    return NextResponse.json({ error: "Failed to fetch session", detail, code }, { status: 500 });
  }
}
