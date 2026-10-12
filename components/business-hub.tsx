"use client";

import { Building2, Check, ExternalLink, Instagram, Link2, MapPin, Plus, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Business } from "@/lib/types";

type Props = { locale: Locale; authenticated: boolean; onAnalyze: (url: string, businessId: string) => void };

type FormState = { name: string; mapsUrl: string; sikayetvarUrl: string; instagramUrl: string; websiteUrl: string };
const emptyForm: FormState = { name: "", mapsUrl: "", sikayetvarUrl: "", instagramUrl: "", websiteUrl: "" };

export function BusinessHub({ locale, authenticated, onAnalyze }: Props) {
  const tr = locale === "tr";
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadBusinesses() {
    try {
      const response = await fetch("/api/businesses", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as { businesses?: Business[] };
        setBusinesses(data.businesses ?? []);
      }
    } catch {
      setNotice(tr ? "İşletmeler yüklenemedi." : "Businesses could not be loaded.");
    }
  }

  useEffect(() => { void loadBusinesses(); }, []);

  async function create() {
    if (!form.name.trim()) {
      setNotice(tr ? "İşletme adı gerekli." : "Business name is required.");
      return;
    }
    if (!authenticated) {
      setNotice(tr ? "Kaydetmek için önce profil menüsünden giriş yap." : "Sign in from Profile before saving.");
      return;
    }
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/businesses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = (await response.json()) as { business?: Business; error?: string };
      if (!response.ok || !data.business) throw new Error(data.error || "save_failed");
      setBusinesses((current) => [data.business!, ...current]);
      setForm(emptyForm);
      setOpen(false);
      setNotice(tr ? "İşletme kaydedildi." : "Business saved.");
    } catch (error) {
      setNotice(error instanceof Error && error.message !== "save_failed" ? error.message : tr ? "İşletme kaydedilemedi." : "Business could not be saved.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-white/8 bg-[#0c1826] p-4 shadow-[0_18px_45px_rgba(0,0,0,.12)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-blue-400/20 bg-blue-400/10 text-blue-200"><Building2 className="h-5 w-5" /></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-300">{tr ? "İŞLETME PORTFÖYÜ" : "BUSINESS PORTFOLIO"}</p><h2 className="mt-1 text-lg font-semibold text-white">{tr ? "Markalarını tek çalışma alanında tut." : "Keep every business in one workspace."}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">{tr ? "Maps dışından işletme ekle; Google Maps, Şikayetvar, Instagram ve web adreslerini ayrı bağla." : "Add a business directly and keep Google Maps, Şikayetvar, Instagram and website links connected."}</p></div>
        </div>
        <div className="flex shrink-0 items-center gap-2"><button onClick={() => void loadBusinesses()} aria-label={tr ? "İşletmeleri yenile" : "Refresh businesses"} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[.03] text-slate-400 hover:text-white"><RefreshCw className="h-3.5 w-3.5" /></button><button onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-400">{open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{tr ? "İşletme ekle" : "Add business"}</button></div>
      </div>
      {notice && <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-400/15 bg-blue-400/8 px-3 py-2 text-xs text-blue-100"><Check className="h-3.5 w-3.5" />{notice}</div>}
      {open && <div className="mt-4 rounded-lg border border-white/8 bg-[#08111d] p-4"><div className="grid gap-3 md:grid-cols-2"><label className="text-xs text-slate-400">{tr ? "İşletme adı *" : "Business name *"}<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={tr ? "Örn. Yakamoz Coffee" : "e.g. Yakamoz Coffee"} className="mt-1 w-full rounded-lg border border-white/10 bg-white/[.03] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50" /></label><label className="text-xs text-slate-400"><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />Google Maps URL</span><input value={form.mapsUrl} onChange={(event) => setForm({ ...form, mapsUrl: event.target.value })} placeholder="maps.app.goo.gl/..." className="mt-1 w-full rounded-lg border border-white/10 bg-white/[.03] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50" /></label><label className="text-xs text-slate-400"><span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3" />Şikayetvar URL</span><input value={form.sikayetvarUrl} onChange={(event) => setForm({ ...form, sikayetvarUrl: event.target.value })} placeholder="sikayetvar.com/..." className="mt-1 w-full rounded-lg border border-white/10 bg-white/[.03] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50" /></label><label className="text-xs text-slate-400"><span className="inline-flex items-center gap-1"><Instagram className="h-3 w-3" />Instagram URL</span><input value={form.instagramUrl} onChange={(event) => setForm({ ...form, instagramUrl: event.target.value })} placeholder="instagram.com/..." className="mt-1 w-full rounded-lg border border-white/10 bg-white/[.03] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50" /></label><label className="text-xs text-slate-400 md:col-span-2">Website URL<input value={form.websiteUrl} onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg border border-white/10 bg-white/[.03] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50" /></label></div><div className="mt-4 flex justify-end"><button disabled={loading} onClick={() => void create()} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs font-bold text-slate-950 hover:bg-blue-50 disabled:opacity-60">{loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}<Check className="h-3.5 w-3.5" />{tr ? "İşletmeyi kaydet" : "Save business"}</button></div></div>}
      {businesses.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{businesses.map((business) => <article key={business.id} className="rounded-lg border border-white/8 bg-white/[.025] p-3"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-white">{business.name}</h3><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-slate-600">{business.slug}</p></div><Building2 className="h-4 w-4 text-blue-300" /></div><div className="mt-3 flex flex-wrap gap-2">{business.mapsUrl && <button onClick={() => onAnalyze(business.mapsUrl, business.id)} className="inline-flex items-center gap-1.5 rounded-md border border-blue-400/20 bg-blue-400/10 px-2 py-1.5 text-[10px] font-semibold text-blue-100"><MapPin className="h-3 w-3" />{tr ? "Maps analiz et" : "Analyze Maps"}</button>}{business.sikayetvarUrl && <a href={business.sikayetvarUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-white/8 px-2 py-1.5 text-[10px] text-slate-400 hover:text-white"><ExternalLink className="h-3 w-3" />Şikayetvar</a>}{business.instagramUrl && <a href={business.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-white/8 px-2 py-1.5 text-[10px] text-slate-400 hover:text-white"><Instagram className="h-3 w-3" />Instagram</a>}{business.websiteUrl && <a href={business.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-white/8 px-2 py-1.5 text-[10px] text-slate-400 hover:text-white"><ExternalLink className="h-3 w-3" />Web</a>}</div></article>)}</div>}
    </section>
  );
}
