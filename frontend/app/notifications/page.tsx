"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  MessageSquare, 
  Check, 
  ExternalLink,
  Trash2
} from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "APPROVAL" | "SUCCESS" | "WARNING" | "MESSAGE";
  timestamp: string;
  read: boolean;
  linkHref?: string;
  linkLabel?: string;
}

export default function NotificationsPage() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Mode 3 Approval Required",
      message: "OmniAgent generated a multi-channel campaign post for Instagram and Telegram. Review execution payload before publication.",
      type: "APPROVAL",
      timestamp: "5 minutes ago",
      read: false,
      linkHref: "/approvals",
      linkLabel: "Review Approval"
    },
    {
      id: "notif-2",
      title: "Publication Verified & Live",
      message: "Post successfully published to Telegram Channel (@tech_updates). Message ID: 1042.",
      type: "SUCCESS",
      timestamp: "1 hour ago",
      read: false,
      linkHref: "/calendar",
      linkLabel: "View in Calendar"
    },
    {
      id: "notif-3",
      title: "New High-Priority Inbox Lead",
      message: "Customer inquired about enterprise pricing on Instagram Direct Message. 24-hour response window active.",
      type: "MESSAGE",
      timestamp: "3 hours ago",
      read: true,
      linkHref: "/inbox",
      linkLabel: "Open Inbox"
    },
    {
      id: "notif-4",
      title: "Token Expiration Warning",
      message: "LinkedIn OAuth access token will expire in 7 days. Re-authorization recommended.",
      type: "WARNING",
      timestamp: "1 day ago",
      read: true,
      linkHref: "/accounts",
      linkLabel: "Check Accounts"
    }
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "APPROVAL":
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
      case "SUCCESS":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case "MESSAGE":
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
    }
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.read : true));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            <span>
              {language === "uz-Latn" ? "Tizim bildirishnomalari" : language === "ru" ? "Уведомления" : "Notifications"}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === "uz-Latn"
              ? "Muhim amallar, nashr hisobotlari va kutilayotgan tasdiqlar"
              : language === "ru"
              ? "Оповещения о событиях, отчетах публикаций и запросах подтверждения"
              : "Real-time updates on agent task execution, approvals, and platform alerts"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{language === "uz-Latn" ? "Barchasini o'qilgan qilish" : language === "ru" ? "Прочитать все" : "Mark all as read"}</span>
          </button>
          <button
            onClick={clearAll}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === "ALL"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
          }`}
        >
          {language === "uz-Latn" ? "Barchasi" : language === "ru" ? "Все" : "All"} ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === "UNREAD"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
          }`}
        >
          {language === "uz-Latn" ? "O'qilmagan" : language === "ru" ? "Непрочитанные" : "Unread"} (
          {notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            {language === "uz-Latn" ? "Bildirishnomalar yo'q" : language === "ru" ? "Нет новых уведомлений" : "No notifications found"}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition flex items-start gap-4 ${
                !item.read
                  ? "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-xs"
                  : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80"
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{item.title}</span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.message}
                </p>

                {item.linkHref && (
                  <div className="pt-2">
                    <Link
                      href={item.linkHref}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>{item.linkLabel || "View Details"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
