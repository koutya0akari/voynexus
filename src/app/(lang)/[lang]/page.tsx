import Link from "next/link";
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
import { BillingCheckoutCTA } from "@/components/billing/checkout-cta";

type Props = {
  params: {
    lang: Locale;
  };
};

export default async function LocaleHome({ params }: Props) {
  const locale = params.lang;
  const t = await getTranslations({ locale });

  const [
    { contents: spots, totalCount: spotsCount },
    { contents: articles, totalCount: articlesCount },
    { contents: itineraries, totalCount: itinerariesCount },
    { contents: events, totalCount: eventsCount },
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

  const formatStatValue = (value?: number) => {
    if (!value || value <= 0) return "0";
    if (value >= 50) return `${value}+`;
    return value.toString();
  };

  const stats = [
    {
      label: t("stats.spots"),
      value: formatStatValue(spotsCount ?? spots.length),
      note: t("stats.spotsNote")
    },
    {
      label: t("stats.articles"),
      value: formatStatValue(articlesCount ?? articles.length),
      note: t("stats.articlesNote")
    },
    {
      label: t("stats.itineraries"),
      value: formatStatValue(itinerariesCount ?? itineraries.length),
      note: t("stats.itinerariesNote")
    },
    {
      label: t("stats.events"),
      value: formatStatValue(eventsCount ?? events.length),
      note: t("stats.eventsNote")
    }
  ];

  const quickLinkCopy: Record<Locale, { spots: string; plan: string; articles: string; blogDescription: string }> = {
    ja: {
      spots: "旬のスポットと現地Tips",
      plan: "AIが天気と所要時間を調整",
      articles: "学生ライターによる現地レポ",
      blogDescription: "microCMSで更新できる特集"
    },
    en: {
      spots: "Seasonal picks with on-site tips",
      plan: "AI balances weather, time and transport",
      articles: "Dispatches from student writers",
      blogDescription: "Stories and deep dives from the blog"
    },
    zh: {
      spots: "當季亮點與在地提醒",
      plan: "AI 依天氣與時間客製行程",
      articles: "學生作者的現場報導",
      blogDescription: "部落格特輯與幕後花絮"
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
      title: t("sections.blog"),
      body: copy.blogDescription,
      href: `/${locale}/blog`
    }
  ];

  const blogSpotlightCopy = {
    title: t("blog.spotlightTitle"),
    description: t("blog.spotlightDescription"),
    ctaLabel: t("blog.spotlightCta"),
    emptyMessage: t("blog.spotlightEmpty"),
    tip: t("blog.spotlightTip")
  };

  const featuredArticle = articles[0];
  const featuredSpot = spots[0];
  const featuredItinerary = itineraries[0];
  const featuredEvent = events[0];

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
          <BlogSpotlight locale={locale} posts={blogs ?? []} {...blogSpotlightCopy} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <BillingCheckoutCTA />
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-brand">{t("stats.title")}</p>
              <h2 className="text-2xl font-semibold text-slate-900">{t("stats.subtitle")}</h2>
            </div>
            <p className="text-sm text-slate-500">{t("stats.description")}</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(featuredArticle || featuredSpot || featuredItinerary || featuredEvent) && (
        <section className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-xs uppercase text-brand">{t("feed.title")}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{t("feed.subtitle")}</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            {featuredArticle ? (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase text-slate-400">{t("sections.latestArticles")}</p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-900">{featuredArticle.title}</h3>
                <p className="mt-3 text-slate-600">{featuredArticle.summary}</p>
                <Link
                  href={`/${locale}/articles/${featuredArticle.slug}`}
                  className="mt-6 inline-flex items-center text-sm font-semibold text-brand"
                >
                  {t("feed.ctaArticle")} →
                </Link>
              </article>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                {t("feed.empty")}
              </div>
            )}
            <div className="space-y-4">
              {featuredItinerary ? (
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase text-slate-400">{t("feed.itineraryCard")}</p>
                  <h4 className="text-lg font-semibold text-slate-900">{featuredItinerary.title}</h4>
                  <p className="text-sm text-slate-600">{featuredItinerary.summary}</p>
                  <Link
                    href={`/${locale}/itineraries/${featuredItinerary.slug}`}
                    className="mt-3 inline-flex text-sm font-semibold text-brand"
                  >
                    {t("feed.ctaItinerary")} →
                  </Link>
                </article>
              ) : null}
              {featuredSpot ? (
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase text-slate-400">{t("feed.spotCard")}</p>
                  <h4 className="text-lg font-semibold text-slate-900">{featuredSpot.name}</h4>
                  <p className="text-sm text-slate-600">{featuredSpot.summary}</p>
                  <Link
                    href={`/${locale}/spots/${featuredSpot.slug}`}
                    className="mt-3 inline-flex text-sm font-semibold text-brand"
                  >
                    {t("feed.ctaSpot")} →
                  </Link>
                </article>
              ) : null}
              {featuredEvent ? (
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase text-slate-400">{t("feed.eventCard")}</p>
                  <h4 className="text-lg font-semibold text-slate-900">{featuredEvent.title}</h4>
                  <p className="text-sm text-slate-600">{featuredEvent.summary}</p>
                  <Link href={`/${locale}/events`} className="mt-3 inline-flex text-sm font-semibold text-brand">
                    {t("feed.ctaEvent")} →
                  </Link>
                </article>
              ) : null}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-3xl border border-slate-200 bg-white/80 p-4 transition hover:-translate-y-1 hover:border-brand"
            >
              <p className="text-xs uppercase text-slate-400">{t("sections.navigator")}</p>
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
