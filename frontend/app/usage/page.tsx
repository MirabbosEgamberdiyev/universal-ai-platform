"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  DollarSign,
  Cpu,
  BarChart3,
  TrendingDown,
  Layers,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
  HardDrive
} from "lucide-react";

export default function UsagePage() {
  const { t } = useLanguage();
  const { activeOrg } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("CURRENT_BILLING_CYCLE");
  const [notification, setNotification] = useState<string | null>(null);

  const modelUsage = [
    {
      model: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      role: "Strategic Planning, Content & Code",
      tokens: 920000,
      cost: "$2.76",
      percentage: 62,
      color: "bg-indigo-600"
    },
    {
      model: "DeepSeek-V3 (OpenSource)",
      provider: "Self-Hosted / Fast Inference",
      role: "Email Classification, Task Triage",
      tokens: 355000,
      cost: "$0.36",
      percentage: 24,
      color: "bg-purple-600"
    },
    {
      model: "GPT-4o",
      provider: "OpenAI",
      role: "Multimodal Vision & Media Prompts",
      tokens: 205000,
      cost: "$1.02",
      percentage: 14,
      color: "bg-emerald-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.usage}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time LLM compute accounting: Token burn velocity, multi-model cost distribution, and budget cap enforcement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["CURRENT_BILLING_CYCLE", "LAST_30_DAYS", "YEAR_TO_DATE"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPeriod === period
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {period.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Spend MTD</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            $4.14
          </div>
          <p className="text-[11px] text-slate-500">
            Hard Monthly Cap: <strong className="text-slate-700 dark:text-slate-300">$500.00</strong> (0.8% used)
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tokens Processed</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            1,480,000
          </div>
          <p className="text-[11px] text-slate-500">
            Prompt: 1.1M | Completion: 380K
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kesh orqali tejash</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            78.4%
          </div>
          <p className="text-[11px] text-slate-500">
            Saved approx. $14.20 via Redis RAG cache
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Budget Cap Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            Optimal (No Alerts)
          </div>
          <p className="text-[11px] text-slate-500">
            Alert trigger set at 80% ($400.00)
          </p>
        </div>
      </div>

      {/* Model Breakdown & Spend Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          Model Distribution & Compute Allocation
        </h3>

        <div className="space-y-4">
          {modelUsage.map((m, idx) => (
            <div key={idx} className="space-y-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{m.model}</span>
                  <span className="text-slate-400 ml-2">({m.provider})</span>
                  <p className="text-[11px] text-slate-500">{m.role}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 dark:text-white">{m.cost}</span>
                  <p className="text-[10px] text-slate-400 font-mono">{(m.tokens / 1000).toLocaleString()}k tokens ({m.percentage}%)</p>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Spend by Workstream
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Content Studio & Social Media Copy</span>
              <span className="font-bold text-slate-900 dark:text-white">$1.82 (44%)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Semantic RAG & Knowledge Synthesis</span>
              <span className="font-bold text-slate-900 dark:text-white">$1.15 (28%)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Email Triage & Draft Responses</span>
              <span className="font-bold text-slate-900 dark:text-white">$0.68 (16%)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Meeting Intelligence & Transcripts</span>
              <span className="font-bold text-slate-900 dark:text-white">$0.49 (12%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Cost Optimization Recommendations
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>DeepSeek-V3 is successfully handling 100% of routine email and document classification, cutting token spend by 82%.</span>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>Prompt token caching is active in Redis 7 on port 6389 with sub-millisecond response latency.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
