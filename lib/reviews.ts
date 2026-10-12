import type { Review } from "./types";

export type ReviewPeriodDays = 7 | 30 | 90;
export type ReplyLanguage = "tr" | "en";

function relativeDateToMs(value: string, now: number) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "today" || normalized === "bugün" || normalized === "recently" || normalized === "recent") return now;
  if (normalized === "yesterday" || normalized === "dün") return now - 24 * 60 * 60 * 1000;
  const match = normalized.match(/^(\d+)\s*(m|min|mins|minute|minutes|h|hr|hour|hours|d|day|days|gün|saat|dakika)\s*(ago|önce)?$/);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = /m|min|minute|dakika/.test(unit)
    ? 60 * 1000
    : /h|hr|hour|saat/.test(unit)
      ? 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;
  return now - amount * multiplier;
}

export function parseReviewDate(value: string, now = Date.now()): number | null {
  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) return parsed;
  return relativeDateToMs(value, now);
}

export function sortReviewsLatest(reviews: Review[], now = Date.now()) {
  return [...reviews].sort((a, b) => {
    const aDate = parseReviewDate(a.date, now);
    const bDate = parseReviewDate(b.date, now);
    if (aDate === null && bDate === null) return 0;
    if (aDate === null) return 1;
    if (bDate === null) return -1;
    return bDate - aDate;
  });
}

export function filterReviewsByPeriod(reviews: Review[], days: ReviewPeriodDays, now = Date.now()) {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return sortReviewsLatest(reviews, now).filter((review) => {
    const timestamp = parseReviewDate(review.date, now);
    return timestamp === null || timestamp >= cutoff;
  });
}

const turkishWords = /\b(ve|bir|bu|çok|cok|ama|için|icin|müşteri|musteri|sipariş|siparis|kötü|kotu|harika|teşekkür|tesekkur|lütfen|lutfen|paket|ürün|urun)\b/i;
const englishWords = /\b(the|and|this|was|were|please|thank|order|delivery|leaked|cold|great|love)\b/i;

export function detectReplyLanguage(text: string): ReplyLanguage {
  if (/[çğıöşüÇĞİÖŞÜ]/.test(text) || turkishWords.test(text)) return "tr";
  if (englishWords.test(text)) return "en";
  return "en";
}
