import { SimpleDoc } from "@/components/static/simple-doc";

export default function DisclaimerPage() {
  return (
    <SimpleDoc
      title="免責事項"
      sections={[
        {
          heading: "コンテンツについて",
          body: "掲載情報は取材時点の確認内容に基づいています。料金や営業時間、交通事情は急に変わる場合があるため、最新状況は公式情報をご確認ください。",
        },
        {
          heading: "AI応答について",
          body: "AIチャット・旅程生成は補助を目的としたもので、最終判断は利用者が行ってください。",
        },
      ]}
    />
  );
}
