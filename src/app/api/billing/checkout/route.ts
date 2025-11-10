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
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
