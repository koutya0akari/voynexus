import { getTranslations } from "next-intl/server";
import { getArticles, getEvents, getItineraries, getSpots, getSponsors } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";
import { HeroSection } from "@/components/hero-section";
import { FiltersBar } from "@/components/filters-bar";
import { SpotGrid } from "@/components/spots/spot-grid";
import { ArticleList } from "@/components/articles/article-list";
import { ItineraryShowcase } from "@/components/itineraries/itinerary-showcase";
import { EventSpotlight } from "@/components/events/event-spotlight";
import { SponsorRail } from "@/components/sponsors/sponsor-rail";
import { FacilityWidgetCTA } from "@/components/widgets/facility-widget-cta";

type Props = {
  params: {
    lang: Locale;
  };
};

export default async function LocaleHome({ params }: Props) {
  const locale = params.lang;
  const t = await getTranslations({ locale });

  const [{ contents: spots }, { contents: articles }, { contents: itineraries }, { contents: events }, { contents: sponsors }] =
    await Promise.all([
      getSpots({ lang: locale, limit: 6 }),
      getArticles({ lang: locale, limit: 6 }),
      getItineraries({ lang: locale, limit: 3 }),
      getEvents({ lang: locale }),
      getSponsors({ lang: locale, position: "top" })
    ]);

  return (
    <div className="space-y-8 pb-16">
      <HeroSection
        locale={locale}
        title={t("hero.title")}
        description={t("hero.description")}
        ctaPlan={t("cta.planTrip")}
        ctaChat={t("cta.chat")}
      />
      <FiltersBar />
      <SpotGrid locale={locale} spots={spots} title={t("sections.topSpots")} />
      <ArticleList locale={locale} articles={articles} title={t("sections.latestArticles")} />
      <ItineraryShowcase locale={locale} itineraries={itineraries} title={t("sections.modelCourses")} />
      <EventSpotlight locale={locale} events={events} title={t("sections.events")} />
      <SponsorRail sponsors={sponsors} />
      <FacilityWidgetCTA locale={locale} />
    </div>
  );
}
