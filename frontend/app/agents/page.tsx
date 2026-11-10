"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiClient } from "../../lib/api/apiClient";
import { 
  Bot, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ArrowRight,
  Code,
  Shield,
  Layers,
  Send
} from "lucide-react";

interface AgentDef {
  id: string;
  agentCode: string;
  name: string;
  domain: string;
  systemPrompt: string;
  allowedTools: string;
  enabled: boolean;
  executionsCount: number;
}

export default function AgentsPage() {
  const { t, language } = useLanguage();
  const [agents, setAgents] = useState<AgentDef[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentDef | null>(null);
  const [taskPrompt, setTaskPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await apiClient.get<AgentDef[]>("/agents");
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
      }
    } catch (err) {
      console.error("Failed to load agents", err);
    }
  };

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !taskPrompt.trim()) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const res = await apiClient.post(`/agents/${selectedAgent.agentCode}/delegate`, {
        taskPrompt,
        language
      });
      setExecutionResult(res);
      fetchAgents(); // update executionsCount
    } catch (err: any) {
      setExecutionResult({ success: false, errorMessage: err.message || "Execution error" });
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleAgentStatus = async (agent: AgentDef) => {
    try {
      await apiClient.put(`/agents/${agent.agentCode}/toggle`, {
        enabled: !agent.enabled
      });
      fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.agentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-600" />
            <span>{t.nav.agents}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === "uz-Latn"
              ? "18 ta ixtisoslashgan avtonom agentlar: har biriga cheklangan ruxsatlar va alohida vazifalar"
              : language === "ru"
              ? "18 специализированных автономных агентов с минимальными правами и точной специализацией"
              : "18 Specialized Autonomous Agents engineered with least-privilege tool allowlists and domain directives"}
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agents Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{language === "uz-Latn" ? "Ro'yxatdan o'tgan agentlar" : "Registered Specialists"} ({filteredAgents.length})</span>
            <span>Active: {filteredAgents.filter(a => a.enabled).length} / {agents.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAgents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              let tools: string[] = [];
              try { tools = JSON.parse(agent.allowedTools); } catch (e) {}

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {agent.domain}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent); }}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition ${
                          agent.enabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800"
                        }`}
                      >
                        {agent.enabled ? "Active" : "Disabled"}
                      </button>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      {agent.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {agent.systemPrompt}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{agent.executionsCount} runs</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <span>Delegate Task</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Console */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Agent Task Delegation</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  Target: {selectedAgent?.name || "Select Agent"}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                {selectedAgent?.agentCode}
              </span>
            </div>

            {selectedAgent && (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Authorized Tool Allowlists</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedAgent.allowedTools);
                        return parsed.map((tool: string) => (
                          <span key={tool} className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                            {tool}
                          </span>
                        ));
                      } catch (e) {
                        return <span className="text-slate-400">[]</span>;
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleDelegate} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Instruction for {selectedAgent?.name}
              </label>
              <textarea
                rows={4}
                required
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                placeholder={
                  selectedAgent?.agentCode === "RESEARCH"
                    ? "e.g. Conduct a competitor analysis for B2B SaaS in Uzbekistan..."
                    : selectedAgent?.agentCode === "EMAIL"
                    ? "e.g. Draft replies to high-priority client inquiries about API access..."
                    : "Enter task instruction for this specialist..."
                }
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={isExecuting || !taskPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition"
              >
                {isExecuting ? (
                  <span>Executing task...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Delegate to {selectedAgent?.name}</span>
                  </>
                )}
              </button>
            </form>

            {/* Execution Result */}
            {executionResult && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Execution Result</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    {executionResult.tokensUsed || 0} tokens
                  </span>
                </div>

                {executionResult.success ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {executionResult.outputText}
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{executionResult.errorMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
