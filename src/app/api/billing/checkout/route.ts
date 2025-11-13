import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { requireStripe } from "@/lib/stripe";
import { billingPlans } from "@/data/billing-plans";
import { getPlanByProductCode, getStripePriceIdForPlan } from "@/lib/billing-plan-utils";

const schema = z.object({
  customerId: z.string().optional(),
  email: z.string().email().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  planId: z.string().optional(),
  planName: z.string().optional(),
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const defaultSuccess = ensureSuccessUrl(
  process.env.STRIPE_SUCCESS_URL ?? `${siteUrl}/billing/success`
);
const defaultCancel = process.env.STRIPE_CANCEL_URL ?? `${siteUrl}/`;
const defaultPlanId = billingPlans.find((plan) => plan.billingMode === "subscription")?.productCode;

function ensureSuccessUrl(url: string) {
  if (url.includes("{CHECKOUT_SESSION_ID}")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}session_id={CHECKOUT_SESSION_ID}`;
}

export async function POST(request: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json(
      { error: "Googleアカウントでログインしてください。" },
      { status: 401 }
    );
  }

  const stripe = requireStripe();
  const json = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const planId = parsed.data.planId ?? defaultPlanId;
  if (!planId) {
    return NextResponse.json({ error: "planId is required" }, { status: 400 });
  }

  const plan = getPlanByProductCode(planId);
  if (!plan || !plan.supportsCheckout) {
    return NextResponse.json({ error: "Unsupported plan" }, { status: 400 });
  }

  const priceId = getStripePriceIdForPlan(plan.productCode);
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price not configured for plan" }, { status: 500 });
  }

  if (!parsed.data.customerId && !parsed.data.email && !sessionUser.user.email) {
    return NextResponse.json(
      { error: "email is required when no Stripe customer is provided" },
      { status: 400 }
    );
  }

  const metadata: Record<string, string> = {
    plan_id: plan.productCode,
    plan_kind: plan.billingMode,
    plan_label: plan.displayName,
    google_user_id: sessionUser.user.id,
  };
  if (plan.creditsPerPurchase) {
    metadata.plan_credits = String(plan.creditsPerPurchase);
  }

  try {
    const planSuccessBase =
      parsed.data.successUrl ?? (plan.successPath ? `${siteUrl}${plan.successPath}` : undefined);
    const resolvedSuccessUrl = planSuccessBase ? ensureSuccessUrl(planSuccessBase) : defaultSuccess;

    const session = await stripe.checkout.sessions.create({
      mode: plan.billingMode === "subscription" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: parsed.data.customerId,
      customer_email: parsed.data.customerId
        ? undefined
        : (parsed.data.email ?? sessionUser.user.email ?? undefined),
      success_url: resolvedSuccessUrl,
      cancel_url: parsed.data.cancelUrl ?? defaultCancel,
      allow_promotion_codes: plan.billingMode === "subscription",
      metadata,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
