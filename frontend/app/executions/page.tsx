"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { History, Sparkles, DollarSign, Cpu, CheckCircle } from "lucide-react";

export default function ExecutionsPage() {
  const { t } = useLanguage();
  const [executions, setExecutions] = useState<any[]>([]);

  useEffect(() => {
    apiRequest<any[]>("/agent/executions").then(setExecutions).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.executions}</h1>
        <p className="text-xs text-slate-500">Immutable ledger of natural language instructions, parsed plans, token metering, and costs.</p>
      </div>

      <div className="space-y-3">
        {executions.map((ex) => (
          <div key={ex.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {ex.detectedIntent}
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  ID: {ex.id.substring(0, 8)}...
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {ex.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
              <p className="font-semibold text-slate-500 text-[10px] mb-1">User Instruction:</p>
              <p className="text-slate-800 dark:text-slate-200 italic">"{ex.promptText}"</p>
            </div>

            <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-28 overflow-y-auto">
              {ex.executionPlan}
            </pre>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" /> {ex.tokensConsumed} tokens
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Est: ${Number(ex.estimatedCostUsd).toFixed(6)}
                </span>
              </div>
              <span>{new Date(ex.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}

        {executions.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No execution logs found yet.
          </div>
        )}
      </div>
    </div>
  );
}
