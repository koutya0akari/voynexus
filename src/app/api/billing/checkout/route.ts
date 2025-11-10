import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStripe } from "@/lib/stripe";

const schema = z.object({
  customerId: z.string().optional(),
  email: z.string().email().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

const priceId = process.env.STRIPE_PRICE_ID;
const defaultSuccess = process.env.STRIPE_SUCCESS_URL ?? "https://example.com/billing/success";
const defaultCancel = process.env.STRIPE_CANCEL_URL ?? "https://example.com/billing/cancel";

export async function POST(request: Request) {
  if (!priceId) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID is not configured" }, { status: 500 });
  }

  const stripe = requireStripe();
  const json = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!parsed.data.customerId && !parsed.data.email) {
    return NextResponse.json({ error: "email or customerId is required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: parsed.data.customerId,
      customer_email: parsed.data.customerId ? undefined : parsed.data.email,
      success_url: parsed.data.successUrl ?? defaultSuccess,
      cancel_url: parsed.data.cancelUrl ?? defaultCancel,
      allow_promotion_codes: true
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!priceId) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID is not configured" }, { status: 500 });
  }

  const stripe = requireStripe();
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") ?? undefined;
  const email = searchParams.get("email") ?? undefined;
  const successUrl = searchParams.get("successUrl") ?? defaultSuccess;
  const cancelUrl = searchParams.get("cancelUrl") ?? defaultCancel;

  if (!customerId && !email) {
    return NextResponse.json({ error: "email or customerId is required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      customer_email: customerId ? undefined : email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout session missing URL" }, { status: 500 });
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    console.error("Stripe checkout redirect error", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
