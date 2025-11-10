import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStripe } from "@/lib/stripe";

const schema = z.object({ customerId: z.string(), returnUrl: z.string().url().optional() });

const defaultReturn = process.env.STRIPE_SUCCESS_URL ?? "https://example.com/billing";

export async function POST(request: Request) {
  const stripe = requireStripe();
  const json = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: parsed.data.customerId,
      return_url: parsed.data.returnUrl ?? defaultReturn
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal session error", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
