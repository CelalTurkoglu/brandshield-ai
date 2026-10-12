import { getDemoCase } from "@/lib/demo-data";
import { analyzeReviews, campaignFromAnomaly, ugcFromReview } from "@/lib/intelligence";
import { generateWithFal, makeCreativeFallback } from "@/lib/integrations";
import type { Anomaly, BrandCase, CreativeKind, Review } from "@/lib/types";

const calmAnomaly: Anomaly = {
  id: "anomaly-care",
  topic: "delivery",
  title: "Customer delivery confidence",
  summary: "Create a proactive proof point around the delivery experience.",
  count: 1,
  surgeLabel: "Watch signal",
  severity: "watch",
  campaignAngle: "Customer-care guarantee",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { kind?: CreativeKind; brand?: BrandCase; review?: Review; anomalyTopic?: string };
    const kind = body.kind === "ugc" ? "ugc" : "crisis";
    const brand = body.brand ?? getDemoCase("coffee");
    const insights = analyzeReviews(brand.reviews);
    const anomaly = insights.anomalies.find((item) => item.topic === body.anomalyTopic) ?? insights.anomalies[0] ?? calmAnomaly;
    const review = body.review ?? insights.topPraise[0] ?? brand.reviews[0];
    const concept = kind === "ugc" && review ? ugcFromReview(review, brand) : campaignFromAnomaly(anomaly, brand);
    const falImage = await generateWithFal(concept);
    return Response.json({
      ...concept,
      imageUrl: falImage ?? makeCreativeFallback(concept, brand.name),
      generatedBy: falImage ? "fal.ai" : "BrandShield fallback",
    });
  } catch {
    return Response.json({ error: "Creative generation could not start." }, { status: 400 });
  }
}
