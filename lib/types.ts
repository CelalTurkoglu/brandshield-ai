export type ReviewSentiment = "positive" | "neutral" | "negative";
export type ReviewCategory = "critical" | "operational" | "praise";
export type CreativeKind = "crisis" | "ugc";

export interface Review {
  id: string;
  author: string;
  initials: string;
  rating: number;
  text: string;
  date: string;
  source: "Google" | "Shopify" | "Trustpilot" | "Apify";
  sentiment?: ReviewSentiment;
  category?: ReviewCategory;
  topics?: string[];
  approved?: boolean;
}

export interface BrandCase {
  id: "coffee" | "skincare";
  name: string;
  category: string;
  handle: string;
  rating: number;
  reviewCount: number;
  trend: string;
  sourceLabel: string;
  accent: string;
  managerEmail: string;
  managerWhatsApp: string;
  reviews: Review[];
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  mapsUrl: string;
  sikayetvarUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Anomaly {
  id: string;
  topic: string;
  title: string;
  summary: string;
  count: number;
  surgeLabel: string;
  severity: "critical" | "high" | "watch";
  campaignAngle: string;
}

export interface InsightReport {
  healthScore: number;
  riskLevel: "Protected" | "Watch" | "At risk";
  trendLabel: string;
  totalReviews: number;
  sentiment: Record<ReviewSentiment, number>;
  categories: Record<ReviewCategory, number>;
  anomalies: Anomaly[];
  topPraise: Review[];
  operationalNotes: Review[];
  reviewed: Review[];
}

export interface ReplyDraft {
  reviewId: string;
  reply: string;
  refundCode: string;
  managerLink: string;
  emailLink: string;
  language?: "tr" | "en";
}

export interface CreativeConcept {
  kind: CreativeKind;
  title: string;
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  prompt: string;
  instagramCaption: string;
  xCaption: string;
  quote?: string;
  imageUrl?: string;
  generatedBy: "fal.ai" | "BrandShield fallback";
}

export interface ScrapeResult {
  brand: BrandCase;
  reviews: Review[];
  source: "apify" | "demo";
  fallbackReason?: string;
}
