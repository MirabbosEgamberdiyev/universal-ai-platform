"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  GitFork,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare
} from "lucide-react";

export default function WorkflowsPage() {
  const { t } = useLanguage();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<any[]>("/workflows");
      setWorkflows(data);
    } catch (e) {
      console.error("Failed to load workflows:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await apiRequest<any>("/workflows", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: desc,
          graphDefinition: JSON.stringify({
            nodes: [
              { id: "1", type: "TRIGGER", label: "New Telegram Inbound Message" },
              { id: "2", type: "AI_STEP", label: "AI Sentiment & Intent Triage" },
              { id: "3", type: "APPROVAL", label: "Mode 3 Human Review Gate" },
              { id: "4", type: "ACTION", label: "Send Telegram Reply" },
            ],
          }),
        }),
      });
      setName("");
      setDesc("");
      setShowCreateModal(false);
      loadWorkflows();
    } catch (e: any) {
      alert("Failed to create workflow: " + (e?.detail || e?.message));
    }
  };

  const handleTrigger = async (workflowId: string) => {
    try {
      await apiRequest<any>(`/workflows/${workflowId}/trigger`, {
        method: "POST",
        body: JSON.stringify({ triggerType: "MANUAL_TEST" }),
      });
      alert("Workflow execution triggered successfully!");
    } catch (e: any) {
      alert("Execution error: " + (e?.detail || e?.message));
    }
  };

  const handleToggle = async (workflowId: string) => {
    try {
      await apiRequest<any>(`/workflows/${workflowId}/toggle`, { method: "POST" });
      loadWorkflows();
    } catch (e: any) {
      alert("Toggle error: " + (e?.detail || e?.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.workflows}</h1>
          <p className="text-xs text-slate-500">Visual event-driven automations, triggers, conditions, and durable Saga execution.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workflows.map((wf) => (
          <div key={wf.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{wf.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${wf.active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-200 text-slate-600 dark:bg-slate-800"}`}>
                    {wf.active ? "ACTIVE" : "PAUSED"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{wf.description || "No description provided."}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(wf.id)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
                >
                  {wf.active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                  <span>{wf.active ? "Active" : "Disabled"}</span>
                </button>
                <button
                  onClick={() => handleTrigger(wf.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" /> Test Run
                </button>
              </div>
            </div>

            {/* Visual Node Flow Mockup */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Inbound Telegram Message
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Triage & Draft Reply
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Mode 3 Approval Gate
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Dispatch Outbound Message
              </div>
            </div>
          </div>
        ))}

        {workflows.length === 0 && !loading && (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No workflows created yet. Click "Create Workflow" to automate your operations.
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Automation Workflow</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Workflow Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telegram FAQ Auto-Responder with Approval"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the trigger and goal..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
