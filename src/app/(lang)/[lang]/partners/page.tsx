import type { Locale } from "@/lib/i18n";

type Props = {
  params: { lang: Locale };
};

type Section = {
  title: string;
  body: string;
  bullets: string[];
};

type Copy = {
  heroTitle: string;
  heroDescription: string;
  highlights: string[];
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroSecondaryLabel: string;
  sections: Section[];
  stepsTitle: string;
  steps: { title: string; body: string }[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  contactTitle: string;
  contactBody: string;
  contactButton: string;
  contactLink: string;
};

const content: Record<Locale, Copy> = {
  ja: {
    heroTitle: "施設・観光案内所向けサポート",
    heroDescription:
      "Voynezusのチャット窓口とFAQボードは、現地スタッフの一次対応を支えながら旅行者の質問や予約希望を24時間カバーします。タグを一つ追加するだけで導入でき、スポンサー枠やクーポンも明示した形で掲載可能です。",
    highlights: [
      "多言語チャットで営業時間外も対応",
      "雨天・満席時の代替プランを自動表示",
      "危険ワードや緊急相談は即座にスタッフへ転送",
    ],
    heroPrimaryCta: "導入ガイドを受け取る",
    heroSecondaryCta: "partners@voynexus.jp",
    heroSecondaryLabel: "メールで相談",
    sections: [
      {
        title: "FAQボードとチャットを1タグで",
        body: "施設サイトや観光案内所のサイネージに貼り付けると、AIが最新の営業情報・アクセス・所要時間を案内し、不明点だけスタッフへエスカレーションします。",
        bullets: [
          "Google翻訳では拾いにくい固有名詞を事前学習済み",
          "スタッフ更新で即時反映するイベントタイムライン",
          "雨天・混雑時の自動リルート",
        ],
      },
      {
        title: "スポンサー枠と特典の明示表示",
        body: "タイアップ中の宿泊プランや体験予約リンクをカード形式で表示。旅行者側にも「協力: 施設名」が明記されるため、安心して案内できます。",
        bullets: [
          "限定クーポンや席数の残りを即時反映",
          "外部予約リンクにも追跡用パラメータを自動付与",
          "広告枠はアプリ内と同じ審査基準で運用",
        ],
      },
      {
        title: "安全管理とレポーティング",
        body: "NGワード辞書と有人引き継ぎルールを設定できるほか、週次レポートで人気の質問やピーク時間を共有。オペレーション改善に役立ちます。",
        bullets: [
          "危険・医療・迷子ワードはSMS/メールで即通知",
          "問い合わせ種別ごとの件数と言語を自動集計",
          "Supabaseダッシュボードから履歴を確認可能",
        ],
      },
    ],
    stepsTitle: "導入の流れ（最短3日）",
    steps: [
      {
        title: "1. 初回ヒアリング",
        body: "施設の営業時間・禁止事項・スポンサー有無などを共有いただきます。",
      },
      {
        title: "2. テンプレート設定",
        body: "FAQテンプレートとAI辞書を作成し、ベータURLで体験いただきます。",
      },
      {
        title: "3. 公開と伴走",
        body: "本番タグを設置して完了。週次レポートや追加トレーニングで継続的に改善します。",
      },
    ],
    faqTitle: "よくある質問",
    faqs: [
      {
        q: "料金はどのように決まりますか？",
        a: "基本料金に加えて、スポンサー配信や来訪者数に応じた可変費を選べます。導入時にお見積りをお送りします。",
      },
      {
        q: "自社で更新できますか？",
        a: "はい。担当者向けの簡易CMSからFAQやクーポンを更新でき、AIも数分で反映します。",
      },
    ],
    contactTitle: "資料・ご相談",
    contactBody:
      "導入マニュアル、タグ設置例、スポンサーガイドラインをまとめたPDFキットをメールでお送りします。オンラインデモも随時承っています。",
    contactButton: "資料請求フォームを開く",
    contactLink: "https://forms.gle/YccYQH5h5sPartners",
  },
  en: {
    heroTitle: "Support for facilities & visitor centers",
    heroDescription:
      "Voynezus embeds a multilingual help desk into your website or kiosk so travelers get instant answers while your team only handles escalations. Installation is one script tag, and sponsor blocks remain clearly labeled.",
    highlights: [
      "24/7 concierge across Japanese, English, Chinese",
      "Automatic rain/crowd rerouting suggestions",
      "Sensitive keywords alert on-site staff immediately",
    ],
    heroPrimaryCta: "Request onboarding kit",
    heroSecondaryCta: "partners@voynexus.jp",
    heroSecondaryLabel: "Email support",
    sections: [
      {
        title: "One tag for FAQ board + chat",
        body: "Drop the widget into your facility site or signage and let the AI handle opening hours, transportation, and ticket explanations. Only unresolved topics are escalated to the operator inbox.",
        bullets: [
          "Pre-trained with Tokushima-specific nouns and spellings",
          "Live timeline for pop-up events and last buses",
          "Weather-aware alternative plans ready out of the box",
        ],
      },
      {
        title: "Transparent sponsor placements",
        body: "Show hotel plans, experience bookings, or coupons with a clear “in partnership with” label so travelers understand who provides the perk.",
        bullets: [
          "Auto-applies tracking parameters to booking links",
          "Syncs coupon inventory and blackout dates",
          "Follows the same review policy as the Voynezus app",
        ],
      },
      {
        title: "Safety rules & reporting",
        body: "Configure prohibited keywords, escalation contacts, and receive weekly digests of top visitor questions to improve operations.",
        bullets: [
          "SOS keywords trigger SMS/email alerts",
          "Language + topic breakdown for every session",
          "Conversation history stored in Supabase dashboard",
        ],
      },
    ],
    stepsTitle: "Deployment in three simple steps",
    steps: [
      {
        title: "1. Kickoff call",
        body: "Share business hours, critical notices, and any sponsor requirements.",
      },
      {
        title: "2. Template setup",
        body: "We prepare FAQ templates and test the AI on a staging URL for your review.",
      },
      {
        title: "3. Launch & care",
        body: "Publish the production tag, receive reports, and request ongoing tuning anytime.",
      },
    ],
    faqTitle: "FAQ",
    faqs: [
      {
        q: "How is pricing structured?",
        a: "You can choose a flat platform fee plus optional usage-based add-ons for sponsor placements. Quotes arrive with the onboarding kit.",
      },
      {
        q: "Can our staff edit the answers?",
        a: "Yes. A lightweight CMS lets you update FAQs, coupons, and emergency notices with changes reflected within minutes.",
      },
    ],
    contactTitle: "Talk with us",
    contactBody:
      "We will send the installation handbook, sample scripts, and sponsor policy PDF. Live demos are available in Japanese or English.",
    contactButton: "Open request form",
    contactLink: "https://forms.gle/YccYQH5h5sPartners",
  },
  zh: {
    heroTitle: "設施與旅遊服務中心專區",
    heroDescription:
      "只要加入一段程式碼，Voynezus 就能在網站或自助機上提供多語 FAQ 與即時聊天，協助旅客解答並把重要案件轉給工作人員。贊助資訊也會清楚標示來源。",
    highlights: [
      "支援日／英／中三語的 24 小時客服",
      "下雨或滿位時自動推薦替代計畫",
      "偵測危險關鍵字後立刻通知值班人員",
    ],
    heroPrimaryCta: "索取導入資料",
    heroSecondaryCta: "partners@voynexus.jp",
    heroSecondaryLabel: "Email 洽詢",
    sections: [
      {
        title: "FAQ 看板 + 聊天一次搞定",
        body: "放在官網或資訊站螢幕上即可運作，AI 會解答營業資訊、交通方式與票券規則，僅把未解決的問題交給人員處理。",
        bullets: [
          "預先學習德島的地名與活動用語",
          "事件時間軸與最後一班車即時更新",
          "依天氣與人潮自動調整建議路線",
        ],
      },
      {
        title: "透明的贊助呈現",
        body: "合作旅宿、體驗行程或優惠券會以卡片方式展示，並標上「合作夥伴」標示，旅客可清楚辨識來源。",
        bullets: [
          "自動附加追蹤參數到預約連結",
          "同步券量與停用日期",
          "與 Voynezus App 相同的審核基準",
        ],
      },
      {
        title: "安全控管與報表",
        body: "可設定禁止字詞、通知管道，並收到每週摘要，了解熱門問題與繁忙時段，協助營運調度。",
        bullets: [
          "危險／醫療／迷路相關字詞會即時通知",
          "自動統計語言與問題分類",
          "紀錄保存於 Supabase 控制台",
        ],
      },
    ],
    stepsTitle: "三步驟即可上線",
    steps: [
      { title: "1. 需求訪談", body: "分享營業資訊、注意事項與合作方案。" },
      { title: "2. 模板設定", body: "我們建立 FAQ 與 AI 字典，提供測試網址給您確認。" },
      { title: "3. 正式發布", body: "張貼正式標籤後即可運作，並持續提供報表與調整建議。" },
    ],
    faqTitle: "常見問題",
    faqs: [
      { q: "費用怎麼計算？", a: "採平台月費 + 選配功能方式，報價會隨導入資料一併提供。" },
      {
        q: "能自行更新內容嗎？",
        a: "可以。管理後台可即時更新 FAQ、公告與優惠，幾分鐘內就會生效。",
      },
    ],
    contactTitle: "索取資料／預約 Demo",
    contactBody: "我們會寄送導入手冊、程式碼範例與贊助規範，也可安排線上說明會（提供日／英／中）。",
    contactButton: "開啟申請表單",
    contactLink: "https://forms.gle/YccYQH5h5sPartners",
  },
};

export default function PartnersPage({ params }: Props) {
  const locale = params.lang;
  const copy = content[locale] ?? content.ja;
  const contactEmail = "partners@voynexus.jp";

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase text-brand">Voynezus Partners</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{copy.heroTitle}</h1>
        <p className="mt-3 text-slate-600">{copy.heroDescription}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {copy.highlights.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={copy.contactLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand/90"
          >
            {copy.heroPrimaryCta}
          </a>
          <a
            href={`mailto:${copy.heroSecondaryCta}`}
            className="inline-flex items-center gap-2 rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand"
          >
            <span>{copy.heroSecondaryLabel}</span>
            <span className="font-mono text-xs">{copy.heroSecondaryCta}</span>
          </a>
        </div>
      </section>

      <section className="space-y-6">
        {copy.sections.map((section) => (
          <div
            key={section.title}
            className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-600">{section.body}</p>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
        <h2 className="text-2xl font-semibold text-slate-900">{copy.stepsTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {copy.steps.map((step) => (
            <div key={step.title} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-brand">{step.title}</p>
              <p className="mt-2 text-sm text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">{copy.faqTitle}</h2>
        <div className="mt-4 space-y-4">
          {copy.faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-slate-100 p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">{faq.q}</summary>
              <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-brand/30 bg-brand/5 p-6 text-slate-800">
        <h2 className="text-2xl font-semibold text-slate-900">{copy.contactTitle}</h2>
        <p className="mt-2 text-sm">{copy.contactBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={copy.contactLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand/90"
          >
            {copy.contactButton}
          </a>
          <a
            href={`mailto:${contactEmail}`}
            className="rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand"
          >
            {contactEmail}
          </a>
        </div>
      </section>
    </div>
  );
}
