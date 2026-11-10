"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  Send,
  Instagram,
  Youtube,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Plus,
  RefreshCw,
  HelpCircle,
  Lock,
  Layers,
  Radio,
  Check,
  ChevronRight,
  Info
} from "lucide-react";

interface ConnectedAccount {
  id: string;
  organizationId: string;
  platform: string;
  platformAccountId: string;
  accountName: string;
  username?: string;
  accountType: string;
  status: string;
  createdAt: string;
}

interface Channel {
  id: string;
  organizationId: string;
  connectedAccountId: string;
  platform: string;
  externalChannelId: string;
  title: string;
  channelType: string;
  active: boolean;
  createdAt: string;
}

export default function AccountsPage() {
  const { t, language } = useLanguage();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  // Telegram Connect Modal
  const [showTgModal, setShowTgModal] = useState(false);
  const [tgStep, setTgStep] = useState(1);
  const [botToken, setBotToken] = useState("");
  const [connectingTg, setConnectingTg] = useState(false);
  const [createdTgAccount, setCreatedTgAccount] = useState<ConnectedAccount | null>(null);
  const [tgChannelTitle, setTgChannelTitle] = useState("");
  const [tgChannelChatId, setTgChannelChatId] = useState("");
  const [tgChannelType, setTgChannelType] = useState("TG_CHANNEL");

  // Instagram Connect Modal
  const [showIgModal, setShowIgModal] = useState(false);
  const [igAccountId, setIgAccountId] = useState("");
  const [igAccountName, setIgAccountName] = useState("");
  const [igToken, setIgToken] = useState("");
  const [connectingIg, setConnectingIg] = useState(false);

  // YouTube Connect Modal
  const [showYtModal, setShowYtModal] = useState(false);
  const [ytChannelId, setYtChannelId] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [ytToken, setYtToken] = useState("");
  const [connectingYt, setConnectingYt] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const accs = await apiRequest<ConnectedAccount[]>("/accounts");
      setAccounts(Array.isArray(accs) ? accs : []);

      const chs = await apiRequest<Channel[]>("/accounts/channels");
      setChannels(Array.isArray(chs) ? chs : []);
    } catch (e) {
      console.error("Accounts load error:", e);
      setAccounts([]);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Connect Telegram Bot Step 1 & 2
  const handleVerifyTelegramBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim()) return;

    try {
      setConnectingTg(true);
      const acc = await apiRequest<ConnectedAccount>("/accounts/telegram/connect-bot", {
        method: "POST",
        body: JSON.stringify({ botToken: botToken.trim() }),
      });
      setCreatedTgAccount(acc);
      setTgStep(2);
      loadData();
    } catch (err: any) {
      alert("Telegram bot ulanmadi: " + (err?.detail || err?.message || "Token yaroqsiz"));
    } finally {
      setConnectingTg(false);
    }
  };

  // Connect Telegram Channel Step 2
  const handleCompleteTelegramChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdTgAccount || !tgChannelChatId.trim()) return;

    try {
      setConnectingTg(true);
      await apiRequest<Channel>("/accounts/telegram/add-channel", {
        method: "POST",
        body: JSON.stringify({
          accountId: createdTgAccount.id,
          channelChatId: tgChannelChatId.trim(),
          title: tgChannelTitle.trim() || "Telegram Channel",
          channelType: tgChannelType,
        }),
      });
      setShowTgModal(false);
      setBotToken("");
      setTgChannelChatId("");
      setTgChannelTitle("");
      setTgStep(1);
      setCreatedTgAccount(null);
      loadData();
    } catch (err: any) {
      alert("Kanal qo'shishda xatolik: " + (err?.detail || err?.message));
    } finally {
      setConnectingTg(false);
    }
  };

  // 2. Connect Instagram
  const handleConnectInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!igToken.trim()) {
      alert("Iltimos, Meta Access Tokenni kiriting");
      return;
    }
    try {
      setConnectingIg(true);
      await apiRequest<ConnectedAccount>("/accounts/meta/connect", {
        method: "POST",
        body: JSON.stringify({
          platformAccountId: igAccountId || "178414000123456",
          accountName: igAccountName || "Instagram Business Account",
          accessToken: igToken.trim(),
        }),
      });
      setShowIgModal(false);
      setIgAccountId("");
      setIgAccountName("");
      setIgToken("");
      loadData();
    } catch (err: any) {
      alert("Instagram ulanmadi: " + (err?.detail || err?.message));
    } finally {
      setConnectingIg(false);
    }
  };

  // 3. Connect YouTube
  const handleConnectYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytToken.trim()) {
      alert("Iltimos, Google OAuth Access Tokenni kiriting");
      return;
    }
    try {
      setConnectingYt(true);
      await apiRequest<ConnectedAccount>("/accounts/youtube/connect", {
        method: "POST",
        body: JSON.stringify({
          channelId: ytChannelId || "UC_" + Math.random().toString(36).substring(2, 12),
          title: ytTitle || "YouTube Creator Channel",
          accessToken: ytToken.trim(),
        }),
      });
      setShowYtModal(false);
      setYtChannelId("");
      setYtTitle("");
      setYtToken("");
      loadData();
    } catch (err: any) {
      alert("YouTube ulanmadi: " + (err?.detail || err?.message));
    } finally {
      setConnectingYt(false);
    }
  };

  // Disconnect Account
  const handleDisconnect = async (accountId: string, name: string) => {
    if (!confirm(`"${name}" akkauntini platformadan uzishni tasdiqlaysizmi?`)) return;
    try {
      await apiRequest(`/accounts/${accountId}`, { method: "DELETE" });
      loadData();
    } catch (e: any) {
      alert("Akkauntni uzishda xatolik: " + (e?.detail || e?.message));
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{t.accounts.title}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.accounts.subtitle}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition self-start md:self-center shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{t.accounts.refreshBtn}</span>
        </button>
      </div>

      {/* CORE INTEGRATIONS (Tier 1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.accounts.coreSection}
          </h2>
          <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.accounts.tokenVaultProtected}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Instagram Professional Card */}
          <Card variant="interactive" className="p-5 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center border border-pink-200 dark:border-pink-800">
                  <Instagram className="w-5 h-5" />
                </div>
                <Badge variant="brand" size="sm">
                  CORE PLATFORM
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">
                {t.accounts.instagramTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.accounts.instagramDesc}
              </p>

              {/* Supported Capabilities */}
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60">
                  Single Image
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60">
                  Reels
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60">
                  Carousels
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIgModal(true)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs shadow-sm shadow-pink-600/25 transition active:translate-y-px flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ {t.accounts.connectBtn} Instagram</span>
            </button>
          </Card>

          {/* 2. Telegram Bot Card */}
          <Card variant="interactive" className="p-5 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center border border-sky-200 dark:border-sky-800">
                  <Send className="w-5 h-5" />
                </div>
                <Badge variant="brand" size="sm">
                  CORE PLATFORM
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">
                {t.accounts.telegramTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.accounts.telegramDesc}
              </p>

              {/* Supported Capabilities */}
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                  Channel Broadcast
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                  Media Albums
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                  Bot API v7.2
                </span>
              </div>
            </div>

            <button
              onClick={() => { setTgStep(1); setShowTgModal(true); }}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm shadow-sky-600/25 transition active:translate-y-px flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>+ {t.accounts.connectBtn} Telegram Bot</span>
            </button>
          </Card>

          {/* 3. YouTube Creator Channel Card */}
          <Card variant="interactive" className="p-5 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                  <Youtube className="w-5 h-5" />
                </div>
                <Badge variant="brand" size="sm">
                  CORE PLATFORM
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">
                {t.accounts.youtubeTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.accounts.youtubeDesc}
              </p>

              {/* Supported Capabilities */}
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                  Resumable Upload
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                  Shorts
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                  Data API v3
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowYtModal(true)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm shadow-rose-600/25 transition active:translate-y-px flex items-center justify-center gap-1.5"
            >
              <Youtube className="w-4 h-4" />
              <span>+ {t.accounts.connectBtn} YouTube</span>
            </button>
          </Card>
        </div>
      </div>

      {/* OPTIONAL INTEGRATIONS (Tier 2 - Honest Gating) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t.accounts.optionalSection}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TikTok Gated */}
          <Card variant="flat" className="p-5 flex items-start gap-4 opacity-90">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {t.accounts.tiktokTitle}
                </h4>
                <Badge variant="warning" size="sm">
                  {t.accounts.approvalPending}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.accounts.tiktokDesc}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Zero-Mock: Tijoriy audit tasdiqlanmaguncha soxta post chiqarish simulyatsiya qilinmaydi.</span>
              </p>
            </div>
          </Card>

          {/* LinkedIn Gated */}
          <Card variant="flat" className="p-5 flex items-start gap-4 opacity-90">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {t.accounts.linkedinTitle}
                </h4>
                <Badge variant="brand" size="sm">
                  {t.accounts.partnerGated}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.accounts.linkedinDesc}
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Zero-Mock: Rasmiy LinkedIn Community Management API ruxsati kutilyapti.</span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ACTIVE CONNECTED ACCOUNTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500" />
            <span>{t.accounts.activeAccountsTitle}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {accounts.length}
            </span>
          </h2>
        </div>

        {accounts.length === 0 ? (
          <EmptyState
            icon={<Radio className="w-8 h-8 text-slate-400" />}
            title={t.accounts.noAccountsTitle}
            description={t.accounts.noAccountsDesc}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const accChannels = channels.filter((c) => c.connectedAccountId === acc.id);
              const p = acc.platform.toUpperCase();

              return (
                <Card key={acc.id} variant="default" className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {p === "INSTAGRAM" && <Instagram className="w-5 h-5 text-pink-600" />}
                        {p === "TELEGRAM" && <Send className="w-5 h-5 text-sky-500" />}
                        {p === "YOUTUBE" && <Youtube className="w-5 h-5 text-rose-600" />}
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {acc.platform}
                        </span>
                      </div>

                      <Badge variant="success" size="sm">
                        {acc.status}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3 truncate" title={acc.accountName}>
                      {acc.accountName}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      ID: {acc.platformAccountId}
                    </p>

                    {/* Linked Channels list */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Faol kanallar ({accChannels.length}):
                      </p>
                      {accChannels.length === 0 ? (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">
                          Hali kanal biriktirilmagan
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {accChannels.map((ch) => (
                            <div key={ch.id} className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span className="truncate">{ch.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {ch.externalChannelId}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {new Date(acc.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDisconnect(acc.id, acc.accountName)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.accounts.disconnectBtn}</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Connect Telegram */}
      <Modal
        isOpen={showTgModal}
        onClose={() => setShowTgModal(false)}
        title="Telegram Bot va Kanalini Ulash"
        description="BotFather orqali yaratilgan bot tokenini kiriting va kanalingizga admin qiling."
      >
        {tgStep === 1 ? (
          <form onSubmit={handleVerifyTelegramBot} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telegram Bot Token
              </label>
              <input
                type="text"
                required
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Telegramda @BotFather ga /newbot buyrug'ini yuboring va olingan tokenni joylang.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTgModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={connectingTg}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {connectingTg && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Tekshirish va Davom etish &rarr;</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCompleteTelegramChannel} className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Bot muvaffaqiyatli tekshirildi: <b>{createdTgAccount?.accountName}</b></span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kanal Nomi
              </label>
              <input
                type="text"
                required
                value={tgChannelTitle}
                onChange={(e) => setTgChannelTitle(e.target.value)}
                placeholder="Masalan: NovaSphere Rasmiy Kanal"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kanal Chat ID yoki @username
              </label>
              <input
                type="text"
                required
                value={tgChannelChatId}
                onChange={(e) => setTgChannelChatId(e.target.value)}
                placeholder="-1001234567890 yoki @kanal_nomi"
                className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                <b>Eslatma:</b> Botingizni ushbu kanalga admin qilib tayinlashingiz shart.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTgModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Yopish
              </button>
              <button
                type="submit"
                disabled={connectingTg}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs flex items-center gap-1.5"
              >
                {connectingTg && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Kanalni Biriktirish</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: Connect Instagram */}
      <Modal
        isOpen={showIgModal}
        onClose={() => setShowIgModal(false)}
        title="Instagram Professional Akkauntni Ulash"
        description="Meta Graph API orqali professional Instagram akkauntingizni ulang."
      >
        <form onSubmit={handleConnectInstagram} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Instagram Akkaunt Nomi
            </label>
            <input
              type="text"
              value={igAccountName}
              onChange={(e) => setIgAccountName(e.target.value)}
              placeholder="Masalan: @my_brand_uz"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Meta Graph Access Token
            </label>
            <input
              type="password"
              required
              value={igToken}
              onChange={(e) => setIgToken(e.target.value)}
              placeholder="EAA..."
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Meta for Developers konsolida <code>instagram_basic</code> va <code>instagram_content_publish</code> ruxsatlari bo'lgan token talab qilinadi.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowIgModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={connectingIg}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white shadow-xs flex items-center gap-1.5"
            >
              {connectingIg && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Instagram Akkauntni Ulash</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Connect YouTube */}
      <Modal
        isOpen={showYtModal}
        onClose={() => setShowYtModal(false)}
        title="YouTube Creator Kanalni Ulash"
        description="Google Cloud Console orqali olingan YouTube Data API v3 tokeni bilan kanalni ulang."
      >
        <form onSubmit={handleConnectYouTube} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kanal Nomi
            </label>
            <input
              type="text"
              value={ytTitle}
              onChange={(e) => setYtTitle(e.target.value)}
              placeholder="Masalan: NovaSphere Official Studio"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google OAuth Access Token
            </label>
            <input
              type="password"
              required
              value={ytToken}
              onChange={(e) => setYtToken(e.target.value)}
              placeholder="ya29.a0..."
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Google OAuth Playground orqali <code>https://www.googleapis.com/auth/youtube.upload</code> ruxsati bilan olingan token.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowYtModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={connectingYt}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs flex items-center gap-1.5"
            >
              {connectingYt && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>YouTube Kanalni Ulash</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
