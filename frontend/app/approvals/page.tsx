"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function ApprovalsPage() {
  const { t } = useLanguage();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [filter, setFilter] = useState("PENDING");

  const loadApprovals = async () => {
    try {
      const data = await apiRequest<any[]>("/agent/approvals");
      setApprovals(data);
    } catch (e) {
      console.error("Failed to load approvals:", e);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleReview = async (approvalId: string, decision: "APPROVE" | "REJECT") => {
    try {
      await apiRequest<any>(`/agent/approvals/${approvalId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      loadApprovals();
    } catch (e: any) {
      alert("Review failed: " + (e?.detail || e?.message));
    }
  };

  const filtered = approvals.filter((a) => (filter === "ALL" ? true : a.status === filter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.approvals}</h1>
          <p className="text-xs text-slate-500">Mode 3 (Operator) Human-in-the-Loop review gate for public posts, DMs, and high-impact operations.</p>
        </div>
        <div className="flex gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-white dark:bg-slate-900 text-xs">
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1 rounded font-semibold ${filter === "PENDING" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-3 py-1 rounded font-semibold ${filter === "APPROVED" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400"}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded font-semibold ${filter === "ALL" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400"}`}
          >
            All Logs
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {item.actionType}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ID: {item.id.substring(0, 8)}...
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : item.status === "PENDING"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto">
                {item.payloadPreview}
              </pre>

              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Created: {new Date(item.createdAt).toLocaleString()}
                </span>
                <span>Expires: {new Date(item.expiresAt).toLocaleString()}</span>
              </div>
            </div>

            {item.status === "PENDING" && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleReview(item.id, "APPROVE")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReview(item.id, "REJECT")}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <XCircle className="w-4 h-4 text-rose-500" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No approval requests found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
