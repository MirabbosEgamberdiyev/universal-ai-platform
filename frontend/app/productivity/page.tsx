"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { CheckSquare, Calendar, Plus, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function ProductivityPage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [briefing, setBriefing] = useState<any>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const loadData = async () => {
    try {
      const b = await apiRequest<any>("/productivity/briefing");
      setBriefing(b);
      const tList = await apiRequest<any[]>("/productivity/tasks");
      setTasks(tList);
      const eList = await apiRequest<any[]>("/productivity/events");
      setEvents(eList);
    } catch (e) {
      console.error("Productivity load error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await apiRequest<any>("/productivity/tasks", {
        method: "POST",
        body: JSON.stringify({ title, priority, description: "" }),
      });
      setTitle("");
      setShowAddTask(false);
      loadData();
    } catch (e: any) {
      alert("Error adding task: " + (e?.detail || e?.message));
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";
    try {
      await apiRequest<any>(`/productivity/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      loadData();
    } catch (e: any) {
      alert("Error updating task: " + (e?.detail || e?.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.productivity}</h1>
          <p className="text-xs text-slate-500">Personal schedule, Google Calendar synchronization, tasks, and daily executive briefing.</p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Task
        </button>
      </div>

      {/* Morning Briefing Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Today's Morning Executive Briefing</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            You have {briefing?.scheduledMeetingsCount || 0} scheduled meeting(s), {briefing?.pendingTasksCount || 0} priority task(s), and {briefing?.pendingPostApprovalsCount || 0} post approval(s) requiring your review today.
          </p>
        </div>
      </div>

      {/* 2-Column Task and Calendar Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks List */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-500" />
              <span>Prioritized Tasks</span>
            </h2>
            <span className="text-xs text-slate-400">{tasks.length} tasks</span>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.status)}
                className={`p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer transition ${
                  task.status === "COMPLETED" ? "bg-slate-50 dark:bg-slate-950/40 opacity-60" : "bg-slate-50/50 dark:bg-slate-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`w-4 h-4 ${task.status === "COMPLETED" ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}`}
                  />
                  <span className={`text-xs font-semibold ${task.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                    {task.title}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {task.priority}
                </span>
              </div>
            ))}

            {tasks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">All tasks completed. Click "Add Task" to record a new one.</p>
            )}
          </div>
        </div>

        {/* Calendar Events */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>Upcoming Meetings</span>
            </h2>
            <span className="text-xs text-slate-400">{events.length} events</span>
          </div>

          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{ev.title}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(ev.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(ev.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </p>
                </div>
                <span className="text-[10px] text-indigo-500 font-semibold">{ev.location || "Online"}</span>
              </div>
            ))}

            {events.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Zero upcoming meetings in connected calendar.</p>
            )}
          </div>
        </div>
      </div>

      {showAddTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Task Title (e.g. Call marketing client about Q4 budget)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
