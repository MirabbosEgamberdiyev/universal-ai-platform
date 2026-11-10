"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { BRAND } from "../../lib/brand";
import { ThemeToggle } from "../ui/ThemeToggle";
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  Share2,
  Image,
  History,
  BarChart3,
  Settings,
  LogOut,
  Globe,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Bell,
  PlusCircle,
  ExternalLink
} from "lucide-react";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // If user is on public landing or auth pages, don't show the dashboard shell
  const isAuthPage = ["/", "/login", "/register", "/forgot-password", "/verify-email", "/reset-password"].includes(pathname);
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Complete 10-item navigation strictly matching enterprise social media specification
  const primaryNavItems = [
    { label: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { label: t.nav.createPost, href: "/create-post", icon: PenTool, badge: "Create" },
    { label: t.nav.calendar, href: "/calendar", icon: Calendar },
    { label: t.nav.accounts, href: "/accounts", icon: Share2 },
    { label: t.nav.media, href: "/media", icon: Image },
    { label: t.nav.published, href: "/published", icon: History },
    { label: t.nav.analytics, href: "/analytics", icon: BarChart3 },
    { label: t.nav.assistant, href: "/assistant", icon: Sparkles },
    { label: t.nav.notifications, href: "/notifications", icon: Bell },
    { label: t.nav.settings, href: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white tracking-tight leading-none text-base">
              {BRAND.shortName}
            </h1>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Social Media Hub
            </span>
          </div>
        </div>

        {/* Quick Action: Create Post CTA Button */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60">
          <Link
            href="/create-post"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all group active:translate-y-px"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>{t.nav.createPost}</span>
          </Link>
        </div>

        {/* Main 10-Item Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold shadow-xs border border-indigo-200/60 dark:border-indigo-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User bar & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.fullName || "Admin"}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title={t.common.logout}
            aria-label={t.common.logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-72 bg-white dark:bg-slate-900 z-50 border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h1 className="font-bold text-slate-900 dark:text-white text-sm">{BRAND.name}</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3">
              <Link
                href="/create-post"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.nav.createPost}</span>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      active
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.fullName || "User"}</span>
              <button onClick={handleLogout} aria-label={t.common.logout} className="p-1.5 text-rose-600"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {primaryNavItems.find((n) => n.href === pathname)?.label || BRAND.name}
            </h2>
          </div>

          {/* Right Header: Theme Toggle & Language Selector & Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/create-post"
              className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.nav.createPost}</span>
            </Link>

            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="uppercase font-semibold">{language.replace("uz-Latn", "uzl").replace("uz-Cyrl", "uzc")}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50">
                  <button
                    onClick={() => { setLanguage("uzl"); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${language === "uzl" || language === "uz-Latn" ? "font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    🇺🇿 O'zbekcha (Lotin)
                  </button>
                  <button
                    onClick={() => { setLanguage("uzc"); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${language === "uzc" || language === "uz-Cyrl" ? "font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    🇺🇿 Ўзбекча (Кирилл)
                  </button>
                  <button
                    onClick={() => { setLanguage("ru"); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${language === "ru" ? "font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    🇷🇺 Русский
                  </button>
                  <button
                    onClick={() => { setLanguage("en"); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${language === "en" ? "font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    🇬🇧 English (US)
                  </button>
                </div>
              )}
            </div>

            <Link
              href="/accounts"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title={t.nav.accounts}
              aria-label={t.nav.accounts}
            >
              <Share2 className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
