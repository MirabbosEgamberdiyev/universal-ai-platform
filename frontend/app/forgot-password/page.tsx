"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { Sparkles, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(
        language === "uz-Latn"
          ? "Iltimos, emailingizni kiriting"
          : language === "ru"
          ? "Пожалуйста, введите ваш email"
          : "Please enter your email address"
      );
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate recovery request dispatch to backend
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {language === "uz-Latn"
            ? "Parolni tiklash"
            : language === "ru"
            ? "Сброс пароля"
            : "Reset your password"}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          {language === "uz-Latn"
            ? "Elektron pochtangizni kiriting va biz sizga tiklash havolasini yuboramiz"
            : language === "ru"
            ? "Введите ваш email, и мы отправим ссылку для восстановления доступа"
            : "Enter your verified email and we'll send you a password reset link"}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === "uz-Latn"
                  ? "Tiklash xati yuborildi"
                  : language === "ru"
                  ? "Письмо отправлено"
                  : "Check your email"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "uz-Latn"
                  ? `${email} manziliga parolni yangilash bo'yicha ko'rsatmalar yuborildi.`
                  : language === "ru"
                  ? `Инструкции по восстановлению пароля отправлены на ${email}.`
                  : `We sent password reset instructions to ${email}.`}
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {language === "uz-Latn" ? "Kirish sahifasiga qaytish" : language === "ru" ? "Вернуться ко входу" : "Back to sign in"}
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {language === "uz-Latn" ? "Elektron pochta" : language === "ru" ? "Электронная почта" : "Email address"}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
                >
                  {loading
                    ? t.common.loading
                    : language === "uz-Latn"
                    ? "Tiklash havolasini yuborish"
                    : language === "ru"
                    ? "Отправить ссылку"
                    : "Send reset link"}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {language === "uz-Latn" ? "Kirish sahifasiga qaytish" : language === "ru" ? "Вернуться ко входу" : "Back to sign in"}
                  </span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
