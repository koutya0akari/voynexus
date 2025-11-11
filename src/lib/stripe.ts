import Stripe from "stripe";

const liveKey = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY_LIVE;
const testKey = process.env.STRIPE_TEST_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY_TEST ?? process.env.STRIPE_SECRET_KEY;

const stripeLive = liveKey ? new Stripe(liveKey) : null;
const stripeTest = testKey && testKey !== liveKey ? new Stripe(testKey) : stripeLive;

export const stripe = stripeLive ?? stripeTest ?? null;

export function requireStripe(sessionId?: string) {
  const client = getStripeForSession(sessionId);
  if (!client) {
    throw new Error("Stripe secret key is not configured.");
  }
  return client;
}

export function getStripeForSession(sessionId?: string) {
  if (!stripeLive && !stripeTest) return null;
  const wantsTest = sessionId?.includes("_test_");
  if (wantsTest && stripeTest) return stripeTest;
  if (!wantsTest && stripeLive) return stripeLive;
  return stripeLive ?? stripeTest ?? null;
}

export function getStripeForLivemode(livemode: boolean | null | undefined) {
  if (!stripeLive && !stripeTest) return null;
  if (livemode) return stripeLive ?? stripeTest ?? null;
  return stripeTest ?? stripeLive ?? null;
}

export async function retrieveSessionWithFallback(sessionId: string) {
  const clients: Stripe[] = [];
  const primary = getStripeForSession(sessionId);
  if (primary) clients.push(primary);
  if (stripeLive && !clients.includes(stripeLive)) clients.push(stripeLive);
  if (stripeTest && !clients.includes(stripeTest)) clients.push(stripeTest);

  let lastError: unknown;
  for (const client of clients) {
    try {
      return await client.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Unable to retrieve Stripe session");
}
