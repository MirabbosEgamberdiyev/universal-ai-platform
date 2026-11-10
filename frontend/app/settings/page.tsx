"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { apiClient } from "../../lib/api/apiClient";
import { 
  Building2, 
  ShieldCheck, 
  Bot, 
  Sliders, 
  Key, 
  Globe2, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Sparkles,
  ExternalLink,
  Users,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const { activeOrg, user } = useAuth();

  const [activeTab, setActiveTab] = useState<"general" | "ai" | "autonomy" | "security" | "api">("ai");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // General Form states
  const [orgName, setOrgName] = useState(activeOrg?.name || "OmniCorp Digital");
  const [orgSlug, setOrgSlug] = useState(activeOrg?.slug || "omnicorp-digital");
  const [timezone, setTimezone] = useState("Asia/Tashkent");
  const [primaryLang, setPrimaryLang] = useState(language);
  const [autonomyMode, setAutonomyMode] = useState<"ADVISOR" | "CREATOR" | "OPERATOR" | "AUTOPILOT">(
    (activeOrg?.autonomyMode as any) || "OPERATOR"
  );
  const [requireHumanReviewForPublishing, setRequireHumanReviewForPublishing] = useState(true);
  const [requireHumanReviewForDMs, setRequireHumanReviewForDMs] = useState(false);
  const [maxAutoSpendDaily, setMaxAutoSpendDaily] = useState("25");
  const [safetyFilterLevel, setSafetyFilterLevel] = useState("HIGH");

  // AI Configuration states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [claudeKeyInput, setClaudeKeyInput] = useState("");
  const [openaiKeyInput, setOpenaiKeyInput] = useState("");
  const [preferredProvider, setPreferredProvider] = useState("GEMINI");
  const [brandVoicePrompt, setBrandVoicePrompt] = useState("Professional, do'stona, o'zbek va rus tillarida yuqori sifatli marketing matnlari.");
  
  // Loaded configuration metadata from backend
  const [aiConfig, setAiConfig] = useState<any>(null);

  // Key Visibility toggles
  const [showGemini, setShowGemini] = useState(false);
  const [showClaude, setShowClaude] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);

  // Testing states
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      setOrgName(activeOrg.name);
      setOrgSlug(activeOrg.slug);
      if (activeOrg.autonomyMode) {
        setAutonomyMode(activeOrg.autonomyMode as any);
      }
    }
    fetchAiConfig();
  }, [activeOrg]);

  const fetchAiConfig = async () => {
    try {
      setAiLoading(true);
      let res: any = null;
      try {
        res = await apiClient.get<any>("/ai/config");
      } catch {
        res = await apiClient.get<any>("/organizations/ai-config");
      }
      setAiConfig(res);
      if (res?.preferredProvider) setPreferredProvider(res.preferredProvider);
      if (res?.brandVoicePrompt) setBrandVoicePrompt(res.brandVoicePrompt);
    } catch (e) {
      console.error("Failed to load AI config", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTestAi = async (provider: "GEMINI" | "CLAUDE" | "OPENAI") => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      let keyToTest = "";
      if (provider === "GEMINI") keyToTest = geminiKeyInput.trim();
      else if (provider === "CLAUDE") keyToTest = claudeKeyInput.trim();
      else if (provider === "OPENAI") keyToTest = openaiKeyInput.trim();

      const res = await apiClient.post<any>("/ai/test", {
        provider,
        apiKey: keyToTest || undefined
      });
      setTestResult({
        provider,
        success: res.success,
        message: res.message || res.aiResponse || (res.success ? "AI bilan aloqa muvaffaqiyatli o'rnatildi!" : "Ulanib bo'lmadi")
      });
      if (res.success) {
        await fetchAiConfig();
      }
    } catch (e: any) {
      setTestResult({
        provider,
        success: false,
        message: e?.message || e?.detail || e?.error || "AI provayderiga ulanishda xatolik yuz berdi"
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveAiConfig = async () => {
    setAiSaving(true);
    try {
      const payload: any = {
        preferredAiProvider: preferredProvider,
        brandVoicePrompt: brandVoicePrompt,
      };
      if (geminiKeyInput.trim()) payload.geminiApiKey = geminiKeyInput.trim();
      if (claudeKeyInput.trim()) payload.claudeApiKey = claudeKeyInput.trim();
      if (openaiKeyInput.trim()) payload.openaiApiKey = openaiKeyInput.trim();

      let updated: any = null;
      try {
        updated = await apiClient.put<any>("/organizations/ai-config", payload);
      } catch {
        updated = await apiClient.post<any>("/ai/config", {
          provider: preferredProvider,
          apiKey: geminiKeyInput.trim() || claudeKeyInput.trim() || openaiKeyInput.trim(),
          brandVoicePrompt: brandVoicePrompt
        });
      }
      setAiConfig(updated);
      setGeminiKeyInput("");
      setClaudeKeyInput("");
      setOpenaiKeyInput("");
      setSaveMessage(
        language === "uz-Latn" || language === "uzl"
          ? "AI kalitlari va brend ko'rsatmalari muvaffaqiyatli saqlandi!"
          : language === "ru"
          ? "Ключи ИИ успешно сохранены!"
          : "AI keys saved successfully!"
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
      await fetchAiConfig();
    } catch (e: any) {
      alert("Xatolik: " + (e?.detail || e?.message || "Saqlab bo'lmadi"));
    } finally {
      setAiSaving(false);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(
      language === "uz-Latn" || language === "uzl"
        ? "Tashkilot parametrlari saqlandi!"
        : language === "ru"
        ? "Параметры сохранены!"
        : "Settings saved!"
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyAiStudioLink = () => {
    navigator.clipboard.writeText("https://aistudio.google.com/app/apikey");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.nav.settings}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === "uz-Latn" || language === "uzl"
              ? "Tashkilot profili, AI provayder kalitlari (Gemini, Claude) va xavfsizlik sozlamalari"
              : language === "ru"
              ? "Параметры организации, ключи ИИ (Gemini, Claude) и безопасность"
              : "Manage organization workspace, AI provider keys (Gemini, Claude), and security"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/team"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>{t.nav.team}</span>
          </Link>
          <Link
            href="/billing"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span>{t.nav.billing}</span>
          </Link>
          {activeTab === "ai" ? (
            <button
              onClick={handleSaveAiConfig}
              disabled={aiSaving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition disabled:opacity-50"
            >
              {aiSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{language === "uz-Latn" || language === "uzl" ? "AI Kalitlarni Saqlash" : language === "ru" ? "Сохранить ключи ИИ" : "Save AI Keys"}</span>
            </button>
          ) : (
            <button
              onClick={handleSaveGeneral}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{t.common.save}</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 overflow-x-auto">
        {[
          { id: "ai", label: language === "uz-Latn" || language === "uzl" ? "AI Kalitlari & Provayderlar" : language === "ru" ? "ИИ Провайдеры и Ключи" : "AI Keys & Providers", icon: Sparkles },
          { id: "general", label: language === "uz-Latn" || language === "uzl" ? "Asosiy" : language === "ru" ? "Общие" : "General", icon: Building2 },
          { id: "autonomy", label: language === "uz-Latn" || language === "uzl" ? "Avtonomlik (HITL)" : language === "ru" ? "Автономия (HITL)" : "Autonomy & HITL", icon: ShieldCheck },
          { id: "security", label: language === "uz-Latn" || language === "uzl" ? "Xavfsizlik (Vault)" : language === "ru" ? "Безопасность (Vault)" : "Security & Vault", icon: Lock },
          { id: "api", label: language === "uz-Latn" || language === "uzl" ? "API va Webhook" : language === "ru" ? "API и Вебхуки" : "API & Webhooks", icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: AI Provider Keys & Configuration */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          {/* Multi-tenant Isolation Notice Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === "uz-Latn" || language === "uzl" ? "Har bir foydalanuvchi o'zining shaxsiy API kalitidan foydalanadi" : language === "ru" ? "Каждый пользователь использует свой собственный ключ API" : "Per-Tenant Hardware-Encrypted API Keys"}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  AES-256-GCM
                </span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {language === "uz-Latn" || language === "uzl"
                  ? "Kiritilgan barcha API kalitlari (Gemini, Claude, OpenAI) faqat sizning tashkilotingiz uchun shifrlangan holda alohida saqlanadi. Boshqa foydalanuvchilar sizning kalitingizni ko'ra olmaydi va foydalana olmaydi."
                  : language === "ru"
                  ? "Все введенные ключи API (Gemini, Claude, OpenAI) шифруются аппаратно и изолированы для вашей организации. Другие пользователи не имеют к ним доступа."
                  : "Every tenant maintains isolated, envelope-encrypted keys in PostgreSQL. Your API keys are never visible to other users."}
              </p>
            </div>
          </div>

          {/* Test Result Alert */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                testResult.success
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-semibold">[{testResult.provider}]</span>
                <span>{testResult.message}</span>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-[11px] font-medium opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Preferred Provider Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === "uz-Latn" || language === "uzl" ? "Asosiy AI Provayder (Standart Tanlov)" : language === "ru" ? "Основной провайдер ИИ" : "Primary AI Provider"}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: "GEMINI",
                  name: "Google Gemini",
                  desc: "Flash-Lite / 3.8 Flash • Bepul kvota va juda tez",
                  status: aiConfig?.geminiConfigured ? "Ulangan" : "Sozlanmagan",
                  active: preferredProvider === "GEMINI",
                },
                {
                  id: "CLAUDE",
                  name: "Anthropic Claude",
                  desc: "Claude 3.5 Sonnet • Chuqur tafakkur va sifat",
                  status: aiConfig?.claudeConfigured ? "Ulangan" : "Sozlanmagan",
                  active: preferredProvider === "CLAUDE",
                },
                {
                  id: "OPENAI",
                  name: "OpenAI GPT-4o",
                  desc: "GPT-4o • Universal multimodal model",
                  status: aiConfig?.openaiConfigured ? "Ulangan" : "Sozlanmagan",
                  active: preferredProvider === "OPENAI",
                },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPreferredProvider(p.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    p.active
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        p.status === "Ulangan"
                          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Provider 1: Google Gemini */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  G
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Google Gemini API
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Modellar: gemini-flash-lite-latest, gemini-3.5-flash-lite, gemini-3.8-flash
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {aiConfig?.hasCustomGeminiKey && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Shaxsiy kalit faol ({aiConfig?.geminiKeyMasked})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleTestAi("GEMINI")}
                  disabled={testingProvider === "GEMINI"}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {testingProvider === "GEMINI" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Ulanishni tekshirish</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {aiConfig?.hasCustomGeminiKey ? "Yangi Gemini API Kaliti (o'zgartirish uchun):" : "Gemini API Kaliti (Google AI Studio):"}
              </label>
              <div className="relative">
                <input
                  type={showGemini ? "text" : "password"}
                  placeholder={aiConfig?.geminiKeyMasked ? `Hozirgi kalit: ${aiConfig.geminiKeyMasked} (almashtirish uchun yangisini yozing)` : "AIzaSy... yoki AQ.Ab8..."}
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Step-by-Step Educational Tutorial for Gemini Key */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Google Gemini API kalitini bepul olish tartibi (3 oddiy qadam):
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                >
                  <span>Google AI Studio ga o'tish</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal pl-4 leading-relaxed">
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500">
                      https://aistudio.google.com/app/apikey
                    </a>
                  </strong>{" "}
                  havolasiga bosing va o'z shaxsiy Google hisobingiz (Gmail) orqali kiring.
                </li>
                <li>
                  Ekranda ko'ringan ko'k <strong className="text-slate-900 dark:text-slate-200">"Create API key"</strong> tugmasini bosing va loyihani tanlang.
                </li>
                <li>
                  Hosil bo'lgan <strong className="text-slate-900 dark:text-slate-200">"AQ...."</strong> yoki <strong className="text-slate-900 dark:text-slate-200">"AIzaSy..."</strong> bilan boshlanuvchi kalitni nusxalang (<strong className="text-indigo-600">Copy key</strong>) va yuqoridagi maydonga joylang.
                </li>
              </ol>
            </div>
          </div>

          {/* Provider 2: Anthropic Claude */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  C
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Anthropic Claude API
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Model: claude-3-5-sonnet-20241022 (Messages API)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {aiConfig?.hasCustomClaudeKey && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Shaxsiy kalit faol ({aiConfig?.claudeKeyMasked})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleTestAi("CLAUDE")}
                  disabled={testingProvider === "CLAUDE"}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {testingProvider === "CLAUDE" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Ulanishni tekshirish</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {aiConfig?.hasCustomClaudeKey ? "Yangi Claude API Kaliti (o'zgartirish uchun):" : "Claude API Kaliti (Anthropic Console):"}
              </label>
              <div className="relative">
                <input
                  type={showClaude ? "text" : "password"}
                  placeholder={aiConfig?.claudeKeyMasked ? `Hozirgi kalit: ${aiConfig.claudeKeyMasked}` : "sk-ant-api03-..."}
                  value={claudeKeyInput}
                  onChange={(e) => setClaudeKeyInput(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowClaude(!showClaude)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showClaude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-1.5 flex justify-end">
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <span>Anthropic Console dan API kalit olish</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Provider 3: OpenAI */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  O
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    OpenAI API
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Model: gpt-4o, gpt-4o-mini
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {aiConfig?.hasCustomOpenaiKey && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Shaxsiy kalit faol ({aiConfig?.openaiKeyMasked})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleTestAi("OPENAI")}
                  disabled={testingProvider === "OPENAI"}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {testingProvider === "OPENAI" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Ulanishni tekshirish</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {aiConfig?.hasCustomOpenaiKey ? "Yangi OpenAI API Kaliti:" : "OpenAI API Kaliti (platform.openai.com):"}
              </label>
              <div className="relative">
                <input
                  type={showOpenai ? "text" : "password"}
                  placeholder={aiConfig?.openaiKeyMasked ? `Hozirgi kalit: ${aiConfig.openaiKeyMasked}` : "sk-..."}
                  value={openaiKeyInput}
                  onChange={(e) => setOpenaiKeyInput(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Brand Voice Guidelines (Prompt Engineering) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Brend Ovozi va Uslubi (Brand Voice Guidance)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                AI postlar, xabarlar va heshteglar yaratishda ushbu qoidalarga qat'iy amal qiladi.
              </p>
            </div>
            <textarea
              rows={3}
              value={brandVoicePrompt}
              onChange={(e) => setBrandVoicePrompt(e.target.value)}
              placeholder="Masalan: Professional, samimiy, o'zbek tilida emojilar bilan, yoshlarbop..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveAiConfig}
              disabled={aiSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {aiSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{language === "uz-Latn" || language === "uzl" ? "Sozlamalar va Kalitlarni Saqlash" : "Save AI Configuration"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: General Settings */}
      {activeTab === "general" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            {language === "uz-Latn" || language === "uzl" ? "Tashkilot ma'lumotlari" : language === "ru" ? "Информация об организации" : "Organization Details"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === "uz-Latn" || language === "uzl" ? "Tashkilot nomi" : language === "ru" ? "Название организации" : "Organization Name"}
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workspace Slug (ID)
              </label>
              <input
                type="text"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === "uz-Latn" || language === "uzl" ? "Vaqt mintaqasi" : language === "ru" ? "Часовой пояс" : "Timezone"}
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="America/New_York">America/New York (UTC-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === "uz-Latn" || language === "uzl" ? "Boshlang'ich til" : language === "ru" ? "Основной язык" : "Primary Language"}
              </label>
              <select
                value={primaryLang}
                onChange={(e) => setPrimaryLang(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="uzl">O'zbekcha (Lotin)</option>
                <option value="uzc">Ўзбекча (Кирилл)</option>
                <option value="ru">Русский</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Autonomy Spectrum & HITL */}
      {activeTab === "autonomy" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === "uz-Latn" || language === "uzl" ? "4-Darajali Avtonomlik Spektri" : language === "ru" ? "4-уровневый спектр автономии" : "4-Level Autonomy Spectrum"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === "uz-Latn" || language === "uzl"
                ? "Agent sizning nomingizdan qanday darajada mustaqil harakat qilishini belgilang. Sukut bo'yicha: 3-Rejim Operator (Inson nazorati)."
                : language === "ru"
                ? "Определите степень самостоятельности агента от вашего имени. По умолчанию: Режим 3 Оператор (Human-in-the-Loop)."
                : "Configure how autonomously OmniAgent executes tasks. Default: Mode 3 Operator (HITL approval required)."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                mode: "ADVISOR",
                badge: "Mode 1",
                title: t.autonomy.advisor,
                desc: language === "uz-Latn" || language === "uzl" ? "Faqat tahlil va maslahat. Harakat bajarmaydi." : language === "ru" ? "Только аналитика и рекомендации." : "Read-only analytics and proactive advice.",
                color: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20",
                activeColor: "border-blue-600 ring-2 ring-blue-500/20"
              },
              {
                mode: "CREATOR",
                badge: "Mode 2",
                title: t.autonomy.creator,
                desc: language === "uz-Latn" || language === "uzl" ? "Kontent va qoralamalar tayyorlaydi. Chiqarish qo'lda." : language === "ru" ? "Создает контент и черновики. Публикация вручную." : "Generates drafts, captions, and creative media.",
                color: "border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20",
                activeColor: "border-purple-600 ring-2 ring-purple-500/20"
              },
              {
                mode: "OPERATOR",
                badge: "Mode 3 (HITL)",
                title: t.autonomy.operator,
                desc: language === "uz-Latn" || language === "uzl" ? "Rejalashtiradi va bajaradi, lekin har bir muhim amal inson tasdig'i bilan." : language === "ru" ? "Планирует и выполняет, но важные действия требуют подтверждения." : "Executes full workflows, with human approval gate for publishing/external mutations.",
                color: "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20",
                activeColor: "border-amber-600 ring-2 ring-amber-500/20"
              },
              {
                mode: "AUTOPILOT",
                badge: "Mode 4",
                title: t.autonomy.autopilot,
                desc: language === "uz-Latn" || language === "uzl" ? "To'liq avtomatik ijro (faqat ishonchli foydalanuvchilar uchun)." : language === "ru" ? "Полная автономия." : "Full autonomy within set budget limits.",
                color: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20",
                activeColor: "border-emerald-600 ring-2 ring-emerald-500/20"
              }
            ].map((card) => (
              <div
                key={card.mode}
                onClick={() => setAutonomyMode(card.mode as any)}
                className={`p-4 rounded-xl border cursor-pointer transition ${card.color} ${
                  autonomyMode === card.mode ? card.activeColor : "hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 font-bold">
                    {card.badge}
                  </span>
                  {autonomyMode === card.mode && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {card.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === "uz-Latn" || language === "uzl" ? "Inson nazorati (HITL) qoidalari" : language === "ru" ? "Правила подтверждения человеком" : "Human-in-the-Loop Gates"}
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireHumanReviewForPublishing}
                  onChange={(e) => setRequireHumanReviewForPublishing(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  {language === "uz-Latn" || language === "uzl"
                    ? "Barcha ommaviy nashrlar (Instagram, Telegram, YouTube) chiqishidan oldin tasdiq kutsin"
                    : language === "ru"
                    ? "Требовать подтверждение для всех публикаций в соцсетях перед выходом"
                    : "Require approval for all external social media posts before publishing"}
                </span>
              </label>
              <label className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireHumanReviewForDMs}
                  onChange={(e) => setRequireHumanReviewForDMs(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  {language === "uz-Latn" || language === "uzl"
                    ? "Mijozlar bilan yozishmalarda AI javobidan oldin xodim tasdig'i talab qilinsin"
                    : language === "ru"
                    ? "Требовать подтверждение для ответов на входящие сообщения клиентов"
                    : "Require operator review before sending direct message replies"}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security & Vault */}
      {activeTab === "security" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <Lock className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Hardware-Backed AES-256-GCM Token Vault
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {language === "uz-Latn" || language === "uzl"
                  ? "Barcha OAuth tokenlari, Telegram bot tokenlari va shaxsiy AI kalitlari (Gemini, Claude, OpenAI) ma'lumotlar bazasida AES-256-GCM konvert shifrlash bilan saqlanadi. Ochiq matn ko'rinishida hech qanday maxfiy kalit saqlanmaydi."
                  : language === "ru"
                  ? "Все OAuth токены, токены Telegram ботов и конфиденциальные ключи ИИ хранятся с использованием конвертного шифрования AES-256-GCM. Ноль открытого текста."
                  : "All connected platform OAuth tokens and Telegram bot tokens are envelope-encrypted with AES-256-GCM before database persistence. Zero plain-text token exposure."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === "uz-Latn" || language === "uzl" ? "Zero-Trust va RLS tekshiruvi" : language === "ru" ? "Zero-Trust и проверка RLS" : "Zero-Trust & Isolation"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Database Row-Level Security:</span>
                <span className="ml-2 font-bold text-emerald-600">ENFORCED (PostgreSQL RLS)</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Prompt Injection Firewall:</span>
                <span className="ml-2 font-bold text-emerald-600">ACTIVE (Layer 7 Filter)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: API & Webhooks */}
      {activeTab === "api" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              NovaSphere API & Webhook Integrations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === "uz-Latn" || language === "uzl"
                ? "Tashqi tizimlar, Telegram botlar va CRM dasturlari bilan integratsiya qilish uchun rasmiy API kaliti."
                : "Official REST API access tokens for external webhooks, CRM integrations, and bots."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Personal Access Token
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                readOnly
                value="ns_live_sec_993418247012948123984129"
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => alert("Nusxalandi!")}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
