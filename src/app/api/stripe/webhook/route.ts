import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { updateMembershipPeriod } from "@/lib/membership-store";
import { getPlanByProductCode } from "@/lib/billing-plan-utils";
import { grantMeteredPassCredits } from "@/lib/metered-pass-store";
import { getStripeForLivemode, stripe } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!stripe) {
    console.error("Stripe client not configured");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const payload = await request.text();
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const client = getStripeForLivemode(event.livemode);

    if (!client) {
      console.error("Stripe client not available for webhook", { livemode: event.livemode });
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    try {
      const customer = await client.customers.retrieve(customerId, { expand: ["subscriptions"] });
      const periodStart = (
        subscription as Stripe.Subscription & { current_period_start?: number | null }
      ).current_period_start;
      const periodEnd = (
        subscription as Stripe.Subscription & { current_period_end?: number | null }
      ).current_period_end;
      if (periodStart && periodEnd) {
        await updateMembershipPeriod(
          customerId,
          new Date(periodStart * 1000),
          new Date(periodEnd * 1000)
        );
      }
      return NextResponse.json({
        ok: true,
        eventId: event.id,
        customerId,
        customer,
        subscription,
      });
    } catch (error) {
      console.error("Failed to fetch customer for subscription", error);
      return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId =
      typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (customerId) {
      const period =
        invoice.lines.data[0]?.period ??
        (invoice.period_start && invoice.period_end
          ? { start: invoice.period_start, end: invoice.period_end }
          : undefined);
      if (period?.start && period?.end) {
        await updateMembershipPeriod(
          customerId,
          new Date(period.start * 1000),
          new Date(period.end * 1000)
        );
      }
    }
    return NextResponse.json({ ok: true, received: event.type });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const planId = session.metadata?.plan_id;
    const planKind = session.metadata?.plan_kind;
    if (planId && planKind === "payment") {
      const plan = getPlanByProductCode(planId);
      const googleUserId = session.metadata?.google_user_id;
      const creditsFromMetadata = session.metadata?.plan_credits
        ? Number(session.metadata.plan_credits)
        : undefined;
      const credits = creditsFromMetadata ?? plan?.creditsPerPurchase ?? 0;
      if (googleUserId && credits > 0) {
        await grantMeteredPassCredits({
          googleUserId,
          planCode: planId,
          credits,
          source: "stripe",
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? undefined),
        });
      } else {
        console.warn("Incomplete metadata for metered Stripe session", {
          googleUserId,
          credits,
          planId,
        });
      }
    }
    return NextResponse.json({ ok: true, received: event.type });
  }

  return NextResponse.json({ ok: true, received: event.type });
}
