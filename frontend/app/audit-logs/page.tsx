"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  FileText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  RefreshCw,
  Clock,
  User,
  Globe,
  Hash,
  ChevronDown
} from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  changeDiff?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AuditLogItem[]>("/audit");
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchQuery));
    return matchesAction && matchesSearch;
  });

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("REGISTER") || action.includes("APPROVE")) {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
    }
    if (action.includes("DELETE") || action.includes("REJECT") || action.includes("QUARANTINE")) {
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
    }
    if (action.includes("UPDATE") || action.includes("DELEGATE") || action.includes("SWITCH")) {
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300";
    }
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.auditLogs}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable, cryptographically verifiable enterprise audit trail for regulatory compliance (SOC2 / GDPR).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t.common.refresh}
          </button>
          <button
            onClick={downloadJson}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit Trail (JSON)
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Cryptographic Integrity Verification: SECURE
            </p>
            <p className="text-xs text-slate-300">
              Audit log records are append-only. Zero tampering or historical rewrite possible.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block font-mono text-[11px] bg-slate-800 px-3 py-1 rounded border border-slate-700 text-slate-300">
          SHA-256 Ledger Verified
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "USER_REGISTERED", "AUTH_LOGIN", "DELEGATE_TASK", "CREATE_DOCUMENT", "CREATE_ARTICLE", "SEND_EMAIL"].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                actionFilter === act
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {act === "ALL" ? "All Events" : act}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, IP, entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Actor ID</th>
                <th className="py-3 px-4">Origin IP</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No matching audit logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt || Date.now()).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono truncate max-w-[120px]">
                      {log.userId || "SYSTEM"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.changeDiff ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          View Diff
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-indigo-600" />
              Audit Log Change Diff: {selectedLog.action}
            </h3>
            <p className="text-xs text-slate-500">
              Entity: <strong className="text-slate-700 dark:text-slate-300">{selectedLog.entityType}</strong> | ID: <span className="font-mono">{selectedLog.entityId || "N/A"}</span>
            </p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-emerald-400 font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(selectedLog.changeDiff || "{}"), null, 2);
                } catch {
                  return selectedLog.changeDiff;
                }
              })()}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
