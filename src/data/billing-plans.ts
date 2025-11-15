export type PlanType = "metered";

export type BillingMode = "subscription" | "payment";

export type BillingPlan = {
  id: string;
  productCode: string;
  displayName: string;
  priceJPY: number;
  unitLabel: string;
  description: string;
  bestFor: string;
  type: PlanType;
  tier: "pro" | "standard";
  supportsCheckout: boolean;
  billingMode: BillingMode;
  creditsPerPurchase?: number;
  successPath?: string;
  badge?: string;
};

export const billingPlans: BillingPlan[] = [
  {
    id: "pro-5",
    productCode: "Voynexus-AI-Pro-5回",
    displayName: "Voynexus-AI-Pro-5回",
    priceJPY: 1400,
    unitLabel: "5回 / 税抜",
    description: "高度なAI回答を少量だけ確認したい方向け",
    bestFor: "特定スポットの安全情報やスポンサー枠を事前に確認したい場合。",
    type: "metered",
    tier: "pro",
    supportsCheckout: true,
    billingMode: "payment",
    creditsPerPurchase: 5,
  },
  {
    id: "pro-1",
    productCode: "Voynexus-AI-Pro-1回",
    displayName: "Voynexus-AI-Pro-1回",
    priceJPY: 300,
    unitLabel: "1回 / 税抜",
    description: "ピンポイントの検証や監修に便利",
    bestFor: "1問だけAIに確認しておきたい現場チェック用。",
    type: "metered",
    tier: "pro",
    supportsCheckout: true,
    billingMode: "payment",
    creditsPerPurchase: 1,
  },
  {
    id: "std-5",
    productCode: "Voynexus-AI-5回",
    displayName: "Voynexus-AI-5回",
    priceJPY: 500,
    unitLabel: "5回 / 税抜",
    description: "家族や小規模チームでの下見に",
    bestFor: "旅程の一部だけAIに調整を任せたい場合。",
    type: "metered",
    tier: "standard",
    supportsCheckout: true,
    billingMode: "payment",
    creditsPerPurchase: 5,
  },
  {
    id: "std-1",
    productCode: "Voynexus-AI-1回",
    displayName: "Voynexus-AI-1回",
    priceJPY: 120,
    unitLabel: "1回 / 税抜",
    description: "スポットやイベントを1件だけチェック",
    bestFor: "最終確認や急ぎの質問を1回だけ行いたいとき。",
    type: "metered",
    tier: "standard",
    supportsCheckout: true,
    billingMode: "payment",
    creditsPerPurchase: 1,
  },
];

export function findPlanByProductCode(code: string) {
  return billingPlans.find((plan) => plan.productCode === code);
}
