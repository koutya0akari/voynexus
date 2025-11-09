export type TrackingEvent =
  | { name: "search_submit"; params: { query: string; filters?: string } }
  | { name: "filter_change"; params: { filter: string; value: string } }
  | { name: "spot_view"; params: { id: string } }
  | { name: "article_view"; params: { id: string } }
  | { name: "itinerary_generate"; params: { transport: string; party: string } }
  | { name: "affiliate_click"; params: { id: string; url: string } }
  | { name: "sponsor_impression"; params: { id: string; position: string } }
  | { name: "chat_open"; params: { lang: string } }
  | { name: "chat_message"; params: { lang: string } }
  | { name: "pdf_export"; params: { itineraryId: string } };

export function emitTrackingEvent(event: TrackingEvent) {
  if (typeof window !== "undefined" && "gtag" in window) {
    // @ts-expect-error gtag is injected by TrackingScript
    window.gtag("event", event.name, event.params);
  } else {
    console.info("[tracking]", event.name, event.params);
  }
}
