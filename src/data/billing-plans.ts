export type PlanType = "flat" | "metered";

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

export const planTypeCopy: Record<
  PlanType,
  {
    title: string;
    description: string;
  }
> = {
  flat: {
    title: "定額パス (1日 / 7日)",
    description:
      "滞在期間中はAIチャットと旅程生成を好きなだけ利用できます。連日取材や長期滞在の方向きです。",
  },
  metered: {
    title: "従量パス (回数制)",
    description:
      "質問や旅程生成の回数に合わせて必要な分だけ購入できます。スポット確認や短時間の旅程調整におすすめです。",
  },
};

export const billingPlans: BillingPlan[] = [
  {
    id: "pro-7d",
    productCode: "Voynexus-AI-Pro-7days",
    displayName: "Voynexus-AI-Pro-7days",
    priceJPY: 18000,
    unitLabel: "7日 / 税抜",
    description: "撮影同行や複数チームでの長期利用向け",
    bestFor: "1週間以上の滞在やAIチャットを常時開いておきたい方向け。",
    type: "flat",
    tier: "pro",
    supportsCheckout: true,
    billingMode: "subscription",
    badge: "人気",
  },
  {
    id: "pro-1d",
    productCode: "Voynexus-AI-Pro-1day",
    displayName: "Voynexus-AI-Pro-1day",
    priceJPY: 3000,
    unitLabel: "1日 / 税抜",
    description: "取材日だけAIをフル活用したい方向け",
    bestFor: "ロケやイベント日に合わせてスポットを集中的に確認するケース。",
    type: "flat",
    tier: "pro",
    supportsCheckout: true,
    billingMode: "subscription",
  },
  {
    id: "std-7d",
    productCode: "Voynexus-AI-7day",
    displayName: "Voynexus-AI-7day",
    priceJPY: 6000,
    unitLabel: "7日 / 税抜",
    description: "家族旅行やワーケーション向けスタンダードプラン",
    bestFor: "1週間の滞在で混雑・天候を見ながら旅程を柔軟に変えたい方向け。",
    type: "flat",
    tier: "standard",
    supportsCheckout: true,
    billingMode: "subscription",
  },
  {
    id: "std-1d",
    productCode: "Voynexus-AI-1day",
    displayName: "Voynexus-AI-1day",
    priceJPY: 1000,
    unitLabel: "1日 / 税抜",
    description: "日帰り観光や出張ついでの寄り道に最適",
    bestFor: "短時間でスポット比較や交通手段をAIに確認したいとき。",
    type: "flat",
    tier: "standard",
    supportsCheckout: true,
    billingMode: "subscription",
  },
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
