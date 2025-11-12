import type { Metadata } from "next";
import { UpgradePageContent } from "./upgrade-content";

export const metadata: Metadata = {
  title: "Voynex Membership",
  description: "AIチャットと旅程生成を解放する会員登録ページ。",
};

export default function UpgradePage() {
  return <UpgradePageContent locale="ja" />;
}
