import { cookies } from "next/headers";
import { readSession, sessionCookieName } from "@/lib/auth";
import { generateReplyDraft } from "@/lib/intelligence";
import type { BrandCase, Review } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reviews?: Review[]; brand?: BrandCase; action?: "draft" | "queue" };
    const reviews = (body.reviews ?? []).filter((review) => review.sentiment === "negative" || review.rating <= 2).slice(0, 100);
    if (!body.brand || !reviews.length) return Response.json({ error: "No negative reviews supplied." }, { status: 400 });
    const drafts = reviews.map((review) => generateReplyDraft(review, body.brand!));
    return Response.json({ drafts, queued: body.action === "queue", channel: "Google Business Profile", note: "Replies are prepared for the connected review channel. Actual Google publishing requires Business Profile OAuth." });
  } catch {
    return Response.json({ error: "Bulk reply generation failed." }, { status: 500 });
  }
}
