import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";

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
    return NextResponse.json({ customerId });
  } catch (error) {
    console.error("Stripe session lookup failed", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
