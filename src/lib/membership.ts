import { stripe } from "@/lib/stripe";

const fallbackToken = process.env.MEMBERSHIP_TEST_TOKEN;
const allowedStatuses = new Set(["active", "trialing", "past_due"]);

function extractToken(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return request.headers.get("x-membership-token") ?? null;
}

export async function verifyMembership(request: Request): Promise<{ ok: true; memberId?: string } | { ok: false; status: number; message: string }> {
  const token = extractToken(request);
  if (!token) {
    return { ok: false, status: 401, message: "Membership token is required." };
  }

  if (fallbackToken && token === fallbackToken) {
    return { ok: true };
  }

  if (!stripe) {
    console.error("Stripe is not configured; cannot verify membership");
    return { ok: false, status: 500, message: "Membership service unavailable." };
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: token,
      status: "all",
      expand: ["data.default_payment_method"],
      limit: 10
    });

    const active = subscriptions.data.find((sub) => allowedStatuses.has(sub.status));
    if (!active) {
      return { ok: false, status: 402, message: "Active membership required." };
    }

    return { ok: true, memberId: token };
  } catch (error) {
    console.error("Stripe membership lookup failed", error);
    return { ok: false, status: 502, message: "Membership service unavailable." };
  }
}
