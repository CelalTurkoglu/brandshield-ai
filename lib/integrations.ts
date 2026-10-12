import { classifyReview } from "./intelligence";
import { sortReviewsLatest } from "./reviews";
import type { BrandCase, CreativeConcept, Review } from "./types";

function pickString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickNumber(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}

function sourceNameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/i);
    const rawName = placeMatch?.[1] ?? parsed.hostname.replace(/^www\./, "");
    return decodeURIComponent(rawName).replace(/\+/g, " ").replace(/[-_]+/g, " ").trim() || "Imported review source";
  } catch {
    return "Imported review source";
  }
}

export function liveBrandFromReviews(baseBrand: BrandCase, url: string, reviews: Review[], sourceName?: string): BrandCase {
  const name = sourceName?.trim() || sourceNameFromUrl(url);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "imported-review-source";
  const rating = reviews.length ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10 : baseBrand.rating;
  return {
    ...baseBrand,
    name,
    category: "Live review source",
    handle: `@${slug}`,
    rating,
    reviewCount: reviews.length,
    trend: "Live Apify import",
    sourceLabel: "Apify · live source",
    managerEmail: process.env.BRAND_MANAGER_EMAIL || "",
    managerWhatsApp: process.env.BRAND_MANAGER_WHATSAPP || "",
    reviews,
  };
}

async function resolveSourceUrl(input: string) {
  let current = input;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(current, { method: "GET", redirect: "manual", headers: { "user-agent": "BrandShield/1.0" }, cache: "no-store" });
      const location = response.headers.get("location");
      if (!location) break;
      current = new URL(location, current).toString();
    } catch {
      break;
    }
  }
  return current;
}

export async function scrapeWithApify(url: string): Promise<{ reviews: Review[]; sourceName: string; resolvedUrl: string } | null> {
  const token = process.env.APIFY_API_TOKEN;
  const actorId = process.env.APIFY_REVIEW_ACTOR_ID;
  if (!token || !actorId || !url) return null;

  try {
    const resolvedUrl = await resolveSourceUrl(url);
    const authHeaders = { Authorization: `Bearer ${token}`, "content-type": "application/json" };
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?waitForFinish=60`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ startUrls: [{ url: resolvedUrl }], maxReviews: 100, maxCrawledPlacesPerSearch: 1 }),
      cache: "no-store",
    });
    if (!runResponse.ok) return null;
    const runJson = (await runResponse.json()) as { data?: { defaultDatasetId?: string } };
    const datasetId = runJson.data?.defaultDatasetId;
    if (!datasetId) return null;

    const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!itemsResponse.ok) return null;
    const raw = (await itemsResponse.json()) as unknown;
    if (!Array.isArray(raw)) return null;

    const sourceName = raw
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => pickString(item, ["placeName", "businessName", "locationName", "storeName"]))
      .find(Boolean) || sourceNameFromUrl(resolvedUrl);
    const reviews = sortReviewsLatest(raw
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item, index) => {
        const text = pickString(item, ["text", "reviewText", "review", "comment", "content"]);
        const author = pickString(item, ["name", "authorName", "reviewerName", "author"]) || "Verified customer";
        const rating = Math.max(1, Math.min(5, pickNumber(item, ["rating", "stars", "score"]) || 4));
        return classifyReview({
          id: `apify-${index + 1}`,
          author,
          initials: author.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "VC",
          rating,
          text,
          date: pickString(item, ["publishedAtDate", "date", "publishedAt", "createdAt"]) || "Recently",
          source: "Apify",
        });
      })
      .filter((review) => review.text.length > 0), Date.now()).slice(0, 100);

    return reviews.length ? { reviews, sourceName, resolvedUrl } : null;
  } catch {
    return null;
  }
}

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

export function makeCreativeFallback(concept: CreativeConcept, brandName: string): string {
  const isUgc = concept.kind === "ugc";
  const background = isUgc ? "#102a25" : "#172337";
  const accent = isUgc ? "#8ee3bb" : "#f7b38e";
  const secondary = isUgc ? "#386b5b" : "#526f9a";
  const brandLabel = esc(brandName.slice(0, 24));
  const art = isUgc
    ? `<g filter="url(#shadow)"><rect x="384" y="330" width="312" height="610" rx="62" fill="#d9efe5"/><rect x="438" y="238" width="204" height="126" rx="30" fill="#b9d8cb"/><rect x="432" y="490" width="216" height="186" rx="28" fill="${secondary}" opacity=".86"/><circle cx="540" cy="575" r="54" fill="${accent}" opacity=".9"/><path d="M480 575h120M540 520v110" stroke="#102a25" stroke-width="10" stroke-linecap="round" opacity=".56"/><path d="M430 792h220" stroke="#6c9c8b" stroke-width="14" stroke-linecap="round" opacity=".56"/></g>`
    : `<g filter="url(#shadow)"><path d="M340 442h400l-34 426c-4 50-46 88-96 88H470c-50 0-92-38-96-88l-34-426Z" fill="#f3f5f7"/><rect x="318" y="392" width="444" height="82" rx="35" fill="#cbd6df"/><rect x="358" y="554" width="364" height="230" rx="20" fill="${secondary}" opacity=".84"/><path d="M388 610h304M388 672h304M388 734h304" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".9"/><path d="M430 340c-34-70 72-80 36-154M560 340c-34-70 72-80 36-154" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".72"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="#08111d"/></linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="26" stdDeviation="24" flood-color="#000000" flood-opacity=".35"/></filter>
    </defs>
    <rect width="1080" height="1350" fill="url(#bg)"/>
    <circle cx="850" cy="180" r="240" fill="${accent}" opacity=".18"/>
    <circle cx="170" cy="1130" r="260" fill="${secondary}" opacity=".26"/>
    <rect x="74" y="76" width="932" height="1198" rx="48" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
    <rect x="124" y="144" width="832" height="930" rx="42" fill="rgba(255,255,255,.055)" stroke="rgba(255,255,255,.16)"/>
    ${art}
    <circle cx="164" cy="1156" r="8" fill="${accent}"/><rect x="190" y="1152" width="360" height="8" rx="4" fill="rgba(255,255,255,.36)"/>
    <text x="124" y="1218" fill="white" font-family="Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="4">BRANDSHIELD / ${isUgc ? "SOCIAL PROOF" : "TURNAROUND"}</text>
    <text x="124" y="1256" fill="rgba(255,255,255,.66)" font-family="Arial, sans-serif" font-size="24">${brandLabel}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function pollFal(statusUrl: string, responseUrl: string, key: string): Promise<string | null> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const statusResponse = await fetch(statusUrl, { headers: { Authorization: `Key ${key}` }, cache: "no-store" });
    if (statusResponse.ok) {
      const statusJson = (await statusResponse.json()) as { status?: string; error?: string };
      if (statusJson.status === "COMPLETED") {
        const response = await fetch(responseUrl, { headers: { Authorization: `Key ${key}` }, cache: "no-store" });
        if (!response.ok) return null;
        const json = (await response.json()) as { images?: Array<{ url?: string }>; image?: { url?: string } };
        return json.images?.[0]?.url ?? json.image?.url ?? null;
      }
      if (statusJson.status === "FAILED" || statusJson.error) return null;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return null;
}

export async function generateWithFal(concept: CreativeConcept): Promise<string | null> {
  const key = process.env.FAL_KEY;
  const model = process.env.FAL_MODEL ?? "fal-ai/flux/schnell";
  if (!key) return null;

  try {
    const response = await fetch(`https://queue.fal.run/${model}`, {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ prompt: concept.prompt, image_size: "portrait_4_3", num_images: 1 }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { images?: Array<{ url?: string }>; response_url?: string; status_url?: string; request_id?: string };
    if (json.images?.[0]?.url) return json.images[0].url;
    if (json.response_url && json.status_url) return pollFal(json.status_url, json.response_url, key);
    if (json.request_id) {
      const requestRoot = `https://queue.fal.run/${model}/requests/${json.request_id}`;
      return pollFal(`${requestRoot}/status`, `${requestRoot}/response`, key);
    }
    return null;
  } catch {
    return null;
  }
}
