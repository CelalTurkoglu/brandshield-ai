import { getDemoCase } from "@/lib/demo-data";
import { generateReplyDraft } from "@/lib/intelligence";
import type { BrandCase, Review } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { review?: Review; brand?: BrandCase };
    if (!body.review?.text) return Response.json({ error: "A review is required." }, { status: 400 });
    const brand = body.brand ?? getDemoCase("coffee");
    return Response.json(generateReplyDraft(body.review, brand));
  } catch {
    return Response.json({ error: "Invalid reply payload." }, { status: 400 });
  }
}
