"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  RefreshCw,
  MoreVertical,
  ArrowRight,
  Flame
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate?: string;
  createdAt: string;
}

export default function TasksPage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<TaskItem[]>("/productivity/tasks");
      setTasks(data || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await apiRequest<TaskItem>("/productivity/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null
        })
      });
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTasks();
      setNotification(`Task "${title}" created successfully!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert("Failed to create task: " + (err.message || err.detail));
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await apiRequest(`/productivity/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch (err: any) {
      alert("Status update failed: " + (err.message || err.detail));
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === "ALL") return true;
    return t.priority === filterPriority;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === "TODO");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = filteredTasks.filter((t) => t.status === "COMPLETED");

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300";
      case "HIGH":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300";
      case "MEDIUM":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200 border-sky-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
    }
  };

  const renderColumn = (title: string, list: TaskItem[], countBg: string, emptyMsg: string) => (
    <div className="bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col flex-1 min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{title}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${countBg}`}>
            {list.length}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {list.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs italic">{emptyMsg}</div>
        ) : (
          list.map((task) => (
            <div
              key={task.id}
              className="p-3.5 bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {task.title}
                </h4>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                </span>

                <div className="flex items-center gap-1">
                  {task.status === "TODO" && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      Start <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {task.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, "COMPLETED")}
                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      Done <CheckCircle2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {task.status === "COMPLETED" && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, "TODO")}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.tasks}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise workflow execution board: Automated task triage from emails, AI agents, and team assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t.common.refresh}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Priority Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Priority:
        </span>
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterPriority === p
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn(
          "To Do",
          todoTasks,
          "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
          "No tasks waiting to start."
        )}
        {renderColumn(
          "In Progress",
          inProgressTasks,
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
          "No tasks currently underway."
        )}
        {renderColumn(
          "Completed",
          completedTasks,
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          "No completed tasks."
        )}
      </div>

      {/* Modal: Create Task */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              Create Action Item / Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Q4 marketing attribution metrics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Task instructions or background..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
