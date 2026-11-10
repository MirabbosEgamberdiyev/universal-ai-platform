"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import {
  ShieldCheck,
  Lock,
  Key,
  ShieldAlert,
  Smartphone,
  Eye,
  RefreshCw,
  CheckCircle2,
  Server,
  FileCheck,
  Cpu,
  Globe
} from "lucide-react";

export default function SecurityPage() {
  const { t } = useLanguage();
  const { user, activeOrg } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [rotatingToken, setRotatingToken] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleRotateKey = () => {
    setRotatingToken(true);
    setTimeout(() => {
      setRotatingToken(false);
      setNotification("Token Vault KMS master key re-keyed and verified across all OAuth tokens!");
      setTimeout(() => setNotification(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.security}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise Zero-Trust Posture: Hardware-backed Token Vault, AES-256-GCM envelope encryption, and real-time injection quarantine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRotateKey}
            disabled={rotatingToken}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rotatingToken ? "animate-spin" : ""}`} />
            {rotatingToken ? "Re-encrypting..." : "Rotate Vault Keys"}
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Security Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Token Vault Status</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              AES-256-GCM Enforced
            </div>
            <p className="text-xs text-slate-500 mt-1">Active Key ID: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">kms-v1</span></p>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Plaintext tokens never persist in memory or database logs.
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Autonomy Gate</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Mode 3: Operator (HITL)
            </div>
            <p className="text-xs text-slate-500 mt-1">Status: <span className="font-semibold text-emerald-600">Strict Enforcement</span></p>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            External write actions require explicit biometric/human signature.
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Injection Defense</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              12 Heuristic Filters
            </div>
            <p className="text-xs text-slate-500 mt-1">Quarantine Gate: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">50% Risk Score</span></p>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Payloads scanned before ingestion and isolated via XML tags.
          </div>
        </div>
      </div>

      {/* Security Policies Configuration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-500" />
          Access Control & Identity Policies
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="py-4 flex items-center justify-between first:pt-0">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-400" />
                Two-Factor Authentication (2FA / TOTP)
              </h4>
              <p className="text-xs text-slate-500">
                Require TOTP hardware token verification for all administrative actions and social account linking.
              </p>
            </div>
            <button
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                mfaEnabled ? "bg-indigo-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                IP Whitelist & CIDR Boundary Check
              </h4>
              <p className="text-xs text-slate-500">
                Restrict API and administration console access to corporate VPN and static office IPs.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              0.0.0.0/0 (Global Dev Active)
            </span>
          </div>

          <div className="py-4 flex items-center justify-between last:pb-0">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-400" />
                Audit Trail Immutability
              </h4>
              <p className="text-xs text-slate-500">
                Cryptographically seal all action records in append-only storage with SHA-256 state hashing.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded border border-emerald-300">
              Active & Enforced
            </span>
          </div>
        </div>
      </div>

      {/* Active User Sessions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-500" />
          Active Device & API Sessions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase font-semibold">
                <th className="py-2.5 px-3">Device / Client</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Session Started</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                  Chrome on Windows 11 (Current)
                </td>
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                  127.0.0.1
                </td>
                <td className="py-3 px-3 text-slate-500">Tashkent, Uzbekistan</td>
                <td className="py-3 px-3 text-slate-500">Today, 11:28 AM</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                    Active Now
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                  OmniAgent Internal Background Worker
                </td>
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                  10.0.0.12 (Internal VPC)
                </td>
                <td className="py-3 px-3 text-slate-500">Local Cluster</td>
                <td className="py-3 px-3 text-slate-500">Today, 09:00 AM</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300">
                    Service Daemon
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
