"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { BRAND } from "../../lib/brand";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import Link from "next/link";
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Lightbulb, 
  Copy, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";

interface MessageItem {
  sender: "user" | "assistant";
  text: string;
  planJson?: string;
  approvalId?: string;
}

export default function AssistantPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      sender: "assistant",
      text: t.assistant.initialGreeting || `Assalomu alaykum! Men ${BRAND.name} yordamchisiman. Menga Instagram, Telegram yoki YouTube uchun post matnlari yaratish, heshteglar topish yoki nashr rejasini tuzish bo'yicha buyruq bering.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedJson, setExpandedJson] = useState<Record<number, boolean>>({});

  const toggleJson = (idx: number) => {
    setExpandedJson((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const samplePrompts = [
    language === "uzl" || language === "uz-Latn"
      ? "Yangi ochilgan kiyim do'koni uchun Telegramga 3 xil post yozib ber"
      : language === "uzc" || language === "uz-Cyrl"
      ? "Янги очилган кийим дўкони учун Telegramга 3 хил пост ёзиб бер"
      : language === "ru"
      ? "Напиши 3 разных поста для Telegram канала нового магазина одежды"
      : "Write 3 engaging Telegram posts for a newly opened clothing store",
    language === "uzl" || language === "uz-Latn"
      ? "Marketing va texnologiya bo'yicha 10 ta ommabop heshteg tavsiya qil"
      : language === "uzc" || language === "uz-Cyrl"
      ? "Маркетинг ва технология бўйича 10 та оммабоп ҳэштег тавсия қил"
      : language === "ru"
      ? "Подбери 10 вирусных хэштегов для продвижения в соцсетях"
      : "Suggest 10 trending hashtags for social media growth",
    language === "uzl" || language === "uz-Latn"
      ? "Telegram va Instagram uchun yangi mahsulot haqida qiziqarli post yozib ber"
      : language === "ru"
      ? "Напиши вовлекающий анонс нового продукта для Telegram и Instagram"
      : "Create an exciting new product announcement for Telegram & Instagram",
  ];

  const handleSend = async (customPrompt?: string) => {
    const userText = (customPrompt || input).trim();
    if (!userText || loading) return;

    if (!customPrompt) setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await apiRequest<any>("/agent/chat", {
        method: "POST",
        body: JSON.stringify({ message: userText }),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: res.responseMessage || res.message,
          planJson: res.executionPlanJson,
          approvalId: res.pendingApprovalId,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { 
          sender: "assistant", 
          text: err?.detail || err?.message || t.assistant.unconfiguredNotice 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      await apiRequest(`/agent/approvals/${approvalId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision: "APPROVE" }),
      });
      alert(t.assistant.actionApproved || "Amal tasdiqlandi va ijroga yuborildi!");
    } catch (e: any) {
      alert("Xatolik: " + (e?.detail || e?.message));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Post matni nusxalandi!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.assistant.copilotTitle}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.assistant.copilotSubtitle}
            </p>
          </div>
        </div>
        <Link
          href="/settings"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Sozlamalari</span>
        </Link>
      </div>

      {/* Chat Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((m, idx) => {
          let parsedPlan: any = null;
          let isUnconfigured = false;
          if (m.planJson) {
            try {
              parsedPlan = typeof m.planJson === "string" ? JSON.parse(m.planJson) : m.planJson;
              if (parsedPlan?.status === "PROVIDER_NOT_CONFIGURED") {
                isUnconfigured = true;
              }
            } catch (e) {
              // ignore
            }
          }

          return (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-600/15"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* If provider is not configured banner with 1-click CTA */}
                {isUnconfigured && (
                  <div className="mt-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>AI Provayder kaliti (Gemini yoki Claude) hali ulanmagan</span>
                    </div>
                    <p className="text-[11px] leading-relaxed mb-3">
                      O'zingizning bepul Google Gemini API kalitingizni bir necha soniyada ulab, barcha post va marketing matnlarini erkin yaratishingiz mumkin.
                    </p>
                    <Link
                      href="/settings"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Sozlamalarga o'tish va kalitni kiritish →</span>
                    </Link>
                  </div>
                )}

                {/* If post content was formulated, render clean action bar */}
                {parsedPlan?.proposedContent && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(parsedPlan.proposedContent)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-[11px] font-medium flex items-center gap-1.5 shadow-2xs transition"
                      >
                        <Copy className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Nusxa olish</span>
                      </button>
                      <Link
                        href={`/create-post?caption=${encodeURIComponent(parsedPlan.proposedContent)}`}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-2xs transition"
                      >
                        <span>Post yaratish bo'limiga o'tkazish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {m.approvalId && (
                      <button
                        onClick={() => handleApprove(m.approvalId!)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tasdiqlash va E'lon qilish</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Collapsible Technical Execution Plan */}
                {m.planJson && !isUnconfigured && (
                  <div className="mt-3 pt-2">
                    <button
                      type="button"
                      onClick={() => toggleJson(idx)}
                      className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-mono"
                    >
                      {expandedJson[idx] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span>{expandedJson[idx] ? "Texnik rejani yashirish" : "Texnik rejani ko'rish (JSON)"}</span>
                    </button>
                    {expandedJson[idx] && (
                      <div className="mt-1.5 p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 font-mono text-[10px] overflow-x-auto text-slate-700 dark:text-slate-300">
                        <pre>{m.planJson}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-11">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>AI yordamchi fikrlamoqda...</span>
          </div>
        )}
      </div>

      {/* Suggestion prompt pills */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition shrink-0 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.assistant.inputPlaceholder}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading || !input.trim()}
          rightIcon={<Send className="w-4 h-4" />}
        >
          {t.assistant.sendBtn}
        </Button>
      </form>
    </div>
  );
}
