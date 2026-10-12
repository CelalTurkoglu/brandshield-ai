import type { Anomaly, BrandCase, CreativeConcept, InsightReport, ReplyDraft, Review, ReviewCategory, ReviewSentiment } from "./types";
import { detectReplyLanguage } from "./reviews";

const topicRules: Array<{ topic: string; terms: string[]; label: string; campaignAngle: string }> = [
  { topic: "temperature", terms: ["cold", "lukewarm", "hot"], label: "Cold delivery drinks", campaignAngle: "Thermal packaging upgrade" },
  { topic: "leakage", terms: ["leak", "leaked", "spilled", "soaked", "damp"], label: "Leaking packaging", campaignAngle: "Seal-tested packaging" },
  { topic: "delivery", terms: ["delivery", "arrived", "tracking", "nine days", "courier"], label: "Delivery reliability", campaignAngle: "Trackable, reliable delivery" },
  { topic: "queue", terms: ["queue", "line", "wait", "20 minutes", "rush"], label: "Peak-hour wait time", campaignAngle: "Fast-lane service moment" },
  { topic: "product-love", terms: ["best", "love", "gorgeous", "holy-grail", "unreal", "perfect", "glow", "repurchase"], label: "Product love", campaignAngle: "Customer-loved proof" },
];

const positiveWords = ["love", "best", "perfect", "beautiful", "gorgeous", "unreal", "wins", "fantastic", "holy-grail", "glow", "repurchase", "worth"];
const negativeWords = ["cold", "leak", "spilled", "waste", "hate", "slow", "wait", "late", "damp", "loose", "problem"];

export function classifyReview(review: Review): Review {
  const text = review.text.toLowerCase();
  const topics = topicRules.filter((rule) => rule.terms.some((term) => text.includes(term))).map((rule) => rule.topic);
  const positiveHits = positiveWords.filter((word) => text.includes(word)).length;
  const negativeHits = negativeWords.filter((word) => text.includes(word)).length;

  let sentiment: ReviewSentiment = "neutral";
  if (review.rating >= 5 || (positiveHits > negativeHits && review.rating >= 4)) sentiment = "positive";
  if (review.rating <= 2 || negativeHits > positiveHits) sentiment = "negative";

  let category: ReviewCategory = "operational";
  if (sentiment === "negative" && (topics.includes("temperature") || topics.includes("leakage") || topics.includes("delivery"))) category = "critical";
  if (sentiment === "positive" && review.rating >= 5) category = "praise";

  return { ...review, sentiment, category, topics };
}

function labelForTopic(topic: string) {
  return topicRules.find((rule) => rule.topic === topic) ?? topicRules[2];
}

export function analyzeReviews(reviews: Review[]): InsightReport {
  const reviewed = reviews.map(classifyReview);
  const sentiment: Record<ReviewSentiment, number> = { positive: 0, neutral: 0, negative: 0 };
  const categories: Record<ReviewCategory, number> = { critical: 0, operational: 0, praise: 0 };
  const negativeTopics = new Map<string, number>();

  reviewed.forEach((review) => {
    sentiment[review.sentiment ?? "neutral"] += 1;
    categories[review.category ?? "operational"] += 1;
    if (review.sentiment === "negative") {
      for (const topic of review.topics ?? []) {
        if (topic !== "product-love") negativeTopics.set(topic, (negativeTopics.get(topic) ?? 0) + 1);
      }
    }
  });

  const anomalies: Anomaly[] = [...negativeTopics.entries()]
    .filter(([, count]) => count >= 1)
    .map(([topic, count]) => {
      const rule = labelForTopic(topic);
      const multiplier = count >= 3 ? "3×" : count === 2 ? "2×" : "New";
      const severity: Anomaly["severity"] = count >= 3 ? "critical" : count === 2 ? "high" : "watch";
      return {
        id: `anomaly-${topic}`,
        topic,
        title: rule.label,
        summary: `${count} recent negative signal${count > 1 ? "s" : ""} point to ${rule.label.toLowerCase()}.`,
        count,
        surgeLabel: `${multiplier} above baseline`,
        severity,
        campaignAngle: rule.campaignAngle,
      };
    })
    .sort((a, b) => b.count - a.count);

  const rawScore = 92 - sentiment.negative * 4 - anomalies.filter((a) => a.severity === "critical").length * 5 + sentiment.positive * 1.25;
  const healthScore = Math.max(42, Math.min(96, Math.round(rawScore)));
  const riskLevel = healthScore >= 80 ? "Protected" : healthScore >= 66 ? "Watch" : "At risk";

  return {
    healthScore,
    riskLevel,
    trendLabel: anomalies[0] ? `${anomalies[0].surgeLabel} · ${anomalies[0].title}` : "Stable customer signal",
    totalReviews: reviewed.length,
    sentiment,
    categories,
    anomalies,
    topPraise: reviewed.filter((review) => review.category === "praise").slice(0, 4),
    operationalNotes: reviewed.filter((review) => review.category === "operational").slice(0, 4),
    reviewed,
  };
}

export function generateReplyDraft(review: Review, brand: Pick<BrandCase, "name" | "managerEmail" | "managerWhatsApp">): ReplyDraft {
  const enriched = classifyReview(review);
  const language = detectReplyLanguage(review.text);
  const topics = enriched.topics ?? [];
  const managerEmail = brand.managerEmail || `care@${brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.example`;
  const managerWhatsApp = brand.managerWhatsApp || `mailto:${managerEmail}`;
  const hasLeak = topics.includes("leakage");
  const hasTemp = topics.includes("temperature");
  const hasDelivery = topics.includes("delivery");
  const recovery = hasLeak
    ? "We are replacing the order and have flagged the seal issue with our fulfilment team today."
    : hasTemp
      ? "We are refunding this delivery and have escalated the thermal packaging issue with our delivery team today."
      : hasDelivery
        ? "We are checking the shipment route and will make this right with a replacement or refund — your choice."
        : "We are reviewing this with the team and will make the experience right straight away.";
  const recoveryTr = hasLeak
    ? "Siparişi yeniliyor ve sızdırmazlık sorununu bugün operasyon ekibimize iletiyoruz."
    : hasTemp
      ? "Bu teslimatı iade ediyor ve termal ambalaj sorununu bugün teslimat ekibimize iletiyoruz."
      : hasDelivery
        ? "Teslimat rotasını kontrol ediyoruz; değişim veya iade seçeneklerinden hangisi uygunsa hemen yardımcı olacağız."
        : "Konuyu ekibimizle inceliyor ve deneyimi hemen telafi etmek için gerekeni yapıyoruz.";
  const refundCode = `CARE-${review.id.toUpperCase()}-20`;

  return {
    reviewId: review.id,
    language,
    reply: language === "tr"
      ? `Merhaba ${review.author.split(" ")[0]}, bunu bizimle paylaştığın için teşekkür ederiz — ${brand.name} olarak yaşadığın deneyim kabul edilebilir değil. ${recoveryTr} Bir sonraki siparişinde ${refundCode} kodunu kullanabilir veya yöneticimize doğrudan yazarak kişisel destek alabilirsin. — ${brand.name} ekibi`
      : `Hi ${review.author.split(" ")[0]}, thank you for telling us — this is not the experience ${brand.name} should deliver. ${recovery} Please use code ${refundCode} on your next order, or message our manager directly so we can help personally. — ${brand.name} Care Team`,
    refundCode,
    managerLink: managerWhatsApp,
    emailLink: `mailto:${managerEmail}?subject=${encodeURIComponent(`Help with review ${review.id}`)}`,
  };
}

export function campaignFromAnomaly(anomaly: Anomaly, brand: Pick<BrandCase, "name" | "handle">): CreativeConcept {
  const isLeak = anomaly.topic === "leakage";
  const isTemp = anomaly.topic === "temperature";
  const headline = isTemp ? "HOT, FROM BAR TO DOOR." : isLeak ? "SEALED. TESTED. DELIVERED." : "YOUR ORDER, RIGHT ON TIME.";
  const body = isTemp
    ? "New thermal sleeves and double-seal lids keep every delivery café-hot."
    : isLeak
      ? "Our upgraded leak-lock packaging protects every bottle from shelf to doorstep."
      : "Live delivery updates and a customer-care guarantee now come with every order.";
  const product = isTemp ? "a glowing oat latte in premium thermal packaging" : isLeak ? "a luminous skincare serum in a sealed, premium mailer" : "a polished delivery package on a clean doorstep";

  return {
    kind: "crisis",
    title: `${anomaly.campaignAngle} campaign`,
    eyebrow: "THE TURNAROUND",
    headline,
    body,
    cta: "Experience the upgrade",
    prompt: `Photorealistic premium social ad for ${brand.name}: ${product}, dark editorial studio background with a soft violet signal light, aspirational product photography, clean 4:5 Instagram composition. Absolutely no text, letters, words, typography, logos, labels, symbols or watermark anywhere in the image. Keep the upper quarter visually clean for a UI overlay.`,
    instagramCaption: `${headline}\n\nYou told us where the experience needed to improve. We listened, rebuilt the detail, and made delivery better. ${body} #${brand.handle.replace("@", "")} #CustomerCare`,
    xCaption: `You told us. We fixed it. ${headline} ${body}`,
    generatedBy: "BrandShield fallback",
  };
}

export function ugcFromReview(review: Review, brand: Pick<BrandCase, "name" | "handle">): CreativeConcept {
  const quote = `“${review.text.length > 112 ? `${review.text.slice(0, 109)}…` : review.text}”`;
  return {
    kind: "ugc",
    title: "High-converting social proof",
    eyebrow: "REAL CUSTOMER · 5 STARS",
    headline: "THE REVIEW THAT SELLS FOR YOU.",
    body: quote,
    cta: `Meet ${brand.name}`,
    quote,
    prompt: `Photorealistic UGC-style product social creative for ${brand.name}, premium authentic customer moment, warm natural texture, clean editorial 4:5 Instagram composition. Absolutely no text, letters, words, typography, logos, labels, symbols or watermark anywhere in the image. Keep the upper quarter visually clean for a testimonial UI overlay.`,
    instagramCaption: `${quote}\n\nReal words from real customers. This is why we make ${brand.name}. ${brand.handle}`,
    xCaption: `${quote} — a real ${brand.name} customer.`,
    generatedBy: "BrandShield fallback",
  };
}
