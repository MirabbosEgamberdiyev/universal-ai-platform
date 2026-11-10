"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { KeyRound, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { forgotPassword, resetPassword } = useAuth();
  const { t } = useLanguage();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleRequestResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      setSuccess("Agar bunday akkaunt mavjud bo'lsa, parolni tiklash havolasi pochtangizga yuborildi!");
    } catch (err: any) {
      setError(err?.detail || err?.title || err?.message || "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi shart");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword(token.trim(), newPassword);
      setSuccess("Parolingiz muvaffaqiyatli yangilandi! Endi yangi parol bilan tizimga kirishingiz mumkin.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setError(err?.detail || err?.title || err?.message || "Parolni yangilashda xatolik yuz berdi yoki havola muddati tugagan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4 text-indigo-400">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">{t.auth.resetPasswordTitle}</h2>
        <p className="mt-2 text-xs text-slate-400">
          {token ? t.auth.resetPasswordSubtitle : "Akkauntingiz pochtasini kiriting, biz tiklash havolasini yuboramiz"}
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
                href="/login"
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Kirish sahifasiga qaytish
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!success && !token && (
            <form className="space-y-4" onSubmit={handleRequestResetLink}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.auth.emailLabel}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Yuborilmoqda..." : "Tiklash havolasini yuborish"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {!success && token && (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.auth.newPasswordLabel}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 8 belgi"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Yangi parolni tasdiqlang
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta tering"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Yangilanmoqda..." : t.auth.saveNewPasswordBtn}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs text-slate-400 hover:text-indigo-400 transition">
              ← Tizimga kirish sahifasiga qaytish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yuklanmoqda...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
