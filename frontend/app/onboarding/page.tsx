"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  Sparkles,
  Building,
  Sliders,
  Share2,
  Bot,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Send,
  Globe
} from "lucide-react";

export default function OnboardingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { activeOrg, user } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1: Workspace
  const [workspaceName, setWorkspaceName] = useState(activeOrg?.name || "Acme Growth Labs");
  const [industry, setIndustry] = useState("Technology & SaaS");
  const [autonomyMode, setAutonomyMode] = useState("OPERATOR");

  // Step 2: Brand Voice
  const [tone, setTone] = useState("Professional, Authoritative, yet Conversational");
  const [targetAudience, setTargetAudience] = useState("B2B Founders, Marketing Directors, Tech Enthusiasts");
  const [bannedKeywords, setBannedKeywords] = useState("cheap, hack, guaranteed 100x");

  // Step 3: Channel
  const [selectedChannel, setSelectedChannel] = useState("TELEGRAM");
  const [channelHandle, setChannelHandle] = useState("@my_company_channel");

  // Step 4: First Task
  const [selectedAgent, setSelectedAgent] = useState("MARKETING");
  const [firstPrompt, setFirstPrompt] = useState("Draft our launch announcement for OmniAgent across LinkedIn and Telegram.");
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      // Delegate initial task to verify end-to-end setup
      await apiRequest(`/agents/${selectedAgent}/delegate`, {
        method: "POST",
        body: JSON.stringify({
          taskPrompt: firstPrompt,
          contextPayload: {
            workspace: workspaceName,
            tone,
            targetAudience
          }
        })
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding delegation error:", err);
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to OmniAgent
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure your autonomous enterprise assistant in 4 guided steps.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
        {[
          { num: 1, label: "Workspace" },
          { num: 2, label: "Brand Voice" },
          { num: 3, label: "Channels" },
          { num: 4, label: "First Task" },
        ].map((s) => {
          const isCompleted = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950"
                    : "bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Card Content Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Step 1: Workspace & Autonomy Mode */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                Step 1: Workspace Identity & Safety Mode
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Name your organization and choose your initial AI delegation boundary.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Industry / Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Default Autonomy Safety Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "OPERATOR", title: "Mode 3: Operator (Recommended)", desc: "AI drafts actions; human approval strictly required before dispatch." },
                    { id: "CREATOR", title: "Mode 2: Creator", desc: "AI generates assets and schedules; no automated live publications." },
                    { id: "ADVISOR", title: "Mode 1: Advisor", desc: "AI provides strategic recommendations; user executes manually." },
                    { id: "AUTOPILOT", title: "Mode 4: Autopilot", desc: "Autonomous publishing for trusted channels within approved guardrails." },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setAutonomyMode(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1 ${
                        autonomyMode === m.id
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white block">{m.title}</span>
                      <p className="text-[11px] text-slate-500">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Brand Voice Directives */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Step 2: Brand Voice & AI Directives
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure guidelines injected into the system prompt of every specialist agent.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tone of Voice
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience Persona
                </label>
                <textarea
                  rows={2}
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Restricted / Banned Terminology
                </label>
                <input
                  type="text"
                  value={bannedKeywords}
                  onChange={(e) => setBannedKeywords(e.target.value)}
                  placeholder="Terms the AI must never generate..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Connect Channels */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                Step 3: Connect First Distribution Channel
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your primary social or messaging platform to link.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "TELEGRAM", name: "Telegram Hub", desc: "Channels & Groups" },
                { id: "INSTAGRAM", name: "Instagram", desc: "Feed & Reels" },
                { id: "LINKEDIN", name: "LinkedIn", desc: "Company & Profile" },
                { id: "GMAIL", name: "Email", desc: "Google Workspace" },
              ].map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedChannel(c.id)}
                  className={`p-4 rounded-xl border cursor-pointer text-center space-y-1 transition ${
                    selectedChannel === c.id
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">{c.name}</span>
                  <span className="text-[10px] text-slate-500 block">{c.desc}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Channel / Account Identifier
              </label>
              <input
                type="text"
                value={channelHandle}
                onChange={(e) => setChannelHandle(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Step 4: First Autonomous Task */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                Step 4: Launch Your First Specialist Agent
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose an agent from the 18-Specialist Suite and instruct them with your first directive.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Specialist
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="MARKETING">Marketing Strategy Agent (MARKETING)</option>
                  <option value="SOCIAL_MEDIA">Social Media Agent (SOCIAL_MEDIA)</option>
                  <option value="CONTENT_CREATION">Content Creation Agent (CONTENT_CREATION)</option>
                  <option value="RESEARCH">Research & Intelligence Agent (RESEARCH)</option>
                  <option value="BUSINESS_INTELLIGENCE">Business Intelligence Agent (BI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Prompt / Objective
                </label>
                <textarea
                  rows={4}
                  value={firstPrompt}
                  onChange={(e) => setFirstPrompt(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Resulting plan will be placed into your <strong>Approval Center</strong> under Mode 3 HITL safety governance.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              {submitting ? "Initializing Platform..." : "Complete Setup & Launch"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
