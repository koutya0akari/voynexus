import { getTranslations } from "next-intl/server";
import { getArticles, getBlogs, getEvents, getItineraries, getSpots, getSponsors } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";
import { HeroSection } from "@/components/hero-section";
import { FiltersBar } from "@/components/filters-bar";
import { SpotGrid } from "@/components/spots/spot-grid";
import { ArticleList } from "@/components/articles/article-list";
import { ItineraryShowcase } from "@/components/itineraries/itinerary-showcase";
import { EventSpotlight } from "@/components/events/event-spotlight";
import { SponsorRail } from "@/components/sponsors/sponsor-rail";
import { FacilityWidgetCTA } from "@/components/widgets/facility-widget-cta";
import { BlogSpotlight } from "@/components/blog/blog-spotlight";

type Props = {
  params: {
    lang: Locale;
  };
};

export default async function LocaleHome({ params }: Props) {
  const locale = params.lang;
  const t = await getTranslations({ locale });

  const [
    { contents: spots },
    { contents: articles },
    { contents: itineraries },
    { contents: events },
    { contents: sponsors },
    { contents: blogs }
  ] = await Promise.all([
    getSpots({ lang: locale, limit: 6 }),
    getArticles({ lang: locale, limit: 6 }),
    getItineraries({ lang: locale, limit: 3 }),
    getEvents({ lang: locale }),
    getSponsors({ lang: locale, position: "top" }),
    getBlogs({ limit: 3 })
  ]);

  const quickLinkCopy: Record<Locale, { spots: string; plan: string; articles: string; blog: string }> = {
    ja: {
      spots: "旬のスポットと現地Tips",
      plan: "AIが天気と所要時間を調整",
      articles: "学生ライターによる現地レポ",
      blog: "microCMSで更新できる特集"
    },
    en: {
      spots: "Seasonal picks with on-site tips",
      plan: "AI balances weather, time and transport",
      articles: "Dispatches from student writers",
      blog: "Stories and deep dives from the blog"
    },
    zh: {
      spots: "當季亮點與在地提醒",
      plan: "AI 依天氣與時間客製行程",
      articles: "學生作者的現場報導",
      blog: "部落格特輯與幕後花絮"
    }
  };

  const copy = quickLinkCopy[locale];

  const quickLinks = [
    {
      title: t("sections.topSpots"),
      body: copy.spots,
      href: `/${locale}/spots`
    },
    {
      title: t("sections.modelCourses"),
      body: copy.plan,
      href: `/${locale}/plan`
    },
    {
      title: t("sections.latestArticles"),
      body: copy.articles,
      href: `/${locale}/articles`
    },
    {
      title: "Travel Blog",
      body: copy.blog,
      href: "/blog"
    }
  ];

  return (
    <div className="space-y-12 bg-slate-50 pb-16">
      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[2fr,1fr]">
          <HeroSection
            locale={locale}
            title={t("hero.title")}
            description={t("hero.description")}
            ctaPlan={t("cta.planTrip")}
            ctaChat={t("cta.chat")}
            className="shadow-xl shadow-brand/20"
          />
          <BlogSpotlight posts={blogs ?? []} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-3xl border border-slate-200 bg-white/80 p-4 transition hover:-translate-y-1 hover:border-brand"
            >
              <p className="text-xs uppercase text-slate-400">Navigator</p>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.body}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="px-4">
        <FiltersBar />
      </div>

      <SpotGrid locale={locale} spots={spots} title={t("sections.topSpots")} />
      <ItineraryShowcase locale={locale} itineraries={itineraries} title={t("sections.modelCourses")} />
      <ArticleList locale={locale} articles={articles} title={t("sections.latestArticles")} />
      <EventSpotlight locale={locale} events={events} title={t("sections.events")} />
      <div className="mx-auto max-w-6xl px-4">
        <SponsorRail sponsors={sponsors} />
      </div>
      <FacilityWidgetCTA locale={locale} />
    </div>
  );
}
