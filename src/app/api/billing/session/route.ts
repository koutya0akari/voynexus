import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";
import { createMembershipToken } from "@/lib/membership-token";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id query param is required" }, { status: 400 });
  }

  const stripe = requireStripe();
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customer = session.customer;
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const customerId = typeof customer === "string" ? customer : customer.id;
    const token = createMembershipToken(customerId);
    const response = NextResponse.json({ customerId, token });
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
