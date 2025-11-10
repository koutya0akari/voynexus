import Stripe from "stripe";

const liveKey = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY_LIVE;
const testKey = process.env.STRIPE_TEST_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY_TEST;

const stripeLive = liveKey ? new Stripe(liveKey) : null;
const stripeTest = testKey ? new Stripe(testKey) : null;

export const stripe = stripeLive ?? stripeTest;

export function requireStripe(sessionId?: string) {
  const client = getStripeForSession(sessionId);
  if (!client) {
    throw new Error("Stripe secret key is not configured.");
  }
  return client;
}

export function getStripeForSession(sessionId?: string) {
  const wantsTest = sessionId?.includes("_test_");
  if (wantsTest && stripeTest) return stripeTest;
  return stripeLive ?? stripeTest ?? null;
}
