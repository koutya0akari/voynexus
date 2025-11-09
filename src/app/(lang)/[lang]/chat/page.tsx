import type { Locale } from "@/lib/i18n";
import { AiChatPanel } from "@/components/chat/ai-chat-panel";

type Props = {
  params: { lang: Locale };
  searchParams: { mode?: string };
};

export default function ChatPage({ params, searchParams }: Props) {
  const isWidget = searchParams.mode === "widget";

  return (
    <div
      className={
        isWidget
          ? "h-full w-full bg-transparent"
          : "mx-auto max-w-4xl space-y-6 px-4 py-8"
      }
    >
      {!isWidget && (
        <header>
          <p className="text-sm uppercase text-slate-500">AI Concierge</p>
          <h1 className="text-3xl font-semibold text-slate-900">旅程・FAQチャット</h1>
          <p className="text-sm text-slate-500">
            RAGでスポット/記事/旅程を参照し、注意事項テンプレを優先回答。不明な点は公式リンクを案内します。
          </p>
        </header>
      )}
      <AiChatPanel locale={params.lang} />
    </div>
  );
}
