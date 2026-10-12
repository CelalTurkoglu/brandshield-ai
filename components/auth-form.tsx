"use client";

import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { AuthUser } from "@/lib/auth";

type AuthMode = "login" | "register";

type Props = {
  locale: Locale;
  initialMode?: AuthMode;
  configured: boolean;
  onAuthenticated: (user: AuthUser) => void;
};

export function AuthForm({ locale, initialMode = "login", configured, onAuthenticated }: Props) {
  const tr = locale === "tr";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json() as { user?: AuthUser; error?: string };
      if (!response.ok || !data.user) throw new Error(data.error || (tr ? "Giriş yapılamadı." : "Authentication failed."));
      onAuthenticated(data.user);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : tr ? "Giriş yapılamadı." : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return <div className="mt-5 rounded-lg border border-amber-300/15 bg-amber-300/8 p-3 text-xs leading-5 text-amber-100">{tr ? "Yerel auth yapılandırması eksik. BRANDSHIELD_JWT_SECRET ve managed database bağlantısını yayın ortamında ekleyin." : "Local auth is not configured. Add BRANDSHIELD_JWT_SECRET and the managed database connection in the publish environment."}</div>;
  }

  return (
    <div className="mt-5">
      <div className="mb-4 grid grid-cols-2 rounded-lg border border-white/8 bg-white/[.03] p-1 text-xs font-semibold">
        <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`rounded-md px-3 py-2 ${mode === "login" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}>{tr ? "Giriş yap" : "Sign in"}</button>
        <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`rounded-md px-3 py-2 ${mode === "register" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}>{tr ? "Hesap oluştur" : "Create account"}</button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && <label className="block text-xs text-slate-400">{tr ? "Ad soyad" : "Full name"}<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-1 w-full rounded-lg border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50" placeholder={tr ? "Adınız Soyadınız" : "Your name"} /></label>}
        <label className="block text-xs text-slate-400">E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-1 w-full rounded-lg border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50" placeholder="you@company.com" /></label>
        <label className="block text-xs text-slate-400">{tr ? "Şifre" : "Password"}<input required minLength={8} maxLength={128} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-1 w-full rounded-lg border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/50" placeholder={tr ? "En az 8 karakter" : "At least 8 characters"} /></label>
        {error && <p className="rounded-lg border border-rose-400/20 bg-rose-400/8 px-3 py-2 text-xs leading-5 text-rose-100">{error}</p>}
        <button disabled={busy} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-3 text-sm font-bold text-white hover:bg-blue-400 disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{mode === "login" ? (tr ? "Giriş yap" : "Sign in") : (tr ? "Hesap oluştur" : "Create account")}</button>
      </form>
      <p className="mt-4 text-[11px] leading-5 text-slate-500">{tr ? "Hesabınız BrandShield veritabanında güvenli şekilde saklanır." : "Your account is stored securely in BrandShield’s database."}</p>
    </div>
  );
}
