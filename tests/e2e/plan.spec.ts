import { test, expect } from "@playwright/test";

test("generate itinerary flow (smoke)", async ({ page }) => {
  await page.goto("/ja/plan");
  await page.getByRole("button", { name: "AIで旅程を生成" }).click();
  await expect(page.getByText("AIが制約をチェック中")).toBeVisible();
});
