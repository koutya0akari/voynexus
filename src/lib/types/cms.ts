export type LocalizedEntry = {
  id: string;
  lang: "ja" | "en" | "zh";
  translationGroupId: string;
  slug: string;
  title: string;
  summary: string;
  ogImage?: string;
  updatedAt: string;
  publishedAt?: string;
};

export type Spot = LocalizedEntry & {
  name: string;
  kana?: string;
  area: string;
  tags: string[];
  openHours: string;
  closedDays?: string;
  price?: string;
  requiredTime: number;
  access: {
    busLine?: string;
    stop?: string;
    platform?: string;
    lastBusTime?: string;
    parking?: string;
  };
  accessibility?: {
    stepFree?: boolean;
    stroller?: boolean;
    nursingRoom?: boolean;
    toilet?: boolean;
  };
  officialUrl?: string;
  mapLink?: string;
  images?: { url: string; alt: string }[];
  lastVerifiedAt?: string;
  relatedSpots?: string[];
  warnings?: string[];
};

export type Itinerary = LocalizedEntry & {
  audienceTags: string[];
  totalTime: number;
  budget: number;
  season: string;
  transport: "walk" | "bus" | "car" | "mixed";
  timeline: {
    time: string;
    spotRef: string;
    stayMin: number;
    moveMin: number;
    note?: string;
  }[];
  alternatives?: string[];
  foodToiletNotes?: string;
  warnings?: string[];
  links?: { label: string; url: string }[];
  mapLink?: string;
};

export type Article = LocalizedEntry & {
  type: "blog" | "guide" | "event";
  body: string;
  heroImage?: string;
  authorRef?: string;
  related?: string[];
  ctaLinks?: { label: string; url: string }[];
};

export type Blog = {
  id: string;
  title: string;
  body?: string;
  content?: string;
  slug?: string;
  publishedAt?: string;
  studentId?: string;
  tags?: string[];
  cost?: number;
  pictures?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }[];
  category?: {
    id?: string;
    name?: string;
    category?: string;
  };
  eyecatch?: {
    url: string;
    width?: number;
    height?: number;
  };
};

export type EventContent = LocalizedEntry & {
  dateRange: string;
  venueMap?: string;
  ticketInfo?: string;
  trafficNotes?: string;
  rainPolicy?: string;
  faqRefs?: string[];
};

export type Facility = LocalizedEntry & {
  name: string;
  address: string;
  contact?: string;
  reservationUrl?: string;
  faqRefs?: string[];
  sponsorTier?: "A" | "B" | "C";
};

export type Sponsor = LocalizedEntry & {
  tier: "A" | "B" | "C";
  asset: { url: string; alt: string };
  destinationUrl: string;
  positions: ("top" | "articles" | "spots")[];
  activeFrom: string;
  activeTo: string;
};

export type GlobalSettings = {
  sns?: Record<string, string>;
  gtmId?: string;
  gaId?: string;
  disclaimer?: string;
  warnings?: string[];
};
