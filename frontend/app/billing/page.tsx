"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { CreditCard, Check, Zap, ExternalLink } from "lucide-react";

export default function BillingPage() {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState("STRIPE");

  useEffect(() => {
    apiRequest<any[]>("/billing/plans").then(setPlans).catch(console.error);
    apiRequest<any>("/billing/status").then(setStatus).catch(console.error);
  }, []);

  const handleCheckout = async (planCode: string) => {
    try {
      const res = await apiRequest<any>("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ planCode, provider: selectedProvider }),
      });
      if (res.checkoutUrl) {
        window.open(res.checkoutUrl, "_blank");
      }
    } catch (e: any) {
      alert("Checkout error: " + (e?.detail || e?.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.billing}</h1>
          <p className="text-xs text-slate-500">Flexible SaaS subscription tiers, resource quotas, and multi-gateway checkout.</p>
        </div>

        {/* Gateway Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Checkout Gateway:</span>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs"
          >
            <option value="STRIPE">Stripe (Global USD)</option>
            <option value="PAYME">Payme Business (UZS)</option>
            <option value="CLICK">Click Merchant (UZS)</option>
          </select>
        </div>
      </div>

      {/* Usage Meter Card */}
      {status && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Current Plan:</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">{status.currentTier}</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {status.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">AI Tokens Consumed</span>
                <span className="font-bold">{status.tokensUsedThisMonth.toLocaleString()} / {status.monthlyTokenQuota.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (status.tokensUsedThisMonth / status.monthlyTokenQuota) * 100)}%` }}
                  className="bg-indigo-600 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Posts Published</span>
                <span className="font-bold">{status.postsPublishedThisMonth} / {status.monthlyPostQuota}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (status.postsPublishedThisMonth / status.monthlyPostQuota) * 100)}%` }}
                  className="bg-purple-600 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = status?.currentTier === p.code;
          return (
            <div
              key={p.code}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border flex flex-col justify-between space-y-6 shadow-sm ${
                p.code === "PRO" ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div>
                {p.code === "PRO" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                    Most Popular
                  </span>
                )}
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${p.monthlyPrice}</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  {p.features?.map((f: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCheckout(p.code)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                    : p.code === "PRO"
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                }`}
              >
                {isCurrent ? "Active Plan" : `Upgrade via ${selectedProvider}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
