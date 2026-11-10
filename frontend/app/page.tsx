"use client";

import React from "react";
import Link from "next/link";
import { BRAND } from "../lib/brand";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { LanguageSelector } from "../components/ui/LanguageSelector";
import { 
  Sparkles, 
  Send, 
  Instagram, 
  Youtube, 
  Calendar, 
  Image as ImageIcon, 
  ShieldCheck, 
  ArrowRight, 
  Layers
} from "lucide-react";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white block leading-tight">
                {BRAND.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Social Media Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              {t.landing.navFeatures}
            </a>
            <a href="#platforms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              {t.landing.navPlatforms}
            </a>
            <a href="#security" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              {t.landing.navSecurity}
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Switcher */}
            <ThemeToggle />

            <Link
              href="/login"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t.auth.loginBtn}
            </Link>

            <Link
              href="/register"
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-sm shadow-indigo-600/25 transition flex items-center gap-1.5 active:translate-y-px"
            >
              <span>{t.auth.registerBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{t.landing.heroBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
          {t.landing.heroTitle1} <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t.landing.heroTitle2}
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.landing.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs md:text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 active:translate-y-px"
          >
            <span>{t.landing.goToDashboard}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/create-post"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs md:text-sm transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{t.landing.createFirstPost}</span>
          </Link>
        </div>
      </section>

      {/* 3. Core Platforms Section */}
      <section id="platforms" className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.landing.platformsTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            {t.landing.platformsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instagram */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-pink-300 dark:hover:border-pink-800 transition">
            <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center mb-4 border border-pink-200 dark:border-pink-800">
              <Instagram className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.accounts.instagramTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t.accounts.instagramDesc}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-pink-600 dark:text-pink-400">
              ✓ Meta Graph API v19.0
            </div>
          </div>

          {/* Telegram */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-800 transition">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center mb-4 border border-sky-200 dark:border-sky-800">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.accounts.telegramTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t.accounts.telegramDesc}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              ✓ Bot API v7.2 & Channels
            </div>
          </div>

          {/* YouTube */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-800 transition">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800">
              <Youtube className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.accounts.youtubeTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t.accounts.youtubeDesc}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              ✓ Resumable Video & Shorts
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Feature Grid */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.landing.featuresTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            {t.landing.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Post Composer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Bir marta yozing va barcha tarmoqlarga moslashtirilgan holda bitta tugma bilan yuboring.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Scheduler</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Postlarni aniq kun va soatga rejalashtiring. Vaqt mintaqasi avtomatik moslashadi.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gemini & Claude AI</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Google Gemini va Anthropic Claude orqali yuqori sifatli postlar, sarlavha va heshteglar yarating.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Media Library</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Rasmlar va videolarni xavfsiz boshqarish, bayt tekshiruvi va bir zumda postlarga biriktirish.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Security & Token Vault Section */}
      <section id="security" className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.landing.securityBadge}</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              {t.landing.securityTitle}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {t.landing.securitySubtitle}
            </p>
          </div>

          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs md:text-sm transition shadow-lg shrink-0"
          >
            {t.landing.createAccountCta} &rarr;
          </Link>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{BRAND.copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-indigo-600 transition">{t.auth.loginBtn}</Link>
            <Link href="/register" className="hover:text-indigo-600 transition">{t.auth.registerBtn}</Link>
            <Link href="/dashboard" className="hover:text-indigo-600 transition">{t.nav.dashboard}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
