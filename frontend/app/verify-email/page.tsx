"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, verifyEmail, resendVerification } = useAuth();
  const { t } = useLanguage();

  const [token, setToken] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      handleAutoVerify(urlToken);
    }
    if (user?.email) {
      setResendEmail(user.email);
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleAutoVerify = async (tokenToVerify: string) => {
    setError(null);
    setLoading(true);
    try {
      await verifyEmail(tokenToVerify);
      setSuccess("Elektron pochtangiz muvaffaqiyatli tasdiqlandi!");
    } catch (err: any) {
      setError(err?.detail || err?.title || err?.message || "Tasdiqlash kodi yaroqsiz yoki muddati o'tgan.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    await handleAutoVerify(token.trim());
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const emailToUse = resendEmail.trim() || user?.email;
    if (!emailToUse) {
      setError("Iltimos, pochtangizni kiriting");
      return;
    }
    setError(null);
    setResending(true);
    try {
      await resendVerification(emailToUse);
      setSuccess("Yangi tasdiqlash xabari pochtangizga yuborildi!");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.detail || err?.title || err?.message || "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4 text-indigo-400">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">{t.auth.verifyEmailTitle}</h2>
        <p className="mt-2 text-xs text-slate-400">
          {t.auth.verifyEmailSubtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex flex-col gap-3 text-emerald-300 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{success}</span>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Boshqaruv paneliga o'tish
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!success && (
            <form className="space-y-4" onSubmit={handleManualSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tasdiqlash kodi yoki tokeni
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Tokenni kiriting yoki xatdagi havolani oching..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 font-mono transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Tasdiqlanmoqda..." : t.auth.verifyBtn}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs text-slate-400 mb-3">Xat kelmadimi? Qayta yuborish:</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Elektron pochta manzilingiz"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `${resendCooldown}s` : t.auth.resendBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yuklanmoqda...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
