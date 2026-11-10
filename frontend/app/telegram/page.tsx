"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { Send, Shield, Bell, CheckCircle, AlertTriangle, MessageSquare, Plus } from "lucide-react";

export default function TelegramPage() {
  const { t } = useLanguage();
  const [channels, setChannels] = useState<any[]>([]);
  const [antiSpamActive, setAntiSpamActive] = useState(true);
  const [welcomeActive, setWelcomeActive] = useState(true);

  useEffect(() => {
    loadTelegramData();
  }, []);

  const loadTelegramData = async () => {
    try {
      const chs = await apiRequest<any[]>("/accounts/channels");
      setChannels(chs.filter((c) => c.channelType.startsWith("TG_")));
    } catch (e) {
      console.error("Failed to load Telegram channels:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.telegram}</h1>
        <p className="text-xs text-slate-500">Dedicated Telegram Bot, Broadcast Channel & Discussion Group Moderation Center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linked Channels Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Send className="w-4 h-4 text-blue-500" />
              <span>Connected Telegram Channels & Groups</span>
            </div>
            <span className="text-xs text-slate-400">{channels.length} linked</span>
          </div>

          <div className="space-y-2">
            {channels.map((ch) => (
              <div key={ch.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{ch.title}</p>
                  <p className="text-[10px] text-slate-400">ID: {ch.externalChannelId}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {ch.channelType}
                </span>
              </div>
            ))}

            {channels.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                No Telegram channels linked yet. Add your bot as Administrator in your channel, then link it in Social Accounts.
              </p>
            )}
          </div>
        </div>

        {/* Group Moderation & Anti-Spam */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Community Shield & Automated Moderation</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">AI Anti-Spam & Phishing Shield</p>
                <p className="text-[10px] text-slate-400">Automatically deletes spam links and crypto phishing in discussion groups.</p>
              </div>
              <input
                type="checkbox"
                checked={antiSpamActive}
                onChange={(e) => setAntiSpamActive(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">New Member Welcome Message</p>
                <p className="text-[10px] text-slate-400">Sends automated bilingual greeting with community rules.</p>
              </div>
              <input
                type="checkbox"
                checked={welcomeActive}
                onChange={(e) => setWelcomeActive(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
