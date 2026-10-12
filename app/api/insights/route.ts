import { analyzeReviews } from "@/lib/intelligence";
import type { Review } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reviews?: Review[] };
    if (!Array.isArray(body.reviews) || body.reviews.length === 0) {
      return Response.json({ error: "At least one review is required." }, { status: 400 });
    }
    return Response.json(analyzeReviews(body.reviews));
  } catch {
    return Response.json({ error: "Invalid insight payload." }, { status: 400 });
  }
}
