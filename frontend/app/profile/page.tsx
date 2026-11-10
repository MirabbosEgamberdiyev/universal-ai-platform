"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { 
  User as UserIcon, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  Save, 
  KeyRound, 
  Globe2,
  Clock
} from "lucide-react";

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "Lead Operator");
  const [email] = useState(user?.email || "admin@omnicorp.ai");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError(
        language === "uz-Latn"
          ? "Yangi parollar bir-biriga mos kelmadi"
          : language === "ru"
          ? "Новые пароли не совпадают"
          : "New passwords do not match"
      );
      return;
    }
    setPasswordError(null);
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-indigo-600" />
          <span>
            {language === "uz-Latn" ? "Foydalanuvchi profili" : language === "ru" ? "Профиль пользователя" : "User Profile & Security"}
          </span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {language === "uz-Latn"
            ? "Shaxsiy ma'lumotlar, interfeys tili va hisob xavfsizligi"
            : language === "ru"
            ? "Управление личными данными, паролем и безопасностью"
            : "Manage your personal account credentials, preferences, and multi-factor authentication"}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            {language === "uz-Latn"
              ? "Profil ma'lumotlari yangilandi!"
              : language === "ru"
              ? "Данные профиля обновлены!"
              : "Profile details successfully updated!"}
          </span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {language === "uz-Latn" ? "Shaxsiy ma'lumotlar" : language === "ru" ? "Личные данные" : "Personal Information"}
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === "uz-Latn" ? "To'liq ism" : language === "ru" ? "ФИО" : "Full Name"}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                readOnly
                value={email}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
            >
              <Save className="w-4 h-4" />
              <span>{t.common.save}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <span>{language === "uz-Latn" ? "Parolni o'zgartirish" : language === "ru" ? "Сменить пароль" : "Change Password"}</span>
        </h3>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {language === "uz-Latn" ? "Parol yangilandi!" : language === "ru" ? "Пароль успешно изменен!" : "Password successfully updated!"}
            </span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-lg text-xs">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {language === "uz-Latn" ? "Joriy parol" : language === "ru" ? "Текущий пароль" : "Current Password"}
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {language === "uz-Latn" ? "Yangi parol" : language === "ru" ? "Новый пароль" : "New Password"}
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {language === "uz-Latn" ? "Yangi parolni tasdiqlash" : language === "ru" ? "Повторите новый пароль" : "Confirm New Password"}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
          >
            {language === "uz-Latn" ? "Parolni yangilash" : language === "ru" ? "Обновить пароль" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Two-Factor Authentication (2FA)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Secure your account with Google Authenticator or 1Password TOTP.
            </p>
          </div>
        </div>

        <button
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            twoFactorEnabled
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          {twoFactorEnabled ? "Active (Enabled)" : "Enable 2FA"}
        </button>
      </div>
    </div>
  );
}
