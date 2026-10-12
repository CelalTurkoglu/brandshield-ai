import { getDemoCase } from "@/lib/demo-data";
import { liveBrandFromReviews, scrapeWithApify } from "@/lib/integrations";
import { ensureUser, persistReviews } from "@/lib/db";
import { readSession, sessionCookieName } from "@/lib/auth";
import { cookies } from "next/headers";
import type { BrandCase } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string; caseId?: BrandCase["id"]; businessId?: string };
    const baseBrand = getDemoCase(body.caseId ?? "coffee");
    const url = body.url?.trim() ?? "";
    const externalReviews = url ? await scrapeWithApify(url) : null;

    if (externalReviews) {
      const user = await readSession((await cookies()).get(sessionCookieName)?.value);
      if (user && body.businessId) {
        await ensureUser(user);
        await persistReviews(body.businessId, externalReviews.reviews);
      }
      const liveBrand = liveBrandFromReviews(baseBrand, externalReviews.resolvedUrl || url, externalReviews.reviews, externalReviews.sourceName);
      return Response.json({
        brand: liveBrand,
        reviews: externalReviews.reviews,
        source: "apify",
      });
    }

    return Response.json({
      brand: baseBrand,
      reviews: baseBrand.reviews,
      source: "demo",
      fallbackReason: url
        ? "Apify was unavailable or not configured for this source. Demo safety fallback loaded."
        : "No URL supplied. Demo safety fallback loaded.",
    });
  } catch {
    const brand = getDemoCase("coffee");
    return Response.json({
      brand,
      reviews: brand.reviews,
      source: "demo",
      fallbackReason: "We could not read that source. Demo safety fallback loaded.",
    });
  }
}
