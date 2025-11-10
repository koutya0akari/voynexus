import { NextResponse } from "next/server";
import { getStripeForSession } from "@/lib/stripe";
import { createMembershipToken } from "@/lib/membership-token";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id query param is required" }, { status: 400 });
  }

  const stripe = getStripeForSession(sessionId);
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
    const customer = session.customer;
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const customerId = typeof customer === "string" ? customer : customer.id;
    const lineItems = session.line_items?.data?.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amountSubtotal: item.amount_subtotal,
      amountTotal: item.amount_total,
      currency: item.currency
    }));

    const token = createMembershipToken(customerId);
    const response = NextResponse.json({
      customerId,
      token,
      amountTotal: session.amount_total,
      currency: session.currency,
      lineItems
    });
    response.cookies.set({
      name: "membership_token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90
    });
    return response;
  } catch (error) {
    console.error("Stripe session lookup failed", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
