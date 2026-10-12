"use server";

import { getDemoCase } from "@/lib/demo-data";
import { analyzeReviews, campaignFromAnomaly, generateReplyDraft, ugcFromReview } from "@/lib/intelligence";
import { generateWithFal, liveBrandFromReviews, makeCreativeFallback, scrapeWithApify } from "@/lib/integrations";
import type { BrandCase, CreativeKind, Review } from "@/lib/types";

export async function loadReviewsAction(input: { url?: string; caseId?: BrandCase["id"] }) {
  const brand = getDemoCase(input.caseId ?? "coffee");
  const externalReviews = input.url ? await scrapeWithApify(input.url) : null;
  const reviews = externalReviews?.reviews ?? brand.reviews;
  const resolvedBrand = externalReviews && input.url ? liveBrandFromReviews(brand, externalReviews.resolvedUrl || input.url, externalReviews.reviews, externalReviews.sourceName) : brand;
  return { brand: resolvedBrand, reviews, source: externalReviews ? "apify" : "demo", fallbackReason: externalReviews ? undefined : "Demo safety fallback is active." };
}

export async function replyAction(input: { review: Review; brand: BrandCase }) {
  return generateReplyDraft(input.review, input.brand);
}

export async function creativeAction(input: { kind: CreativeKind; brand: BrandCase; review?: Review; anomalyTopic?: string }) {
  const insights = analyzeReviews(input.brand.reviews);
  const anomaly = insights.anomalies.find((item) => item.topic === input.anomalyTopic) ?? insights.anomalies[0];
  const review = input.review ?? insights.topPraise[0];
  const concept = input.kind === "ugc" && review ? ugcFromReview(review, input.brand) : campaignFromAnomaly(anomaly, input.brand);
  const falImage = await generateWithFal(concept);
  return { ...concept, imageUrl: falImage ?? makeCreativeFallback(concept, input.brand.name), generatedBy: falImage ? "fal.ai" : "BrandShield fallback" };
}
