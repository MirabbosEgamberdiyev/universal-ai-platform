"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { apiRequest } from "../../lib/api/apiClient";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  Send,
  Calendar,
  Share2,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Instagram,
  Youtube,
  Radio,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Check,
  Lock
} from "lucide-react";

interface KpiData {
  totalAudience: number;
  averageEngagementRate: number;
  connectedAccounts: number;
  activeChannels: number;
  scheduledPostsNext48h: number;
  unreadInboundConversations: number;
}

interface PublicationHistoryItem {
  jobId: string;
  contentId: string;
  title: string | null;
  bodyText: string | null;
  mediaUrls: string[];
  channelId: string;
  channelTitle: string;
  platform: string;
  status: string;
  platformPostId: string | null;
  postUrl: string | null;
  errorMessage: string | null;
  scheduledFor: string | null;
  publishedAt: string | null;
  sourceTimezone?: string;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [historyItems, setHistoryItems] = useState<PublicationHistoryItem[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiRes, histRes, accsRes] = await Promise.allSettled([
        apiRequest<KpiData>("/analytics/dashboard"),
        apiRequest<PublicationHistoryItem[]>("/publications/history"),
        apiRequest<any[]>("/accounts")
      ]);

      if (kpiRes.status === "fulfilled" && kpiRes.value) {
        setKpi(kpiRes.value);
      }
      if (histRes.status === "fulfilled" && Array.isArray(histRes.value)) {
        setHistoryItems(histRes.value);
      }
      if (accsRes.status === "fulfilled" && Array.isArray(accsRes.value)) {
        setAccounts(accsRes.value);
      }
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const scheduledList = historyItems
    .filter((i) => i.status === "SCHEDULED")
    .slice(0, 5);

  const publishedList = historyItems
    .filter((i) => i.status === "PUBLISHED" || i.status === "COMPLETED")
    .slice(0, 5);

  const renderPlatformBadge = (platform: string) => {
    const p = (platform || "").toUpperCase();
    if (p.includes("INSTAGRAM")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
          <Instagram className="w-3 h-3 text-pink-600" /> Instagram
        </span>
      );
    }
    if (p.includes("TELEGRAM")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <Send className="w-3 h-3 text-sky-500" /> Telegram
        </span>
      );
    }
    if (p.includes("YOUTUBE")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <Youtube className="w-3 h-3 text-rose-600" /> YouTube
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {platform}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Quick Action Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.dashboard.heroBadge}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {t.dashboard.welcomeTitle}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {t.dashboard.welcomeSubtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/create-post"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs md:text-sm transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 active:translate-y-px"
            >
              <Plus className="w-4 h-4" />
              <span>{t.dashboard.createPostBtn}</span>
            </Link>

            <Link
              href="/calendar"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs md:text-sm transition border border-slate-700 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.dashboard.calendarBtn}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics (Responsive & Semantic Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connected Accounts */}
        <Link
          href="/accounts"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 rounded-2xl p-5 transition group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t.dashboard.connectedAccounts}</span>
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {kpi?.connectedAccounts ?? accounts.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>{kpi?.activeChannels ?? 0} {t.dashboard.activeChannelsText}</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Scheduled Posts Next 48h */}
        <Link
          href="/calendar"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 rounded-2xl p-5 transition group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t.dashboard.scheduledPosts}</span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {scheduledList.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t.dashboard.scheduledNext48h}
          </div>
        </Link>

        {/* Published Posts */}
        <Link
          href="/published"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 rounded-2xl p-5 transition group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t.dashboard.publishedPosts}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {publishedList.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t.dashboard.publishedAll}
          </div>
        </Link>

        {/* Audience Reach */}
        <Link
          href="/analytics"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 rounded-2xl p-5 transition group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t.dashboard.totalAudience}</span>
            <TrendingUp className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {kpi?.totalAudience ? kpi.totalAudience.toLocaleString() : "0"}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {kpi?.averageEngagementRate ?? 0}% {t.dashboard.audienceActivity}
          </div>
        </Link>
      </div>

      {/* 3. Operational Grid: Scheduled Next 48h & Recently Published */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Posts */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <CardTitle>{t.dashboard.scheduledTitle}</CardTitle>
            </div>
            <Link
              href="/calendar"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>{t.common.viewAll}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>

          <CardContent>
            {scheduledList.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6 text-slate-400" />}
                title={t.dashboard.scheduledEmpty}
                description={t.dashboard.welcomeSubtitle}
                action={
                  <Link
                    href="/create-post"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.dashboard.planPostBtn}</span>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {scheduledList.map((item) => (
                  <div
                    key={item.jobId}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-start justify-between gap-3 hover:border-slate-200 dark:hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {renderPlatformBadge(item.platform)}
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {item.channelTitle}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {item.title || item.bodyText}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {item.scheduledFor ? new Date(item.scheduledFor).toLocaleString() : "Rejalashtirilgan"}
                        </span>
                        {item.sourceTimezone && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[9px]">
                            {item.sourceTimezone}
                          </span>
                        )}
                      </p>
                    </div>

                    <Badge variant="warning" size="sm">
                      SCHEDULED
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Published Posts */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <CardTitle>{t.dashboard.recentPublishedTitle}</CardTitle>
            </div>
            <Link
              href="/published"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>{t.common.viewAll}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>

          <CardContent>
            {publishedList.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-6 h-6 text-slate-400" />}
                title={t.dashboard.recentEmpty}
                description={t.dashboard.welcomeSubtitle}
                action={
                  <Link
                    href="/create-post"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.dashboard.createFirstPostBtn}</span>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {publishedList.map((item) => (
                  <div
                    key={item.jobId}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-start justify-between gap-3 hover:border-slate-200 dark:hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {renderPlatformBadge(item.platform)}
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {item.channelTitle}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {item.title || item.bodyText}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-400">
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "Yaqinda e'lon qilingan"}
                        </span>
                        {item.postUrl && (
                          <a
                            href={item.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span>Havolani ochish</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <Badge variant="success" size="sm">
                      PUBLISHED
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Integration Status & Hardware Security Banner */}
      <Card variant="default">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.dashboard.securityTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.dashboard.securitySubtitle}
                </p>
              </div>
            </div>

            <Link
              href="/accounts"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <span>{t.dashboard.manageAccountsBtn}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Integration Status Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
            {/* Instagram */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5">
              <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Instagram</p>
                <p className="text-[10px] text-slate-500 truncate">Meta Graph API</p>
              </div>
            </div>

            {/* Telegram */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5">
              <Send className="w-4 h-4 text-sky-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Telegram</p>
                <p className="text-[10px] text-slate-500 truncate">Bot API v7.2</p>
              </div>
            </div>

            {/* YouTube */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5">
              <Youtube className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">YouTube</p>
                <p className="text-[10px] text-slate-500 truncate">Data API v3</p>
              </div>
            </div>

            {/* TikTok */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5 opacity-80">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">TikTok</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">Approval Pending</p>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5 opacity-80">
              <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">LinkedIn</p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">Partner Gated</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
