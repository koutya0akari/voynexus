import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey ? new Stripe(secretKey) : null;

export function requireStripe() {
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return stripe;
}
