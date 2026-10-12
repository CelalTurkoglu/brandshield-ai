"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  AtSign,
  Bell,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Copy,
  HeartHandshake,
  Instagram,
  Languages,
  Link2,
  LoaderCircle,
  LogIn,
  LogOut,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  PanelLeft,
  Quote,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDemoCase } from "@/lib/demo-data";
import { analyzeReviews, campaignFromAnomaly } from "@/lib/intelligence";
import { t, type Locale, type TranslationKey } from "@/lib/i18n";
import { filterReviewsByPeriod, type ReviewPeriodDays } from "@/lib/reviews";
import type { AuthUser } from "@/lib/auth";
import type { BrandCase, CreativeConcept, CreativeKind, InsightReport, ReplyDraft, Review, ReviewCategory } from "@/lib/types";
import { BusinessHub } from "./business-hub";
import { AuthForm } from "./auth-form";

const initialBrand = getDemoCase("coffee");
const initialReport = analyzeReviews(initialBrand.reviews);

type Notice = { tone: "success" | "info" | "danger"; key: TranslationKey } | null;
type Period = "7" | "30" | "90";

type IntegrationStatus = {
  apifyConfigured: boolean;
  falConfigured: boolean;
  authConfigured: boolean;
  databaseConfigured: boolean;
};

const periodKeys: Record<Period, TranslationKey> = { "7": "days7", "30": "days30", "90": "days90" };

const categoryMeta = (locale: Locale): Record<ReviewCategory, { label: string; dot: string; chip: string }> => ({
  critical: { label: locale === "tr" ? "PR riski" : "PR risk", dot: "bg-rose-400", chip: "border-rose-400/20 bg-rose-400/10 text-rose-200" },
  operational: { label: locale === "tr" ? "Operasyon" : "Operational", dot: "bg-amber-300", chip: "border-amber-300/20 bg-amber-300/10 text-amber-100" },
  praise: { label: locale === "tr" ? "Sosyal kanıt" : "Social proof", dot: "bg-emerald-300", chip: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100" },
});

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function riskLabel(locale: Locale, risk: InsightReport["riskLevel"]) {
  if (locale === "tr") return risk === "Protected" ? "KORUMALI" : risk === "Watch" ? "İZLE" : "RİSKTE";
  return risk === "Protected" ? "PROTECTED" : risk === "Watch" ? "WATCH" : "AT RISK";
}

function initialsForUser(user: AuthUser) {
  return user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

function localCreativeImage(concept: CreativeConcept, brandName: string) {
  const isUgc = concept.kind === "ugc";
  const bg = isUgc ? "#102a25" : "#172337";
  const accent = isUgc ? "#8ee3bb" : "#f7b38e";
  const secondary = isUgc ? "#386b5b" : "#526f9a";
  const safeBrand = brandName.replace(/[&<>]/g, "").slice(0, 24);
  const art = isUgc
    ? `<rect x="384" y="330" width="312" height="610" rx="62" fill="#d9efe5"/><rect x="438" y="238" width="204" height="126" rx="30" fill="#b9d8cb"/><rect x="432" y="490" width="216" height="186" rx="28" fill="${secondary}" opacity=".86"/><circle cx="540" cy="575" r="54" fill="${accent}" opacity=".9"/><path d="M480 575h120M540 520v110" stroke="#102a25" stroke-width="10" stroke-linecap="round" opacity=".56"/>`
    : `<path d="M340 442h400l-34 426c-4 50-46 88-96 88H470c-50 0-92-38-96-88l-34-426Z" fill="#f3f5f7"/><rect x="318" y="392" width="444" height="82" rx="35" fill="#cbd6df"/><rect x="358" y="554" width="364" height="230" rx="20" fill="${secondary}" opacity=".84"/><path d="M388 610h304M388 672h304M388 734h304" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".9"/><path d="M430 340c-34-70 72-80 36-154M560 340c-34-70 72-80 36-154" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".72"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#08111d"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="26" stdDeviation="24" flood-color="#000000" flood-opacity=".35"/></filter></defs><rect width="1080" height="1350" fill="url(#bg)"/><circle cx="850" cy="180" r="240" fill="${accent}" opacity=".18"/><circle cx="170" cy="1130" r="260" fill="${secondary}" opacity=".26"/><rect x="74" y="76" width="932" height="1198" rx="48" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="2"/><rect x="124" y="144" width="832" height="930" rx="42" fill="rgba(255,255,255,.055)" stroke="rgba(255,255,255,.16)"/><g filter="url(#shadow)">${art}</g><circle cx="164" cy="1156" r="8" fill="${accent}"/><rect x="190" y="1152" width="360" height="8" rx="4" fill="rgba(255,255,255,.36)"/><text x="124" y="1218" fill="white" font-family="Arial" font-size="26" font-weight="700" letter-spacing="4">BRANDSHIELD / ${isUgc ? "SOCIAL PROOF" : "TURNAROUND"}</text><text x="124" y="1256" fill="rgba(255,255,255,.66)" font-family="Arial" font-size="24">${safeBrand}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cn("h-3.5 w-3.5", index < rating ? "fill-amber-300 text-amber-300" : "text-slate-700")} />
      ))}
    </div>
  );
}

export function BrandShieldDashboard() {
  const [locale, setLocale] = useState<Locale>("en");
  const [localeReady, setLocaleReady] = useState(false);
  const [brand, setBrand] = useState<BrandCase>(initialBrand);
  const [report, setReport] = useState<InsightReport>(initialReport);
  const [sourceUrl, setSourceUrl] = useState("");
  const [activeDemo, setActiveDemo] = useState<BrandCase["id"]>("coffee");
  const [reviewFilter, setReviewFilter] = useState<"all" | ReviewCategory>("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(initialReport.reviewed.find((review) => review.category === "critical") ?? null);
  const [reply, setReply] = useState<ReplyDraft | null>(null);
  const [creative, setCreative] = useState<CreativeConcept | null>(null);
  const [creativeKind, setCreativeKind] = useState<CreativeKind>("crisis");
  const [loading, setLoading] = useState<"scan" | "reply" | "creative" | "bulk" | null>(null);
  const [notice, setNotice] = useState<Notice>({ tone: "info", key: "loadedDemo" });
  const [period, setPeriod] = useState<Period>("7");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [status, setStatus] = useState<IntegrationStatus>({ apifyConfigured: false, falConfigured: false, authConfigured: false, databaseConfigured: false });
  const [bulkReplies, setBulkReplies] = useState<ReplyDraft[]>([]);

  const copy = (key: TranslationKey) => t(locale, key);
  const primaryAnomaly = report.anomalies[0];
  const filteredReviews = useMemo(
    () => (reviewFilter === "all" ? report.reviewed : report.reviewed.filter((review) => review.category === reviewFilter)),
    [report.reviewed, reviewFilter],
  );
  const negativeReviews = report.reviewed.filter((review) => review.sentiment === "negative");
  const notifications = report.anomalies.slice(0, 3);
  const meta = categoryMeta(locale);

  useEffect(() => {
    const saved = window.localStorage.getItem("brandshield_locale");
    if (saved === "tr" || saved === "en") setLocale(saved);
    setLocaleReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    if (localeReady) window.localStorage.setItem("brandshield_locale", locale);
  }, [locale, localeReady]);

  useEffect(() => {
    setReport(analyzeReviews(filterReviewsByPeriod(brand.reviews, Number(period) as ReviewPeriodDays)));
  }, [brand.reviews, period]);

  useEffect(() => {
    let active = true;
    async function loadRuntime() {
      try {
        const [statusResponse, authResponse] = await Promise.all([fetch("/api/status", { cache: "no-store" }), fetch("/api/auth/me", { cache: "no-store" })]);
        if (!active) return;
        if (statusResponse.ok) setStatus((await statusResponse.json()) as IntegrationStatus);
        if (authResponse.ok) {
          const data = (await authResponse.json()) as { user?: AuthUser };
          if (data.user) setUser(data.user);
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    }
    void loadRuntime();
    const authParam = new URLSearchParams(window.location.search).get("auth");
    if (authParam === "login" || authParam === "register") {
      setAuthMode(authParam);
      setProfileOpen(true);
    }
    return () => {
      active = false;
    };
  }, []);

  async function loadExperience(caseId: BrandCase["id"], url = "", businessId?: string) {
    if (url.trim()) {
      try {
        const parsed = new URL(url.trim());
        if (!/^https?:$/.test(parsed.protocol)) throw new Error("invalid");
      } catch {
        setNotice({ tone: "danger", key: "invalidUrl" });
        return;
      }
    }
    setLoading("scan");
    setNotice(null);
    try {
      const scrapeResponse = await fetch("/api/reviews/scrape", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ caseId, url, businessId }),
      });
      if (!scrapeResponse.ok) throw new Error("Scan failed");
      const scraped = (await scrapeResponse.json()) as { brand: BrandCase; reviews: Review[]; source: "apify" | "demo" };
      const insightResponse = await fetch("/api/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reviews: scraped.reviews }),
      });
      const nextReport = insightResponse.ok ? ((await insightResponse.json()) as InsightReport) : analyzeReviews(scraped.reviews);
      const nextBrand = { ...scraped.brand, reviews: scraped.reviews };
      setBrand(nextBrand);
      setReport(nextReport);
      setSelectedReview(nextReport.reviewed.find((review) => review.category === "critical") ?? nextReport.reviewed[0] ?? null);
      setReply(null);
      setBulkReplies([]);
      setCreative(null);
      setActiveDemo(caseId);
      setNotice({ tone: scraped.source === "apify" ? "success" : "info", key: scraped.source === "apify" ? "loadedLive" : "loadedDemo" });
    } catch {
      const fallback = getDemoCase(caseId);
      const fallbackReport = analyzeReviews(fallback.reviews);
      setBrand(fallback);
      setReport(fallbackReport);
      setSelectedReview(fallbackReport.reviewed.find((review) => review.category === "critical") ?? null);
      setNotice({ tone: "danger", key: "sourceError" });
    } finally {
      setLoading(null);
    }
  }

  async function handleScan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadExperience(activeDemo, sourceUrl);
  }

  async function draftReply(review: Review) {
    setSelectedReview(review);
    setLoading("reply");
    try {
      const response = await fetch("/api/replies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ review, brand }),
      });
      if (!response.ok) throw new Error("Reply failed");
      setReply((await response.json()) as ReplyDraft);
    } catch {
      setNotice({ tone: "danger", key: "replyError" });
    } finally {
      setLoading(null);
    }
  }

  async function generateBulkReplies() {
    if (!negativeReviews.length) return;
    setLoading("bulk");
    try {
      const response = await fetch("/api/replies/bulk", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reviews: negativeReviews, brand }) });
      if (!response.ok) throw new Error("Bulk replies failed");
      const data = (await response.json()) as { drafts: ReplyDraft[] };
      setBulkReplies(data.drafts);
      setNotice({ tone: "success", key: "bulkRepliesReady" });
    } catch {
      setNotice({ tone: "danger", key: "replyError" });
    } finally {
      setLoading(null);
    }
  }

  function approveBulkReplies() {
    const ids = new Set(bulkReplies.map((draft) => draft.reviewId));
    setBrand((current) => ({ ...current, reviews: current.reviews.map((review) => ids.has(review.id) ? { ...review, approved: true } : review) }));
    setNotice({ tone: "success", key: "queuedAllReplies" });
  }

  async function generateCreative(kind: CreativeKind) {
    setCreativeKind(kind);
    setLoading("creative");
    try {
      const response = await fetch("/api/creative", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, brand, anomalyTopic: primaryAnomaly?.topic, review: kind === "ugc" ? report.topPraise[0] : undefined }),
      });
      if (!response.ok) throw new Error("Creative failed");
      const result = (await response.json()) as CreativeConcept;
      setCreative(result);
      setNotice({ tone: result.generatedBy === "fal.ai" ? "success" : "info", key: result.generatedBy === "fal.ai" ? "creativeLive" : "creativeFallback" });
    } catch {
      if (primaryAnomaly) {
        const concept = campaignFromAnomaly(primaryAnomaly, brand);
        setCreative({ ...concept, imageUrl: localCreativeImage(concept, brand.name) });
      }
      setNotice({ tone: "danger", key: "creativeFallback" });
    } finally {
      setLoading(null);
    }
  }

  async function copyText(text: string, key: TranslationKey) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice({ tone: "success", key });
    } catch {
      setNotice({ tone: "info", key });
    }
  }

  function approveReply() {
    if (!selectedReview) return;
    setBrand((current) => ({ ...current, reviews: current.reviews.map((review) => (review.id === selectedReview.id ? { ...review, approved: true } : review)) }));
    setReport((current) => ({ ...current, reviewed: current.reviewed.map((review) => (review.id === selectedReview.id ? { ...review, approved: true } : review)) }));
    setNotice({ tone: "success", key: "approveReplyNotice" });
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProfileOpen(false);
    setNotice({ tone: "info", key: "loggedOut" });
  }

  const navItems = [
    { href: "#radar", icon: Activity, label: copy("navRadar") },
    { href: "#reviews", icon: MessageSquareText, label: copy("navReviews"), badge: negativeReviews.length },
    { href: "#creative", icon: Settings2, label: copy("navStudio") },
    { href: "#recovery", icon: HeartHandshake, label: copy("navRecovery") },
  ];

  return (
    <main className="min-h-screen bg-[#08111d] text-slate-100 selection:bg-blue-400/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="signal-grid absolute inset-0 opacity-40" /></div>
      <div className="relative flex min-h-screen">
        <aside className="hidden w-[244px] shrink-0 border-r border-white/8 bg-[#0b1522] px-4 py-5 lg:block">
          <div className="mb-10 flex items-center gap-3 px-2"><div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600"><ShieldCheck className="h-5 w-5 text-white" /></div><div><p className="text-sm font-semibold tracking-tight text-white">BrandShield</p><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">{copy("brandTag")}</p></div></div>
          <nav className="space-y-1 text-sm">{navItems.map((item, index) => { const Icon = item.icon; return <a key={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 transition", index === 0 ? "bg-blue-500/12 font-medium text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")} href={item.href}><Icon className={cn("h-4 w-4", index === 0 ? "text-blue-300" : "text-slate-500")} />{item.label}{item.badge ? <span className="ml-auto rounded-md bg-rose-400/15 px-1.5 py-0.5 text-[10px] text-rose-200">{item.badge}</span> : null}</a>; })}</nav>
          <div className="mt-10 rounded-xl border border-blue-400/15 bg-blue-500/8 p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-blue-200"><Zap className="h-3.5 w-3.5" /> 10X opportunity</div><p className="text-xs leading-5 text-slate-400">{locale === "tr" ? "Çözülen her şikâyeti bir sonraki müşterinin göreceği kanıta dönüştür." : "Turn every resolved complaint into proof your next customer can see."}</p><button onClick={() => generateCreative("crisis")} className="mt-4 text-xs font-semibold text-blue-200 transition hover:text-white">{copy("campaign")} <ArrowUpRight className="inline h-3.5 w-3.5" /></button></div>
          <button onClick={() => setProfileOpen(true)} className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/8 bg-white/[.025] p-3 text-left transition hover:bg-white/[.06]" aria-label={copy("profile")}><div className="grid h-8 w-8 place-items-center rounded-full bg-slate-700 text-xs font-bold text-slate-100">{user ? initialsForUser(user) : "G"}</div><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-200">{user?.name ?? copy("guestWorkspace")}</p><p className="truncate text-[10px] text-slate-500">{user?.email ?? copy("signIn")}</p></div><MoreHorizontal className="ml-auto h-4 w-4 text-slate-500" /></button>
        </aside>

        {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden="true" /><aside className="relative h-full w-[280px] border-r border-white/10 bg-[#0b1522] px-4 py-5 shadow-2xl"><div className="mb-10 flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-sm font-semibold text-white">BrandShield</p><p className="text-[10px] uppercase tracking-[.14em] text-slate-500">{copy("brandTag")}</p></div></div><button onClick={() => setMobileOpen(false)} aria-label={copy("close")}><X className="h-5 w-5 text-slate-400" /></button></div><nav className="space-y-1 text-sm">{navItems.map((item) => { const Icon = item.icon; return <a key={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5" href={item.href}><Icon className="h-4 w-4 text-slate-500" />{item.label}{item.badge ? <span className="ml-auto rounded-md bg-rose-400/15 px-1.5 py-0.5 text-[10px] text-rose-200">{item.badge}</span> : null}</a>; })}</nav></aside></div>}

        <section className="min-w-0 flex-1 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
          <BusinessHub locale={locale} authenticated={Boolean(user)} onAnalyze={(url, businessId) => { setSourceUrl(url); void loadExperience(activeDemo, url, businessId); }} />
          <header className="relative mb-7 flex items-center justify-between gap-4"><div className="flex items-center gap-3 lg:hidden"><button onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5" aria-label="Menu"><PanelLeft className="h-4 w-4" /></button><ShieldCheck className="h-5 w-5 text-blue-300" /></div><div className="hidden text-xs text-slate-500 md:block"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />{copy("connected")} <span className="text-slate-600">· {copy("lastSynced")}</span></div><div className="ml-auto flex items-center gap-2"><div className="relative"><button onClick={() => { setNotificationsOpen((value) => !value); setPeriodOpen(false); }} className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/8 bg-white/[.035] text-slate-400 hover:text-white" aria-label={copy("notifications")}><Bell className="h-4 w-4" />{!notificationsRead && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400" />}</button>{notificationsOpen && <div className="absolute right-0 top-11 z-30 w-72 rounded-xl border border-white/10 bg-[#101c2b] p-3 shadow-2xl"><div className="flex items-center justify-between border-b border-white/8 pb-2"><p className="text-xs font-semibold text-white">{copy("notifications")}</p><button onClick={() => { setNotificationsRead(true); setNotificationsOpen(false); }} className="text-[10px] text-blue-300 hover:text-white">{copy("markRead")}</button></div>{notifications.length ? <div className="space-y-2 pt-2">{notifications.map((item) => <div key={item.id} className="rounded-lg bg-white/[.035] p-2.5"><p className="text-xs font-semibold text-slate-200">{item.title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{item.summary}</p></div>)}</div> : <p className="py-5 text-center text-xs text-slate-500">{copy("noNotifications")}</p>}</div>}</div><div className="relative"><button onClick={() => { setPeriodOpen((value) => !value); setNotificationsOpen(false); }} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[.035] px-3 py-2 text-xs font-medium text-slate-300" aria-label={copy("reviewStream")}><span className="hidden sm:inline">{copy(periodKeys[period])}</span><Clock3 className="h-3.5 w-3.5" /><ChevronDown className="h-3.5 w-3.5 text-slate-500" /></button>{periodOpen && <div className="absolute right-0 top-11 z-30 w-36 rounded-xl border border-white/10 bg-[#101c2b] p-1.5 shadow-2xl">{(["7", "30", "90"] as Period[]).map((value) => <button key={value} onClick={() => { setPeriod(value); setPeriodOpen(false); }} className={cn("flex w-full rounded-lg px-3 py-2 text-left text-xs", period === value ? "bg-blue-500/15 text-blue-200" : "text-slate-400 hover:bg-white/5 hover:text-white")}>{copy(periodKeys[value])}</button>)}</div>}</div><button onClick={() => setLocale(locale === "en" ? "tr" : "en")} className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[.035] px-2.5 py-2 text-[11px] font-semibold text-slate-300 hover:text-white" aria-label={copy("language")}><Languages className="h-3.5 w-3.5" />{locale.toUpperCase()}</button><button onClick={() => setProfileOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/8 bg-white/[.035] text-slate-300 hover:text-white" aria-label={copy("profile")}><UserRound className="h-4 w-4" /></button></div></header>

          <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-blue-300"><Activity className="h-3.5 w-3.5" /> {copy("customerOps")}</div><h1 className="text-3xl font-semibold tracking-[-.045em] text-white sm:text-4xl">{copy("heroTitleA")} <span className="text-gradient">{copy("heroTitleB")}</span></h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{copy("heroSub")}</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><Link2 className="h-3.5 w-3.5 text-blue-300" />{status.apifyConfigured ? copy("apifyReady") : copy("demoMode")}{status.falConfigured && <> · {copy("falReady")}</>}{status.databaseConfigured && <> · {copy("databaseReady")}</>}</div></div>

          <form onSubmit={handleScan} className="glass-panel mb-7 rounded-xl p-3 sm:p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/8 bg-[#07101b] px-3 py-3 focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-400/10"><Search className="h-4 w-4 shrink-0 text-slate-500" /><input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder={locale === "tr" ? "Google Maps veya ürün URL’sini yapıştır…" : "Paste a Google Maps or product URL…"} /><span className={cn("hidden rounded-md border px-2 py-1 text-[10px] font-medium sm:inline", status.apifyConfigured ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-200" : "border-amber-300/20 bg-amber-300/8 text-amber-100")}>{status.apifyConfigured ? copy("apifyReady").toUpperCase() : copy("demoMode").toUpperCase()}</span></div><button disabled={loading === "scan"} type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-60"><RefreshCw className={cn("h-4 w-4", loading === "scan" && "animate-spin")} /> {copy("analyze")}</button></div><div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/6 pt-3"><span className="mr-1 text-[11px] font-medium uppercase tracking-[.14em] text-slate-600">{copy("demoCases")}</span><button type="button" onClick={() => loadExperience("coffee")} className={cn("rounded-lg border px-2.5 py-1.5 text-xs transition", activeDemo === "coffee" ? "border-blue-400/40 bg-blue-400/15 text-blue-100" : "border-white/8 bg-white/[.02] text-slate-400 hover:text-white")}>☕ {copy("trendCoffee")}</button><button type="button" onClick={() => loadExperience("skincare")} className={cn("rounded-lg border px-2.5 py-1.5 text-xs transition", activeDemo === "skincare" ? "border-blue-400/40 bg-blue-400/15 text-blue-100" : "border-white/8 bg-white/[.02] text-slate-400 hover:text-white")}>✦ {copy("trendSkin")}</button><span className="ml-auto hidden text-xs text-slate-500 md:block">{copy("demoHint")}</span></div></form>

          {notice && <div className={cn("mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", notice.tone === "success" ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-100" : notice.tone === "danger" ? "border-rose-400/20 bg-rose-400/8 text-rose-100" : "border-blue-400/20 bg-blue-400/8 text-blue-100")}><CircleCheck className="mt-0.5 h-4 w-4 shrink-0" /><span>{copy(notice.key)}</span></div>}

          <div id="radar" className="mb-6 grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><section className="glass-panel overflow-hidden rounded-xl p-5 sm:p-6"><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-slate-500"><Activity className="h-3.5 w-3.5 text-blue-300" /> {copy("brandHealth")}</div><div className="flex items-end gap-3"><h2 className="text-xl font-semibold text-white">{brand.name}</h2><span className="mb-0.5 text-sm text-slate-500">{brand.category}</span></div></div><div className="rounded-lg border border-white/8 bg-white/[.035] px-3 py-2 text-right"><p className="text-[10px] uppercase tracking-[.14em] text-slate-500">{copy("reviewStream")}</p><p className="mt-0.5 text-xs font-medium text-slate-200">{brand.sourceLabel}</p></div></div><div className="grid gap-5 md:grid-cols-[188px_1fr] md:items-center"><div className="relative mx-auto grid h-[166px] w-[166px] place-items-center rounded-full" style={{ background: `conic-gradient(#4f8ce8 0deg ${report.healthScore * 3.6}deg, rgba(255,255,255,.08) ${report.healthScore * 3.6}deg 360deg)` }}><div className="grid h-[138px] w-[138px] place-items-center rounded-full bg-[#0b1623]"><div className="text-center"><p className="text-4xl font-semibold tracking-[-.06em] text-white">{report.healthScore}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-blue-300">{riskLabel(locale, report.riskLevel)}</p></div></div><div className="absolute -right-2 top-3 h-3 w-3 rounded-full border-2 border-[#0b1623] bg-blue-300" /></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-white/6 bg-white/[.025] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-slate-500">{copy("criticalSignals")}</p><p className="mt-2 text-2xl font-semibold text-rose-200">{report.categories.critical}</p><p className="mt-1 text-xs text-rose-300/70">{copy("needRecovery")}</p></div><div className="rounded-lg border border-white/6 bg-white/[.025] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-slate-500">{copy("socialProof")}</p><p className="mt-2 text-2xl font-semibold text-emerald-200">{report.categories.praise}</p><p className="mt-1 text-xs text-emerald-300/70">{copy("readyForUGC")}</p></div><div className="rounded-lg border border-white/6 bg-white/[.025] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-slate-500">{copy("reviewVelocity")}</p><p className="mt-2 text-2xl font-semibold text-white">{brand.trend.split(" ")[0]}</p><p className="mt-1 text-xs text-slate-500">{copy("reviewsThisPeriod")}</p></div></div></div><div className="mt-6 grid gap-2 sm:grid-cols-3"><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${percent(report.sentiment.positive, report.totalReviews)}%` }} /></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-amber-300" style={{ width: `${percent(report.sentiment.neutral, report.totalReviews)}%` }} /></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-rose-400" style={{ width: `${percent(report.sentiment.negative, report.totalReviews)}%` }} /></div></div><div className="mt-2 flex items-center justify-between text-[11px] text-slate-500"><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />{report.sentiment.positive} {copy("praise")}</span><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />{report.sentiment.neutral} {copy("operational")}</span><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />{report.sentiment.negative} {copy("negative")}</span></div></section><section className="relative overflow-hidden rounded-xl border border-rose-400/25 bg-[#111923] p-5 sm:p-6"><div className="relative"><div className="mb-4 flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-rose-200"><AlertTriangle className="h-3 w-3" /> {copy("priorityAnomaly")}</span><span className="text-xs text-rose-200/70">{copy("actionWindow")}: 3.2h</span></div>{primaryAnomaly ? <><h2 className="max-w-sm text-2xl font-semibold tracking-[-.04em] text-white">{primaryAnomaly.title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-300">{primaryAnomaly.summary}</p><div className="mt-5 flex items-center gap-3"><div className="rounded-lg bg-rose-400/15 px-2.5 py-2 text-center"><p className="text-lg font-semibold text-rose-100">{primaryAnomaly.count}</p><p className="text-[9px] uppercase tracking-[.12em] text-rose-200/70">{copy("signals")}</p></div><div className="rounded-lg bg-white/[.04] px-2.5 py-2"><p className="text-sm font-semibold text-white">{primaryAnomaly.surgeLabel}</p><p className="text-[10px] text-slate-400">{copy("aboveBaseline")}</p></div></div><button onClick={() => generateCreative("crisis")} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-rose-300 px-3 py-2 text-xs font-bold text-rose-950 transition hover:bg-rose-200"><Zap className="h-3.5 w-3.5" /> {copy("campaign")}</button></> : <p className="text-sm text-slate-300">{copy("noCritical")}</p>}</div></section></div>

          <div className="mb-6 grid gap-4 2xl:grid-cols-[1.25fr_.75fr]"><section id="reviews" className="glass-panel min-w-0 rounded-xl p-5 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-slate-500">{copy("liveReviewFeed")}</p><h2 className="mt-1 text-lg font-semibold text-white">{copy("fromSignal")}</h2></div><div className="flex rounded-lg border border-white/8 bg-white/[.025] p-1">{(["all", "critical", "operational", "praise"] as const).map((filter) => <button key={filter} onClick={() => setReviewFilter(filter)} className={cn("rounded-md px-2.5 py-1.5 text-[11px] font-medium transition", reviewFilter === filter ? "bg-blue-500/15 text-blue-100" : "text-slate-500 hover:text-slate-300")}>{filter === "all" ? copy("all") : filter === "critical" ? copy("risk") : filter === "operational" ? copy("ops") : copy("reviewPraise")}</button>)}</div></div><div className="max-h-[520px] space-y-2 overflow-y-auto pr-1 thin-scrollbar">{filteredReviews.map((review) => { const itemMeta = meta[review.category ?? "operational"]; return <article key={review.id} className={cn("group rounded-lg border p-3.5 transition", selectedReview?.id === review.id ? "border-blue-400/40 bg-blue-400/[.07]" : "border-white/6 bg-white/[.018] hover:border-white/12 hover:bg-white/[.035]")}><div className="flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-200">{review.initials}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-sm font-semibold text-slate-100">{review.author}</span><Stars rating={review.rating} /><span className="text-[11px] text-slate-600">{review.date}</span><span className={cn("ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", itemMeta.chip)}><i className={cn("h-1.5 w-1.5 rounded-full", itemMeta.dot)} />{itemMeta.label}</span></div><p className="mt-2 text-sm leading-5 text-slate-400">{review.text}</p><div className="mt-3 flex items-center gap-2"><span className="text-[10px] font-medium uppercase tracking-[.12em] text-slate-600">{review.source}</span>{review.category === "critical" && <button onClick={() => draftReply(review)} className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-200 transition hover:text-white"><HeartHandshake className="h-3.5 w-3.5" /> {review.approved ? copy("recoveryQueued") : copy("suggestedReply")}</button>}{review.category === "praise" && <button onClick={() => generateCreative("ugc")} className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200 transition hover:text-white"><Sparkles className="h-3.5 w-3.5" /> {copy("makeUGC")}</button>}</div></div></div></article>; })}</div></section><section id="recovery" className="glass-panel rounded-xl p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-slate-500">{copy("automatedRecovery")}</p><h2 className="mt-1 text-lg font-semibold text-white">{copy("humanReplyReady")}</h2></div><div className="grid h-8 w-8 place-items-center rounded-lg border border-blue-400/20 bg-blue-400/10"><HeartHandshake className="h-4 w-4 text-blue-200" /></div></div>{loading === "reply" ? <div className="grid min-h-[270px] place-items-center rounded-lg border border-dashed border-blue-400/20 bg-blue-400/[.04]"><div className="text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-blue-300" /><p className="mt-3 text-sm text-slate-400">{copy("loadingReply")}</p></div></div> : reply ? <div className="rounded-lg border border-white/7 bg-[#0a1421] p-4"><div className="mb-3 flex items-center justify-between"><span className="rounded-md bg-blue-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-blue-200">{copy("replyDraft")}</span><span className="text-[10px] text-slate-500">{copy("refundCode")}: <b className="text-slate-300">{reply.refundCode}</b></span></div><p className="text-sm leading-6 text-slate-300">{reply.reply}</p><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => copyText(reply.reply, "replyCopied")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"><Copy className="h-3.5 w-3.5" /> {copy("oneClickCopy")}</button><button onClick={approveReply} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-400"><Send className="h-3.5 w-3.5" /> {copy("approveSend")}</button></div><div className="mt-3 flex gap-3 text-[11px]"><a className="inline-flex items-center gap-1 text-slate-400 hover:text-white" href={reply.managerLink} target="_blank" rel="noreferrer"><MessageSquareText className="h-3.5 w-3.5 text-emerald-300" /> {copy("managerWhatsApp")}</a><a className="inline-flex items-center gap-1 text-slate-400 hover:text-white" href={reply.emailLink}><Mail className="h-3.5 w-3.5 text-sky-300" /> {copy("email")}</a></div></div> : <div className="flex min-h-[270px] flex-col justify-between rounded-lg border border-dashed border-white/10 bg-white/[.015] p-5"><div><Quote className="h-6 w-6 text-blue-300" /><p className="mt-4 text-sm leading-6 text-slate-400">{copy("selectCritical")}</p></div><button onClick={() => selectedReview && draftReply(selectedReview)} disabled={!selectedReview} className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-400/25 bg-blue-400/10 px-3 py-2.5 text-xs font-semibold text-blue-100 transition hover:bg-blue-400/20 disabled:opacity-40"><MessageSquareText className="h-3.5 w-3.5" /> {copy("generateSmartReply")}</button></div>}</section></div>

          <section id="bulk" className="glass-panel mb-6 rounded-xl p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-slate-500">{copy("bulkReplies")}</p><h2 className="mt-1 text-lg font-semibold text-white">{negativeReviews.length} {copy("bulkRepliesCount")}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{locale === "tr" ? "Yorumların dilini koruyarak tek tek yanıt taslağı üret; sonra tümünü bağlı kanal kuyruğuna al." : "Prepare one reply per negative review in its original language, then queue them together for the connected channel."}</p></div><button disabled={loading === "bulk" || !negativeReviews.length} onClick={() => void generateBulkReplies()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-400 disabled:opacity-50"><RefreshCw className={cn("h-3.5 w-3.5", loading === "bulk" && "animate-spin")} /> {copy("generateBulkReplies")}</button></div>{bulkReplies.length > 0 && <div className="mt-5 rounded-lg border border-white/8 bg-[#08111d] p-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold text-white">{bulkReplies.length} {copy("bulkRepliesCount")}</p><span className="text-[10px] uppercase tracking-[.12em] text-slate-500">{copy("replyLanguage")}: TR / EN</span></div><div className="grid gap-2 md:grid-cols-2">{bulkReplies.slice(0, 6).map((draft) => <div key={draft.reviewId} className="rounded-lg border border-white/7 bg-white/[.025] p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-blue-200">{draft.reviewId}</span><span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-slate-400">{draft.language?.toUpperCase() ?? "EN"}</span></div><p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">{draft.reply}</p></div>)}</div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void copyText(bulkReplies.map((draft) => `${draft.reviewId}\n${draft.reply}`).join("\n\n"), "replyCopied")} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"><Copy className="h-3.5 w-3.5" /> {copy("copyAllReplies")}</button><button onClick={approveBulkReplies} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs font-bold text-slate-950 hover:bg-blue-50"><Send className="h-3.5 w-3.5" /> {copy("queueAllReplies")}</button></div></div>}</section>
          <section id="creative" className="glass-panel rounded-xl p-5 sm:p-6"><div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-blue-300"><Settings2 className="h-3.5 w-3.5" /> {copy("recoveryStudio")}</div><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-white">{copy("recoveryStudio")}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{copy("recoveryStudioSub")}</p></div><div className="flex flex-wrap gap-2"><button disabled={loading === "creative"} onClick={() => generateCreative("crisis")} className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition disabled:opacity-60", creativeKind === "crisis" ? "bg-blue-500 text-white hover:bg-blue-400" : "border border-white/10 bg-white/[.035] text-slate-300 hover:text-white")}><Zap className="h-3.5 w-3.5" /> {copy("turnaroundCampaign")}</button><button disabled={loading === "creative"} onClick={() => generateCreative("ugc")} className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition disabled:opacity-60", creativeKind === "ugc" ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300" : "border border-white/10 bg-white/[.035] text-slate-300 hover:text-white")}><HeartHandshake className="h-3.5 w-3.5" /> {copy("praiseToUGC")}</button></div></div><div className="grid gap-5 xl:grid-cols-[.82fr_1.18fr]">{loading === "creative" ? <div className="creative-placeholder grid min-h-[380px] place-items-center rounded-xl border border-blue-400/20"><div className="text-center"><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-blue-300" /><p className="mt-3 text-sm font-medium text-blue-100">{copy("loadingCreative")}</p></div></div> : creative?.imageUrl ? <div className="relative min-h-[380px] overflow-hidden rounded-xl border border-white/10 bg-[#101b29]"><img src={creative.imageUrl} alt="Generated BrandShield campaign creative" className="absolute -top-[10%] h-[120%] w-full object-cover object-center" /><div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#08111d]/95 via-[#08111d]/35 to-transparent" /><div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[#08111d]" /><div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/15 bg-[#08111d] p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/60">{copy("creativePreview")}</span><span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white">{creative.generatedBy === "fal.ai" ? copy("generatedByFal") : copy("generatedByFallback")}</span></div><p className="mt-2 text-sm font-semibold text-white">{creative.headline}</p></div></div> : <div className="creative-placeholder relative min-h-[380px] overflow-hidden rounded-xl border border-white/10 p-6"><div className="relative flex h-full flex-col justify-between"><span className="w-fit rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-blue-100">{copy("readyToGenerate")}</span><div><div className="mb-3 grid h-14 w-14 place-items-center rounded-xl border border-white/15 bg-white/10"><Settings2 className="h-6 w-6 text-blue-200" /></div><h3 className="max-w-xs text-3xl font-semibold tracking-[-.05em] text-white">{copy("makeRecoveryVisible")}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">{copy("recoveryStudioSub")}</p></div></div></div>}<div className="rounded-xl border border-white/7 bg-[#0a1421]/70 p-5">{creative ? <><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-300">{creative.eyebrow}</p><h3 className="mt-1 text-xl font-semibold text-white">{creative.title}</h3></div><span className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-white/[.035] px-2 py-1 text-[10px] font-medium text-slate-400"><Check className="h-3 w-3 text-blue-300" /> {creative.generatedBy === "fal.ai" ? copy("generatedByFal") : copy("generatedByFallback")}</span></div><h4 className="text-2xl font-semibold tracking-[-.045em] text-white">{creative.headline}</h4><p className="mt-3 text-sm leading-6 text-slate-400">{creative.body}</p><div className="mt-5 rounded-lg border border-blue-400/15 bg-blue-400/[.06] p-3"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-200">{copy("creativeBrief")}</p><p className="mt-2 text-xs leading-5 text-slate-400">{creative.prompt}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-white/7 bg-white/[.02] p-3"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-200"><Instagram className="h-3.5 w-3.5 text-pink-300" /> {copy("instagramReady")}</div><p className="line-clamp-4 text-xs leading-5 text-slate-400">{creative.instagramCaption}</p><button onClick={() => copyText(creative.instagramCaption, "captionCopied")} className="mt-3 text-[11px] font-semibold text-blue-200 hover:text-white"><Copy className="mr-1 inline h-3 w-3" /> {copy("copyCaption")}</button></div><div className="rounded-lg border border-white/7 bg-white/[.02] p-3"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-200"><AtSign className="h-3.5 w-3.5 text-sky-300" /> {copy("xReady")}</div><p className="line-clamp-4 text-xs leading-5 text-slate-400">{creative.xCaption}</p><button onClick={() => copyText(creative.xCaption, "postCopied")} className="mt-3 text-[11px] font-semibold text-blue-200 hover:text-white"><Copy className="mr-1 inline h-3 w-3" /> {copy("copyPost")}</button></div></div><button onClick={() => setNotice({ tone: "success", key: "approveCreativeNotice" })} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-3 text-xs font-bold text-slate-950 transition hover:bg-blue-50"><CircleCheck className="h-3.5 w-3.5" /> {copy("approvePublishing")}</button></> : <div className="flex h-full min-h-[340px] flex-col justify-center"><span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-blue-100"><TrendingUp className="h-3 w-3" /> {copy("readyToGenerate")}</span><h3 className="text-2xl font-semibold text-white">{primaryAnomaly?.campaignAngle ?? copy("socialProof")}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">{copy("recoveryStudioSub")}</p><button onClick={() => generateCreative("crisis")} className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-blue-400/25 bg-blue-400/10 px-3 py-2.5 text-xs font-semibold text-blue-100 hover:bg-blue-400/20"><Settings2 className="h-3.5 w-3.5" /> {copy("generateFirst")}</button></div>}</div></div></section>

          <footer className="mt-6 flex flex-col justify-between gap-2 border-t border-white/6 py-5 text-[11px] text-slate-600 sm:flex-row"><p>{copy("appFooter")}</p><p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> {copy("privacyNote")}</p></footer>
        </section>
      </div>

      {profileOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><div className="absolute inset-0" onClick={() => setProfileOpen(false)} aria-hidden="true" /><div role="dialog" aria-modal="true" aria-label={copy("profileDetails")} className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#101c2b] p-5 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-blue-300">{copy("profileDetails")}</p><h2 className="mt-2 text-xl font-semibold text-white">{user ? user.name : copy("guestWorkspace")}</h2></div><button onClick={() => setProfileOpen(false)} aria-label={copy("close")}><X className="h-5 w-5 text-slate-500 hover:text-white" /></button></div>{user ? <div className="mt-5 rounded-xl border border-white/8 bg-white/[.03] p-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-sm font-bold">{initialsForUser(user)}</div><div><p className="text-sm font-medium text-white">{user.name}</p><p className="text-xs text-slate-400">{user.email}</p></div></div><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{copy("workspace")}</span><span className="text-slate-300">BrandShield</span></div><button onClick={signOut} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"><LogOut className="h-3.5 w-3.5" /> {copy("signOut")}</button></div> : <AuthForm locale={locale} initialMode={authMode} configured={status.authConfigured} onAuthenticated={(nextUser) => { setUser(nextUser); setProfileOpen(false); setNotice({ tone: "success", key: "accountReady" }); }} />}</div></div>}
    </main>
  );
}
