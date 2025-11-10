import { SimpleDoc } from "@/components/static/simple-doc";

export default function TermsPage() {
  return (
    <SimpleDoc
      title="利用規約"
      sections={[
        {
          heading: "第1条 (適用)",
          body: "本規約はVoynex（以下、本サービス）に関する利用条件を定めるものです。利用者は本規約に同意した上で本サービスを利用するものとします。"
        },
        {
          heading: "第2条 (禁止事項)",
          body: "逆コンパイル、過度なスクレイピング、AI応答を偽装した投稿などを禁止します。"
        },
        {
          heading: "第3条 (免責)",
          body: "コンテンツの正確性確保に努めますが、現地状況の変化について保証しません。"
        }
      ]}
    />
  );
}
