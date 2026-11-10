"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  Video,
  Sparkles,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ListTodo,
  FileText,
  Copy,
  Plus,
  RefreshCw,
  Layers,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface AgendaResult {
  topic: string;
  durationMinutes: number;
  suggestedAgenda: string;
}

interface MeetingAnalysisResult {
  meetingTitle: string;
  executiveSummary: string;
  keyDecisions: string[];
  actionItems: string[];
  createdTasks?: any[];
}

export default function MeetingIntelligencePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"agenda" | "summarize" | "history">("summarize");

  // Agenda Form
  const [agendaTopic, setAgendaTopic] = useState("Q4 Product Roadmap & Architecture Review");
  const [agendaDuration, setAgendaDuration] = useState(45);
  const [agendaParticipants, setAgendaParticipants] = useState("CTO, Principal Architect, Frontend Lead, QA Lead");
  const [generatingAgenda, setGeneratingAgenda] = useState(false);
  const [agendaResult, setAgendaResult] = useState<AgendaResult | null>(null);

  // Summarizer Form
  const [meetingTitle, setMeetingTitle] = useState("OmniAgent Enterprise Release Sign-off");
  const [transcript, setTranscript] = useState(
    "CTO: Welcome everyone. We've completed testing on 22 specialized agents and all 34 database tables. Principal Architect: Redis port collision was resolved by mapping to 6389, and all 22 backend unit tests are 100% passing. Frontend Lead: 38 Next.js static routes compiled without any TypeScript errors. Security Lead: Token Vault envelope encryption and prompt injection quarantine heuristics are verified. CTO: Excellent, we officially approve production release and we need QA to run final E2E verification by Friday."
  );
  const [autoCreateTasks, setAutoCreateTasks] = useState(true);
  const [analyzingMeeting, setAnalyzingMeeting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MeetingAnalysisResult | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const handleGenerateAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingAgenda(true);
    try {
      const res = await apiRequest<AgendaResult>("/productivity/meetings/agenda", {
        method: "POST",
        body: JSON.stringify({
          topic: agendaTopic,
          durationMinutes: agendaDuration,
          participants: agendaParticipants
        })
      });
      setAgendaResult(res);
      setNotification("Meeting agenda synthesized successfully!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert("Agenda generation failed: " + (err.message || err.detail));
    } finally {
      setGeneratingAgenda(false);
    }
  };

  const handleSummarizeMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    setAnalyzingMeeting(true);
    try {
      const res = await apiRequest<MeetingAnalysisResult>("/productivity/meetings/summarize", {
        method: "POST",
        body: JSON.stringify({
          meetingTitle,
          transcript,
          autoCreateTasks
        })
      });
      setAnalysisResult(res);
      setNotification(`Meeting analyzed! ${res.actionItems?.length || 0} action items converted to Tasks.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert("Meeting analysis failed: " + (err.message || err.detail));
    } finally {
      setAnalyzingMeeting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification("Copied content to clipboard!");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.meetings}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise Meeting Intelligence: AI agenda synthesis, multi-speaker transcript summarization, and automated task conversion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("summarize")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "summarize"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Transcript Intelligence
          </button>
          <button
            onClick={() => setActiveTab("agenda")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "agenda"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Agenda Builder
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Tab: Transcript Intelligence */}
      {activeTab === "summarize" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Analyze Meeting Transcript
            </h3>
            <form onSubmit={handleSummarizeMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transcript / Meeting Notes
                </label>
                <textarea
                  rows={8}
                  required
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoCreateTasks"
                  checked={autoCreateTasks}
                  onChange={(e) => setAutoCreateTasks(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="autoCreateTasks" className="text-xs text-slate-700 dark:text-slate-300">
                  Automatically convert extracted Action Items into Task Board tasks
                </label>
              </div>

              <button
                type="submit"
                disabled={analyzingMeeting}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {analyzingMeeting ? "Extracting Intelligence..." : "Process Transcript"}
              </button>
            </form>
          </div>

          {/* Right Results (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs overflow-y-auto">
            {analysisResult ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {analysisResult.meetingTitle}
                    </h2>
                    <span className="text-[11px] text-slate-400">Meeting Intelligence Synthesis</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(analysisResult.executiveSummary)}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>

                {/* Section: Executive Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Executive Summary
                  </h4>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {analysisResult.executiveSummary}
                  </div>
                </div>

                {/* Section: Key Decisions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Key Decisions Made
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.keyDecisions?.map((dec, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{dec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Action Items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5 text-indigo-500" /> Action Items & Assigned Tasks
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.actionItems?.map((act, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-semibold">{act}</span>
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                          Assigned
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <Video className="w-12 h-12 mb-3 opacity-30 text-indigo-500" />
                <p className="text-sm font-semibold">Paste meeting notes or transcript on the left to extract intelligence</p>
                <p className="text-xs text-slate-500 mt-1">OmniAgent automatically synthesizes summaries, decisions, and tasks.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Agenda Builder */}
      {activeTab === "agenda" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-3xl mx-auto shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Automated Time-Boxed Agenda Generator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate structured, high-efficiency agendas tailored to participants and allocated meeting duration.
            </p>
          </div>

          <form onSubmit={handleGenerateAgenda} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Topic / Objective
              </label>
              <input
                type="text"
                required
                value={agendaTopic}
                onChange={(e) => setAgendaTopic(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={agendaDuration}
                  onChange={(e) => setAgendaDuration(parseInt(e.target.value) || 30)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Participants
                </label>
                <input
                  type="text"
                  value={agendaParticipants}
                  onChange={(e) => setAgendaParticipants(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generatingAgenda}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {generatingAgenda ? "Synthesizing Agenda..." : "Generate Structured Agenda"}
            </button>
          </form>

          {agendaResult && (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Proposed Agenda ({agendaResult.durationMinutes} min)
                </span>
                <button
                  onClick={() => copyToClipboard(agendaResult.suggestedAgenda)}
                  className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Agenda
                </button>
              </div>
              <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {agendaResult.suggestedAgenda}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
