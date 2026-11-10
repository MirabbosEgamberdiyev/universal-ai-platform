"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink, 
  Send, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Twitter, 
  Video,
  Info
} from "lucide-react";
import Link from "next/link";

interface IntegrationPlatform {
  id: string;
  name: string;
  category: "Social Network" | "Messaging" | "Video Platform";
  status: "ACTIVE" | "BETA" | "SANDBOX" | "RESTRICTED";
  authMethod: string;
  capabilities: {
    singlePost: boolean;
    carousel: boolean;
    videoReels: boolean;
    inboxReplies: boolean;
    analytics: boolean;
    webhooks: boolean;
  };
  rateLimit: string;
  documentationUrl: string;
  note: string;
}

export default function IntegrationsPage() {
  const { t, language } = useLanguage();
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const platforms: IntegrationPlatform[] = [
    {
      id: "telegram",
      name: "Telegram Bot & Channels",
      category: "Messaging",
      status: "ACTIVE",
      authMethod: "Bot Token (MTProto Userbots Strictly Disallowed)",
      capabilities: {
        singlePost: true,
        carousel: true,
        videoReels: true,
        inboxReplies: true,
        analytics: true,
        webhooks: true,
      },
      rateLimit: "30 messages/sec globally; 1 msg/sec per group",
      documentationUrl: "https://core.telegram.org/bots/api",
      note: "Full broadcast channel dispatch, media groups up to 10 items, inline keyboard buttons, two-way webhook ingestion."
    },
    {
      id: "instagram",
      name: "Instagram Professional",
      category: "Social Network",
      status: "ACTIVE",
      authMethod: "Meta Graph API v19.0 (OAuth 2.0)",
      capabilities: {
        singlePost: true,
        carousel: true,
        videoReels: true,
        inboxReplies: true,
        analytics: true,
        webhooks: true,
      },
      rateLimit: "25-50 API posts/day per connected account",
      documentationUrl: "https://developers.facebook.com/docs/instagram-api",
      note: "Requires Business/Creator account connected to a Facebook Page. Two-step media container initialization + publish protocol."
    },
    {
      id: "facebook",
      name: "Facebook Pages",
      category: "Social Network",
      status: "ACTIVE",
      authMethod: "Meta Graph API v19.0 (Page Access Token)",
      capabilities: {
        singlePost: true,
        carousel: true,
        videoReels: true,
        inboxReplies: true,
        analytics: true,
        webhooks: true,
      },
      rateLimit: "200 calls/hour per user",
      documentationUrl: "https://developers.facebook.com/docs/pages-api",
      note: "Full feed posting, scheduled publishing, page insights, and direct messenger conversation management."
    },
    {
      id: "linkedin",
      name: "LinkedIn Pages & Profiles",
      category: "Social Network",
      status: "ACTIVE",
      authMethod: "LinkedIn Community Management API (OAuth 2.0 PKCE)",
      capabilities: {
        singlePost: true,
        carousel: true,
        videoReels: true,
        inboxReplies: false,
        analytics: true,
        webhooks: true,
      },
      rateLimit: "100 shares/day per organization",
      documentationUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/",
      note: "Supports text posts, multi-image carousels, video uploads via 3-step asset registration protocol."
    },
    {
      id: "tiktok",
      name: "TikTok for Business",
      category: "Video Platform",
      status: "BETA",
      authMethod: "TikTok Content Posting API (OAuth 2.0)",
      capabilities: {
        singlePost: false,
        carousel: false,
        videoReels: true,
        inboxReplies: false,
        analytics: true,
        webhooks: true,
      },
      rateLimit: "Direct video share quota governed by app tier",
      documentationUrl: "https://developers.tiktok.com/doc/content-posting-api-get-started",
      note: "Direct post mode or creator inbox draft notification mode based on account permissions."
    },
    {
      id: "youtube",
      name: "YouTube & Shorts",
      category: "Video Platform",
      status: "BETA",
      authMethod: "Google OAuth 2.0 (YouTube Data API v3)",
      capabilities: {
        singlePost: false,
        carousel: false,
        videoReels: true,
        inboxReplies: true,
        analytics: true,
        webhooks: false,
      },
      rateLimit: "10,000 units/day default quota (video upload costs 1,600 units)",
      documentationUrl: "https://developers.google.com/youtube/v3",
      note: "Supports YouTube Shorts and long-form video uploads with resumable upload protocol and scheduled premiere."
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      category: "Social Network",
      status: "BETA",
      authMethod: "X API v2 (OAuth 2.0 PKCE)",
      capabilities: {
        singlePost: true,
        carousel: true,
        videoReels: true,
        inboxReplies: true,
        analytics: true,
        webhooks: true,
      },
      rateLimit: "Tier-dependent (Free / Basic / Pro tier restrictions)",
      documentationUrl: "https://developer.x.com/en/docs/x-api",
      note: "Full tweet creation, media upload chunking via v1.1 endpoint, and direct message webhooks."
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business Cloud API",
      category: "Messaging",
      status: "ACTIVE",
      authMethod: "Meta WhatsApp Cloud API (System User Token)",
      capabilities: {
        singlePost: false,
        carousel: false,
        videoReels: false,
        inboxReplies: true,
        analytics: true,
        webhooks: true,
      },
      rateLimit: "Tier-based messaging limit (1,000 to 100,000 conversations/24h)",
      documentationUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
      note: "Pre-approved utility/marketing templates outside 24h customer care window; interactive buttons and live agent handoff."
    }
  ];

  const getStatusBadge = (status: IntegrationPlatform["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
      case "BETA":
        return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300";
      case "SANDBOX":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
      case "RESTRICTED":
        return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const filteredPlatforms = platforms.filter((p) => {
    if (filterCategory === "ALL") return true;
    return p.category === filterCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-600" />
            <span>
              {language === "uz-Latn" ? "Rasmiy Platformalar va API Integratsiya Matritsasi" : language === "ru" ? "Матрица интеграций и возможностей платформ" : "Official Platform Capability Directory"}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === "uz-Latn"
              ? "Barcha rasmiy API kvotalari, ruxsatnomalari va qo'llab-quvvatlanuvchi funksiyalar"
              : language === "ru"
              ? "Точные лимиты API, квоты и поддерживаемые протоколы для всех интегрированных сетей"
              : "Detailed transparency matrix for all supported social networks, messaging gateways, and video endpoints"}
          </p>
        </div>

        <Link
          href="/accounts"
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
        >
          <span>{language === "uz-Latn" ? "Hisoblarni ulash" : language === "ru" ? "Подключить аккаунт" : "Connect Accounts"}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Strict Compliance Banner */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-white">Strict Official API Policy: </span>
          OmniAgent operates exclusively through documented, officially sanctioned public APIs. We do not use unauthorized reverse-engineered endpoints, unofficial headless scrapers, or MTProto userbot sessions. Your accounts remain safe from automated platform bans.
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2">
        {["ALL", "Social Network", "Messaging", "Video Platform"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterCategory === cat
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {cat === "ALL" ? (language === "uz-Latn" ? "Barcha turlar" : language === "ru" ? "Все типы" : "All Categories") : cat}
          </button>
        ))}
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlatforms.map((platform) => (
          <div
            key={platform.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 hover:border-indigo-200 dark:hover:border-indigo-900 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{platform.name}</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{platform.category}</span>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusBadge(platform.status)}`}>
                  {platform.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p><span className="font-semibold text-slate-800 dark:text-slate-200">Auth Method:</span> {platform.authMethod}</p>
                <p><span className="font-semibold text-slate-800 dark:text-slate-200">Rate Limits:</span> {platform.rateLimit}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {platform.note}
                </p>
              </div>

              {/* Capabilities checklist */}
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Supported Features</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  {Object.entries(platform.capabilities).map(([cap, supported]) => (
                    <div
                      key={cap}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded ${
                        supported
                          ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "text-slate-400 dark:text-slate-600 line-through bg-slate-50/50 dark:bg-slate-900/50"
                      }`}
                    >
                      {supported ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <span className="w-3 h-3 text-slate-400">×</span>}
                      <span className="capitalize">{cap.replace(/([A-Z])/g, " $1")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <a
                href={platform.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Official API Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <Link
                href="/accounts"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
              >
                Connect Platform
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
