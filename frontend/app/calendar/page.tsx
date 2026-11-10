"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Send,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function CalendarPage() {
  const { t } = useLanguage();
  const [calendarPosts, setCalendarPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const posts = await apiRequest<any[]>("/publications/calendar");
      setCalendarPosts(posts);
    } catch (e) {
      console.error("Failed to load calendar:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.calendar}</h1>
          <p className="text-xs text-slate-500">Visual timetable of past, current, and upcoming scheduled publications.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadCalendar} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
            {t.common.refresh}
          </button>
        </div>
      </div>

      {/* Calendar List / Grid view */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-500" />
          <span>Scheduled Operations Feed</span>
        </h2>

        <div className="space-y-3">
          {calendarPosts.map((post) => (
            <div
              key={post.jobId}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {post.channelType}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.title}</span>
                  <span className="text-[11px] text-slate-400">Target: {post.channelTitle}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{post.bodySnippet}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(post.scheduledFor).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    post.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : post.status === "SCHEDULED"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {post.status}
                </span>

                {post.liveUrl && (
                  <a
                    href={post.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:text-indigo-500 text-slate-600 transition"
                    title="View live publication"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {calendarPosts.length === 0 && !loading && (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No scheduled posts found. Go to Content Studio or instruct OmniAgent to schedule content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
