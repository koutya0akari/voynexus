import Link from "next/link";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { AiChatPanel } from "@/components/chat/ai-chat-panel";
import { AiUpsell } from "@/components/ai/ai-upsell";
import { getAiAccessStatus } from "@/lib/ai-access";

type Props = {
  params: { lang: Locale };
  searchParams: { mode?: string };
};

const chatHighlights = [
  {
    title: "現地の安全情報に強い",
    body: "RAGでスポット・記事・旅程を参照し、雨天代替や最終バス、イベント中止などを即回答。",
  },
  {
    title: "旅程生成と連動",
    body: "チャットで得た注意点は旅程エディターと同期され、PDFにも自動反映されます。",
  },
  {
    title: "多言語対応",
    body: "Japanese/English/Chineseを切り替えて、ゲストや海外チームとも共有しやすいテキストを出力。",
  },
];

const sampleConversation = [
  {
    role: "user",
    text: "明日徳島市内で雨になりそう。屋内スポットと移動の注意点を教えて。",
  },
  {
    role: "assistant",
    text: "午前は徳島県立博物館で特別展→ランチ後にアスティとくしまの屋内スペースへ切り替えます。南部循環バスの最終は19:40なので、旅程にアラートを追加しました。",
  },
  {
    role: "user",
    text: "夕方に鳴門へ寄り道したい。渦潮の時間と雨天ルートは？",
  },
  {
    role: "assistant",
    text: "満潮は17:05。渦の道で観覧後、濡れずに移動するため鳴門ガレリアで夕食→高速バス19:10便で徳島駅に戻る案に更新しておきます。",
  },
];

export default async function ChatPage({ params, searchParams }: Props) {
  const isWidget = searchParams.mode === "widget";
  const access = await getAiAccessStatus();
  const canChat = access.ok;
  const membersHref = { pathname: `/${params.lang}/members` } as const;
  const contactHref = { pathname: `/${params.lang}/contact` } as const;

  if (isWidget) {
    if (!canChat) {
      return <AiUpsell locale={params.lang} denied={access} />;
    }
    return (
      <div className="h-full w-full bg-transparent">
        <AiChatPanel locale={params.lang} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-3">
        <p className="text-sm uppercase text-slate-500">AI Concierge</p>
        <h1 className="text-3xl font-semibold text-slate-900">旅程・FAQチャット</h1>
        <p className="text-sm text-slate-500">
          RAGでスポット/記事/旅程を参照し、注意事項テンプレを優先回答。不明な点は公式リンクを案内し、安全・移動・気象をひとつの会話で調整できます。
        </p>
        {!canChat ? (
          <div className="rounded-3xl border border-dashed border-brand/40 bg-brand/5 p-4 text-sm text-brand">
            従量パスを購入するとAIチャットが解放され、旅程生成と共通の残回数から利用できます。
          </div>
        ) : null}
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand">AI concierge ができること</p>
            <h2 className="text-xl font-semibold text-slate-900">チャットで即調整・即反映</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              href={membersHref}
              className="inline-flex items-center rounded-full bg-brand px-5 py-2 text-white shadow-sm"
            >
              従量パスを購入
            </Link>
            <Link
              href={contactHref}
              className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2 text-slate-600 hover:border-brand hover:text-brand"
            >
              導入相談
            </Link>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {chatHighlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600"
            >
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 p-5 shadow-sm dark:from-slate-800 dark:via-slate-900 dark:to-emerald-900/30">
        <p className="text-xs uppercase tracking-wide text-emerald-600">AI chat preview</p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900">
          こうやって旅の「困った」を解決
        </h3>
        <div className="mt-4 space-y-3">
          {sampleConversation.map((line, index) => (
            <div
              key={`${line.role}-${index}`}
              className={clsx(
                "rounded-2xl border px-4 py-3 text-sm shadow-sm",
                line.role === "assistant"
                  ? "border-emerald-100 bg-slate-100 text-slate-800 dark:border-emerald-400/30 dark:bg-emerald-900/30 dark:text-slate-100"
                  : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
              )}
            >
              <p className="text-[11px] font-semibold uppercase text-slate-400">
                {line.role === "assistant" ? "AI Concierge" : "Traveler"}
              </p>
              <p>{line.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          チャットと旅程生成は共通の従量パスで利用できます。残回数は会員ページでいつでも確認。
        </p>
      </section>

      {canChat ? (
        <AiChatPanel locale={params.lang} />
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-900">AIチャットは会員専用機能です</p>
          <p className="mt-2 text-sm text-slate-600">
            この画面ではプレビューだけを表示しています。Googleログインと従量パス購入後、チャット／旅程生成が同じ残回数から利用できます。
          </p>
        </div>
      )}

      {!canChat ? <AiUpsell locale={params.lang} denied={access} /> : null}
    </div>
  );
}
