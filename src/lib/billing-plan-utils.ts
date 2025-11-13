import { billingPlans, findPlanByProductCode } from "@/data/billing-plans";

const stripePriceMap: Record<string, string | undefined> = {
  "Voynexus-AI-Pro-7days":
    process.env.STRIPE_PRICE_ID_PRO_7D ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_7D,
  "Voynexus-AI-Pro-1day":
    process.env.STRIPE_PRICE_ID_PRO_1D ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_1D,
  "Voynexus-AI-7day":
    process.env.STRIPE_PRICE_ID_STD_7D ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STD_7D,
  "Voynexus-AI-1day":
    process.env.STRIPE_PRICE_ID_STD_1D ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STD_1D,
  "Voynexus-AI-Pro-5回":
    process.env.STRIPE_PRICE_ID_PRO_5U ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_5U,
  "Voynexus-AI-Pro-1回":
    process.env.STRIPE_PRICE_ID_PRO_1U ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_1U,
  "Voynexus-AI-5回":
    process.env.STRIPE_PRICE_ID_STD_5U ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STD_5U,
  "Voynexus-AI-1回":
    process.env.STRIPE_PRICE_ID_STD_1U ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STD_1U,
};

export function getPlanByProductCode(productCode: string) {
  return findPlanByProductCode(productCode);
}

export function getStripePriceIdForPlan(productCode: string): string | undefined {
  return stripePriceMap[productCode];
}

export function listCheckoutReadyPlans() {
  return billingPlans.filter((plan) => plan.supportsCheckout);
}
