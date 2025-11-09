import { SimpleDoc } from "@/components/static/simple-doc";

export default function DisclaimerPage() {
  return (
    <SimpleDoc
      title="免責事項"
      sections={[
        {
          heading: "コンテンツについて",
          body: "microCMSのlast_verified_atに基づき鮮度を表示しますが、現地事情の変動を保証するものではありません。"
        },
        {
          heading: "AI応答について",
          body: "AIチャット・旅程生成は補助を目的としたもので、最終判断は利用者が行ってください。"
        }
      ]}
    />
  );
}
