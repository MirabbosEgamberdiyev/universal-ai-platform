"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  Briefcase,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  Compass,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Copy,
  ChevronRight,
  Layers,
  ArrowRight
} from "lucide-react";

interface BusinessPlan {
  id: string;
  planType: string;
  title: string;
  targetMarket: string;
  executiveSummary: string;
  marketAnalysis: string;
  financialProjections: string;
  status: string;
  createdAt: string;
}

export default function BusinessPage() {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plans" | "research" | "proposal">("plans");

  // Market research form state
  const [industry, setIndustry] = useState("Enterprise B2B SaaS & AI Automation");
  const [competitors, setCompetitors] = useState("Hootsuite, Sprout Social, Zapier, Predis.ai");
  const [geo, setGeo] = useState("Central Asia, MENA & Global Markets");
  const [generatingResearch, setGeneratingResearch] = useState(false);

  // Proposal form state
  const [clientName, setClientName] = useState("Global Retail Group");
  const [scope, setScope] = useState("Full-stack autonomous multi-agent social media & unified inbox automation");
  const [budget, setBudget] = useState("$24,000 / year");
  const [generatingProposal, setGeneratingProposal] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<BusinessPlan[]>("/business/plans");
      setPlans(data || []);
      if (data && data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (err) {
      console.error("Failed to load business plans", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleGenerateResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingResearch(true);
    try {
      const created = await apiRequest<BusinessPlan>("/business/research", {
        method: "POST",
        body: JSON.stringify({ industry, competitors, geo })
      });
      loadPlans();
      setSelectedPlan(created);
      setActiveTab("plans");
      setNotification(`Market Research generated successfully for "${industry}"!`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert("Generation failed: " + (err.message || err.detail));
    } finally {
      setGeneratingResearch(false);
    }
  };

  const handleGenerateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingProposal(true);
    try {
      const created = await apiRequest<BusinessPlan>("/business/proposal", {
        method: "POST",
        body: JSON.stringify({ clientName, scope, budget })
      });
      loadPlans();
      setSelectedPlan(created);
      setActiveTab("plans");
      setNotification(`Commercial proposal for "${clientName}" prepared successfully!`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert("Proposal generation failed: " + (err.message || err.detail));
    } finally {
      setGeneratingProposal(false);
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
            <Briefcase className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.business}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Strategic Business Intelligence: Automated market analysis, competitor intelligence, and executive commercial proposals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "plans"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            Saved Artifacts ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab("research")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "research"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Market Research
          </button>
          <button
            onClick={() => setActiveTab("proposal")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "proposal"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Commercial Proposal
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
          {/* Plan Directory Left (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Generated Reports ({plans.length})
            </h3>
            {loading ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading strategic artifacts...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No business plans generated yet. Launch a Market Research or Commercial Proposal above.
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((p) => {
                  const isSelected = selectedPlan?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p)}
                      className={`p-3 rounded-lg border cursor-pointer transition text-xs space-y-1 ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{p.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {p.planType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">Market: {p.targetMarket}</p>
                      <p className="text-[10px] text-slate-400">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plan Viewer Right (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 overflow-y-auto">
            {selectedPlan ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                      {selectedPlan.planType}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {selectedPlan.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target Market / Client: <strong className="text-slate-700 dark:text-slate-300">{selectedPlan.targetMarket}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedPlan.executiveSummary + "\n\n" + selectedPlan.marketAnalysis)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy All
                  </button>
                </div>

                {/* Section: Executive Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Executive Summary
                  </h4>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedPlan.executiveSummary}
                  </div>
                </div>

                {/* Section: Market & Competitor Analysis */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    Market Landscape & Strategy
                  </h4>
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedPlan.marketAnalysis}
                  </div>
                </div>

                {/* Section: Financials & Budget */}
                {selectedPlan.financialProjections && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                      Financial Terms & Projections
                    </h4>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedPlan.financialProjections}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 text-center">
                <Briefcase className="w-12 h-12 mb-3 opacity-30 text-indigo-500" />
                <p className="text-sm font-semibold">Select a strategic artifact to inspect details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market Research Generator View */}
      {activeTab === "research" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-3xl mx-auto shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              Automated AI Market & Competitor Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Synthesize strategic opportunity analysis, competitive moat evaluation, and addressable TAM/SAM.
            </p>
          </div>

          <form onSubmit={handleGenerateResearch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Industry / Vertical
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Known Competitors (comma separated)
              </label>
              <input
                type="text"
                required
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Geographic Market / Scope
              </label>
              <input
                type="text"
                required
                value={geo}
                onChange={(e) => setGeo(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={generatingResearch}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {generatingResearch ? "Synthesizing Market Intelligence..." : "Generate Market Research Report"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Commercial Proposal Builder View */}
      {activeTab === "proposal" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-3xl mx-auto shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              Executive Commercial Proposal Builder
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate structured, client-ready proposals with deliverables, implementation timeline, and fee structure.
            </p>
          </div>

          <form onSubmit={handleGenerateProposal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Prospect Organization
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Scope & Requirements
              </label>
              <textarea
                rows={3}
                required
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proposed Pricing / Budget
              </label>
              <input
                type="text"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={generatingProposal}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {generatingProposal ? "Drafting Commercial Proposal..." : "Generate Executive Proposal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
