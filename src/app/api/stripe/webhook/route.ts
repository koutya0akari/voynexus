import { NextResponse } from "next/server";
import type Stripe from "stripe";
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
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const client = getStripeForLivemode(event.livemode);

    if (!client) {
      console.error("Stripe client not available for webhook", { livemode: event.livemode });
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    try {
      const customer = await client.customers.retrieve(customerId, { expand: ["subscriptions"] });
      return NextResponse.json({
        ok: true,
        eventId: event.id,
        customerId,
        customer,
        subscription
      });
    } catch (error) {
      console.error("Failed to fetch customer for subscription", error);
      return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, received: event.type });
}
