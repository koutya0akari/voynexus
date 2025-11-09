import { SimpleDoc } from "@/components/static/simple-doc";

export default function PrivacyPage() {
  return (
    <SimpleDoc
      title="プライバシーポリシー"
      sections={[
        {
          heading: "取得する情報",
          body: "旅程生成条件、アクセスログ、GA4イベント。個人を特定する情報は保存しません。"
        },
        {
          heading: "利用目的",
          body: "UX改善、スポンサー配信最適化、AIモデルの品質向上。"
        },
        {
          heading: "第三者提供",
          body: "送客リンクの解析結果をスポンサーに集計提供する場合がありますが個人を特定しません。"
        }
      ]}
    />
  );
}
