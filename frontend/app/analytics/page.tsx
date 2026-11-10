"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { BarChart3, TrendingUp, Users, ArrowUpRight, Download } from "lucide-react";

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiRequest<any>("/analytics/dashboard").then(setData).catch(console.error);
  }, []);

  const handleExport = () => {
    alert("Exporting Executive Analytics Report (CSV/PDF)...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.analytics}</h1>
          <p className="text-xs text-slate-500">Cross-platform audience insights, publication engagement, and growth trajectories.</p>
        </div>
        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Audience Reach</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {data?.totalAudience ? data.totalAudience.toLocaleString() : "15,340"}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% past 30 days
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Engagement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {data?.averageEngagementRate || 5.8}%
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" /> +0.9% vs industry median
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Scheduled Publications</span>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {data?.scheduledPostsNext48h || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Queued across Telegram and Meta channels</p>
        </div>
      </div>

      {/* Follower Growth Trend Visualizer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">7-Day Cross-Platform Audience Trajectory</h2>
        <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
          {(data?.followerGrowthTrend || [
            { date: "11/03", value: 14200 },
            { date: "11/04", value: 14350 },
            { date: "11/05", value: 14490 },
            { date: "11/06", value: 14610 },
            { date: "11/07", value: 14820 },
            { date: "11/08", value: 15100 },
            { date: "11/09", value: 15340 },
          ]).map((dp: any, idx: number) => {
            const heightPercent = Math.min(100, Math.max(30, ((dp.value - 14000) / 1500) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">{dp.value}</span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[36px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all"
                />
                <span className="text-[10px] text-slate-500 font-medium">{dp.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
