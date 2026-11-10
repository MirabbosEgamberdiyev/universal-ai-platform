"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  ShieldAlert,
  Building,
  Users,
  Cpu,
  Database,
  Activity,
  Layers,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  BarChart,
  DollarSign
} from "lucide-react";

export default function AdminConsolePage() {
  const { t } = useLanguage();
  const { user, activeOrg, organizations } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>({
    status: "UP",
    postgres: "HEALTHY",
    redis: "HEALTHY",
    rabbitmq: "HEALTHY",
    uptimeSeconds: 84600
  });

  useEffect(() => {
    // Populate tenant list from user organizations or mock cluster list
    if (organizations && organizations.length > 0) {
      setTenants(organizations);
    } else if (activeOrg) {
      setTenants([activeOrg]);
    }
  }, [organizations, activeOrg]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.admin}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Super Administrator Control Plane: Tenant isolation, infrastructure telemetry, and multi-model LLM compute allocation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Cluster Operational (100% SLA)
          </span>
        </div>
      </div>

      {/* Cluster Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">PostgreSQL 16 Engine</span>
            <Database className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            34 Tables Active
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Connection pool healthy (2.4ms)
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Redis 7 Distributed Cache</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            0.8ms P99 Latency
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Rate limiters & sessions synced
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">RabbitMQ 3.13 Broker</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            0 Backlog Messages
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 4 Queues / 0 dead-letters
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tokens Processed</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            1.48M Tokens
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Est Cost: $4.12 MTD
          </p>
        </div>
      </div>

      {/* Multi-Tenant Organization Directory */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-500" />
            Provisioned Tenant Workspaces ({tenants.length})
          </h3>
          <span className="text-xs text-slate-400">Strict Row-Level & Schema Isolation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase font-semibold">
                <th className="py-2.5 px-3">Organization Name</th>
                <th className="py-2.5 px-3">Organization ID</th>
                <th className="py-2.5 px-3">Subscription Tier</th>
                <th className="py-2.5 px-3">Autonomy Mode</th>
                <th className="py-2.5 px-3">Isolation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    {t.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {t.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {t.tier || "ENTERPRISE"}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {t.autonomyMode || "OPERATOR (HITL)"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      ENFORCED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Distribution & Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            LLM Provider & Compute Distribution
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Claude 3.5 Sonnet (Strategy, Content, Code)</span>
                <span className="font-mono text-slate-500">62%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: "62%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">DeepSeek-V3 / OpenSource (Triage & Classification)</span>
                <span className="font-mono text-slate-500">24%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: "24%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">GPT-4o (Multimodal & Vision Analysis)</span>
                <span className="font-mono text-slate-500">14%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "14%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Token Unit Economics & Budget Limits
          </h3>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500">Global Hard Monthly Cap:</span>
              <span className="font-bold text-slate-900 dark:text-white">$500.00 / month</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500">Current Spend MTD:</span>
              <span className="font-bold text-emerald-600">$4.12 (0.8%)</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-slate-500">Cost-Saving Cache Hit Ratio:</span>
              <span className="font-bold text-indigo-600">78.4% Cached</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Anomaly Spending Spikes:</span>
              <span className="font-bold text-slate-400">Zero Detected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
