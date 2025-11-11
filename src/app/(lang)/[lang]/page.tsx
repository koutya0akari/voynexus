export const revalidate = 300;

import Link from "next/link";
import type { Route } from "next";
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

function resolveWidgetOrigin() {
  const envValue =
    process.env.NEXT_PUBLIC_WIDGET_ORIGIN ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    "http://localhost:3000";
  return envValue.replace(/\/+$/, "");
}

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
    { contents: blogs },
  ] = await Promise.all([
    getSpots({ lang: locale, limit: 6 }),
    getArticles({ lang: locale, limit: 6 }),
    getItineraries({ lang: locale, limit: 3 }),
    getEvents({ lang: locale }),
    getSponsors({ lang: locale, position: "top" }),
    getBlogs({ limit: 3 }),
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
      note: t("stats.spotsNote"),
    },
    {
      label: t("stats.articles"),
      value: formatStatValue(articlesCount ?? articles.length),
      note: t("stats.articlesNote"),
    },
    {
      label: t("stats.itineraries"),
      value: formatStatValue(itinerariesCount ?? itineraries.length),
      note: t("stats.itinerariesNote"),
    },
    {
      label: t("stats.events"),
      value: formatStatValue(eventsCount ?? events.length),
      note: t("stats.eventsNote"),
    },
  ];

  const quickLinkCopy: Record<
    Locale,
    { spots: string; plan: string; articles: string; blogDescription: string }
  > = {
    ja: {
      spots: "旬のスポットと現地Tips",
      plan: "AIが天気と所要時間を調整",
      articles: "学生ライターによる現地レポ",
      blogDescription: "microCMSで更新できる特集",
    },
    en: {
      spots: "Seasonal picks with on-site tips",
      plan: "AI balances weather, time and transport",
      articles: "Dispatches from student writers",
      blogDescription: "Stories and deep dives from the blog",
    },
    zh: {
      spots: "當季亮點與在地提醒",
      plan: "AI 依天氣與時間客製行程",
      articles: "學生作者的現場報導",
      blogDescription: "部落格特輯與幕後花絮",
    },
  };

  const copy = quickLinkCopy[locale] ?? quickLinkCopy.ja;

  const widgetOrigin = resolveWidgetOrigin();

  const quickLinks: { title: string; body: string; href: Route; icon: string; accent: string }[] = [
    {
      title: t("sections.topSpots"),
      body: copy.spots,
      href: `/${locale}/spots` as Route,
      icon: "🧭",
      accent: "from-sky-50 via-white to-blue-50",
    },
    {
      title: t("sections.modelCourses"),
      body: copy.plan,
      href: `/${locale}/plan` as Route,
      icon: "🧳",
      accent: "from-amber-50 via-white to-rose-50",
    },
    {
      title: t("sections.latestArticles"),
      body: copy.articles,
      href: `/${locale}/articles` as Route,
      icon: "📓",
      accent: "from-emerald-50 via-white to-lime-50",
    },
    {
      title: t("sections.blog"),
      body: copy.blogDescription,
      href: `/${locale}/blog` as Route,
      icon: "🌅",
      accent: "from-fuchsia-50 via-white to-sky-50",
    },
  ];

  const blogSpotlightCopy = {
    title: t("blog.spotlightTitle"),
    description: t("blog.spotlightDescription"),
    ctaLabel: t("blog.spotlightCta"),
    emptyMessage: t("blog.spotlightEmpty"),
    tip: t("blog.spotlightTip"),
  };

  const featuredArticle = articles[0];
  const featuredSpot = spots[0];
  const featuredItinerary = itineraries[0];
  const featuredEvent = events[0];
  const hasSecondaryHighlights = Boolean(featuredItinerary || featuredSpot || featuredEvent);

  return (
    <div className="bg-slate-50 pb-16">
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[3fr,2fr]">
            <HeroSection
              locale={locale}
              title={t("hero.title")}
              description={t("hero.description")}
              ctaPlan={t("cta.planTrip")}
              ctaChat={t("cta.chat")}
              className="shadow-lg shadow-brand/10"
            />
            <BlogSpotlight
              locale={locale}
              posts={blogs ?? []}
              {...blogSpotlightCopy}
              variant="compact"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wide text-brand">{t("stats.title")}</p>
              <h2 className="text-2xl font-semibold text-slate-900">{t("stats.subtitle")}</h2>
              <p className="text-sm text-slate-600">{t("stats.description")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/60 bg-white p-5 shadow-sm"
                >
                  <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                  <p className="text-xs text-slate-500">{stat.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 lg:grid-cols-[3fr,2fr]">
            <div>
              <p className="text-xs uppercase text-sky-700">{t("sections.navigator")}</p>
              <h2 className="text-3xl font-semibold text-slate-900">{t("hero.title")}</h2>
              <p className="mt-2 text-sm text-slate-600">{t("hero.description")}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {quickLinks.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex flex-col gap-3 rounded-3xl border border-slate-200 bg-gradient-to-br ${item.accent} px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/70`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-left">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-lg"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold uppercase text-slate-500">
                            0{index + 1} · {t("sections.navigator")}
                          </p>
                          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        </div>
                      </div>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-brand shadow-sm"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{item.body}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <p className="text-xs uppercase text-amber-600">Voynex Journey Desk</p>
                <h3 className="text-2xl font-semibold text-slate-900">{t("cta.planTrip")}</h3>
                <p className="mt-2 text-sm text-slate-600">{copy.plan}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/plan` as Route}
                    className="inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand/90"
                  >
                    {t("cta.planTrip")}
                  </Link>
                  <Link
                    href={`/${locale}/spots` as Route}
                    className="inline-flex rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand"
                  >
                    {t("sections.topSpots")}
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-900/90 p-6 text-white shadow-sm">
                <p className="text-xs uppercase text-sky-200">{t("cta.chat")}</p>
                <h3 className="text-xl font-semibold">Local concierge</h3>
                <p className="mt-2 text-sm text-slate-200">{t("blog.spotlightDescription")}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/chat` as Route}
                    className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900"
                  >
                    {t("cta.chat")}
                  </Link>
                  <Link
                    href={`/${locale}/contact` as Route}
                    className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[3fr,2fr]">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase text-brand">{t("feed.title")}</p>
              <h2 className="text-2xl font-semibold text-slate-900">{t("feed.subtitle")}</h2>
              <p className="text-sm text-slate-500">{t("stats.description")}</p>
            </div>
            {(featuredArticle || hasSecondaryHighlights) && (
              <div
                className={
                  featuredArticle && hasSecondaryHighlights
                    ? "grid gap-6 xl:grid-cols-[2fr,1fr]"
                    : "space-y-4"
                }
              >
                {featuredArticle ? (
                  <article className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                      <p className="text-xs uppercase text-slate-400">
                        {t("sections.latestArticles")}
                      </p>
                      <h3 className="mt-2 text-3xl font-semibold text-slate-900">
                        {featuredArticle.title}
                      </h3>
                      <p className="mt-3 text-slate-600">{featuredArticle.summary}</p>
                    </div>
                    <Link
                      href={`/${locale}/articles/${featuredArticle.slug}`}
                      className="mt-6 inline-flex items-center text-sm font-semibold text-brand"
                    >
                      {t("feed.ctaArticle")} →
                    </Link>
                  </article>
                ) : null}
                {hasSecondaryHighlights ? (
                  <div className="space-y-4">
                    {featuredItinerary ? (
                      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs uppercase text-slate-400">
                          {t("feed.itineraryCard")}
                        </p>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {featuredItinerary.title}
                        </h4>
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
                        <h4 className="text-lg font-semibold text-slate-900">
                          {featuredSpot.name}
                        </h4>
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
                        <h4 className="text-lg font-semibold text-slate-900">
                          {featuredEvent.title}
                        </h4>
                        <p className="text-sm text-slate-600">{featuredEvent.summary}</p>
                        <Link
                          href={`/${locale}/events`}
                          className="mt-3 inline-flex text-sm font-semibold text-brand"
                        >
                          {t("feed.ctaEvent")} →
                        </Link>
                      </article>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-100 via-white to-emerald-50 p-6 shadow-sm">
              <p className="text-xs uppercase text-slate-500">{t("sections.events")}</p>
              <h3 className="text-lg font-semibold text-slate-900">{t("feed.subtitle")}</h3>
              <p className="mt-1 text-sm text-slate-600">{t("stats.description")}</p>
              <Link
                href={`/${locale}/events` as Route}
                className="mt-4 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                {t("feed.ctaEvent")}
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase text-slate-400">Travel hotline</p>
              <p className="mt-1 text-sm text-slate-600">{copy.blogDescription}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/chat` as Route}
                  className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand/90"
                >
                  {t("cta.chat")}
                </Link>
                <Link
                  href={`/${locale}/contact` as Route}
                  className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Contact
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4">
          <FiltersBar />
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <SpotGrid locale={locale} spots={spots} title={t("sections.topSpots")} />
        <ItineraryShowcase
          locale={locale}
          itineraries={itineraries}
          title={t("sections.modelCourses")}
        />
        <ArticleList locale={locale} articles={articles} title={t("sections.latestArticles")} />
        <EventSpotlight locale={locale} events={events} title={t("sections.events")} />
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm [&>section]:mx-0 [&>section]:mt-0 [&>section]:max-w-none">
            <SponsorRail sponsors={sponsors} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <FacilityWidgetCTA locale={locale} widgetOrigin={widgetOrigin} />
            <BillingCheckoutCTA />
          </div>
        </div>
      </section>
    </div>
  );
}
