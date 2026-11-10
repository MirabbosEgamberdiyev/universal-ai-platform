"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "../../lib/api/apiClient";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import {
  Send,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Instagram,
  Youtube,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  Eye,
  AlertTriangle,
  RotateCw,
  Plus
} from "lucide-react";

interface PublicationHistoryItem {
  jobId: string;
  contentId: string;
  title: string | null;
  bodyText: string | null;
  mediaUrls: string[];
  channelId: string;
  channelTitle: string;
  platform: string;
  status: string;
  platformPostId: string | null;
  postUrl: string | null;
  errorMessage: string | null;
  scheduledFor: string | null;
  publishedAt: string | null;
}

export default function PublishedPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [items, setItems] = useState<PublicationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<{ [key: string]: string }>({});

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedItemForModal, setSelectedItemForModal] = useState<PublicationHistoryItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/publications/history", { method: "GET" });
      if (Array.isArray(res)) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch publication history:", err);
      // Fallback sample data if empty or disconnected
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      const updatedJob = await apiRequest(`/publications/retry/${jobId}`, {
        method: "POST"
      });
      setRetryFeedback((prev) => ({
        ...prev,
        [jobId]: language === "uzl" ? "Qayta yuborildi!" : "Отправлено повторно!"
      }));
      // Refresh list
      fetchHistory();
    } catch (err: any) {
      setRetryFeedback((prev) => ({
        ...prev,
        [jobId]: err.message || (language === "uzl" ? "Xatolik yuz berdi" : "Ошибка при повторе")
      }));
    } finally {
      setRetryingJobId(null);
    }
  };

  // Helper for platform icons and badges
  const renderPlatformBadge = (platform: string) => {
    const p = platform.toUpperCase();
    if (p.includes("INSTAGRAM")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
          <Instagram className="w-3.5 h-3.5" /> Instagram
        </span>
      );
    }
    if (p.includes("TELEGRAM")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Send className="w-3.5 h-3.5" /> Telegram
        </span>
      );
    }
    if (p.includes("YOUTUBE")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <Youtube className="w-3.5 h-3.5" /> YouTube
        </span>
      );
    }
    if (p.includes("TIKTOK")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
          🎵 TikTok
        </span>
      );
    }
    if (p.includes("LINKEDIN")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/10 text-blue-400 border border-blue-600/20">
          💼 LinkedIn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400">
        {platform}
      </span>
    );
  };

  // Status Badge
  const renderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "PUBLISHED" || s === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          {language === "uzl" ? "Chiqarildi" : language === "uzc" ? "Чиқарилди" : language === "ru" ? "Опубликовано" : "Published"}
        </span>
      );
    }
    if (s === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3 h-3" />
          {language === "uzl" ? "Xato" : language === "uzc" ? "Хато" : language === "ru" ? "Ошибка" : "Failed"}
        </span>
      );
    }
    if (s === "SCHEDULED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3" />
          {language === "uzl" ? "Rejalashtirilgan" : language === "uzc" ? "Режалаштирилган" : language === "ru" ? "Запланировано" : "Scheduled"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-700 text-zinc-300">
        <RotateCw className="w-3 h-3 animate-spin" />
        {status}
      </span>
    );
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.bodyText && item.bodyText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.channelTitle && item.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform =
      selectedPlatform === "ALL" ||
      item.platform.toUpperCase().includes(selectedPlatform);

    const matchesStatus =
      selectedStatus === "ALL" ||
      item.status.toUpperCase() === selectedStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const stats = {
    total: items.length,
    published: items.filter((i) => i.status === "PUBLISHED" || i.status === "COMPLETED").length,
    scheduled: items.filter((i) => i.status === "SCHEDULED").length,
    failed: items.filter((i) => i.status === "FAILED").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-primary-400" />
            {language === "uzl"
              ? "Chiqarilgan va rejalashtirilgan postlar"
              : language === "uzc"
              ? "Чиқарилган ва режалаштирилган постлар"
              : language === "ru"
              ? "История публикаций"
              : "Publication History"}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {language === "uzl"
              ? "Barcha kanallardagi jonli xabarlar, nashr holati va xatoliklar jurnali"
              : language === "ru"
              ? "Журнал публикаций во всех социальных сетях, статусы и мониторинг ошибок"
              : "Live delivery status, direct post links and error reporting across all channels"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors border border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {language === "uzl" ? "Yangilash" : language === "ru" ? "Обновить" : "Refresh"}
          </button>
          <Link
            href="/create-post"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-primary-600/20"
          >
            <Plus className="w-4 h-4" />
            {t.nav.createPost}
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs font-medium text-zinc-400">
            {language === "uzl" ? "Jami nashrlar" : language === "ru" ? "Всего публикаций" : "Total Publications"}
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {language === "uzl" ? "Muvaffaqiyatli" : language === "ru" ? "Опубликовано" : "Published"}
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.published}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {language === "uzl" ? "Rejalashtirilgan" : language === "ru" ? "В очереди" : "Scheduled"}
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats.scheduled}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs font-medium text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {language === "uzl" ? "Xatoliklar" : language === "ru" ? "Ошибки" : "Failed"}
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{stats.failed}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "uzl"
                ? "Matn yoki kanal bo'yicha qidiruv..."
                : language === "ru"
                ? "Поиск по тексту или каналу..."
                : "Search by text or channel..."
            }
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Platform Filter */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs">
            {["ALL", "INSTAGRAM", "TELEGRAM", "YOUTUBE"].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedPlatform === plat
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {plat === "ALL" ? (language === "uzl" ? "Barchasi" : language === "ru" ? "Все" : "All") : plat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs">
            {["ALL", "PUBLISHED", "SCHEDULED", "FAILED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedStatus === st
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {st === "ALL"
                  ? language === "uzl"
                    ? "Barchasi"
                    : language === "ru"
                    ? "Все"
                    : "All"
                  : st === "PUBLISHED"
                  ? language === "uzl"
                    ? "Chiqarilgan"
                    : language === "ru"
                    ? "Успешно"
                    : "Published"
                  : st === "SCHEDULED"
                  ? language === "uzl"
                    ? "Kutilmoqda"
                    : language === "ru"
                    ? "В очереди"
                    : "Scheduled"
                  : language === "uzl"
                  ? "Xatolik"
                  : language === "ru"
                  ? "Ошибка"
                  : "Failed"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Publications List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm">
              {language === "uzl" ? "Nashrlar tarixi yuklanmoqda..." : "Загрузка истории публикаций..."}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-500 mb-3">
              <Send className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white">
              {language === "uzl"
                ? "Hech qanday nashr topilmadi"
                : language === "ru"
                ? "Публикаций не найдено"
                : "No publications found"}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              {language === "uzl"
                ? "Birinchi postingizni yaratib, Instagram, Telegram yoki YouTube kanallaringizga bir zumda chiqaring!"
                : language === "ru"
                ? "Создайте свой первый пост и опубликуйте его в Instagram, Telegram или YouTube!"
                : "Create your first post and publish instantly to Instagram, Telegram or YouTube!"}
            </p>
            <div className="mt-5">
              <Link
                href="/create-post"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                {t.nav.createPost}
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredItems.map((item) => {
              const isFailed = item.status === "FAILED";
              const isPublished = item.status === "PUBLISHED" || item.status === "COMPLETED";

              return (
                <div
                  key={item.jobId}
                  className="p-5 hover:bg-zinc-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: Media Thumbnail + Post Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Media thumbnail */}
                    {item.mediaUrls && item.mediaUrls.length > 0 ? (
                      <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0 relative">
                        {item.mediaUrls[0].match(/\.(mp4|mov|webm)$/i) ? (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-400">
                            <Video className="w-6 h-6 text-primary-400" />
                          </div>
                        ) : (
                          <img
                            src={item.mediaUrls[0]}
                            alt="Media thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        )}
                        {item.mediaUrls.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded">
                            +{item.mediaUrls.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-500 flex-shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {renderPlatformBadge(item.platform)}
                        <span className="text-xs font-semibold text-zinc-300">
                          {item.channelTitle || "Channel"}
                        </span>
                        {renderStatusBadge(item.status)}
                      </div>

                      {item.title && (
                        <h4 className="text-sm font-semibold text-white truncate mb-0.5">
                          {item.title}
                        </h4>
                      )}

                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {item.bodyText || (language === "uzl" ? "(Matnsiz post)" : "(Без текста)")}
                      </p>

                      {/* Timestamps */}
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-2">
                        {item.publishedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {new Date(item.publishedAt).toLocaleString()}
                          </span>
                        )}
                        {item.scheduledFor && !item.publishedAt && (
                          <span className="flex items-center gap-1 text-amber-400/80">
                            <Clock className="w-3 h-3" />
                            {new Date(item.scheduledFor).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Error Banner if Failed */}
                      {isFailed && item.errorMessage && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-semibold">
                              {language === "uzl" ? "Xatolik sababi:" : "Причина ошибки:"}
                            </span>{" "}
                            {item.errorMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                    {/* View Details */}
                    <button
                      onClick={() => setSelectedItemForModal(item)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors border border-zinc-700 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {language === "uzl" ? "Ko'rish" : language === "ru" ? "Просмотр" : "View"}
                    </button>

                    {/* Direct Live Link (Instagram/Telegram/YouTube) */}
                    {isPublished && item.postUrl && (
                      <a
                        href={item.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold transition-colors border border-emerald-500/30 flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {language === "uzl" ? "Jonli post" : language === "ru" ? "Открыть пост" : "Open Post"}
                      </a>
                    )}

                    {/* One-Click Retry on Failure */}
                    {isFailed && (
                      <button
                        onClick={() => handleRetry(item.jobId)}
                        disabled={retryingJobId === item.jobId}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-600/20"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${retryingJobId === item.jobId ? "animate-spin" : ""}`} />
                        {retryingJobId === item.jobId
                          ? language === "uzl"
                            ? "Yuborilmoqda..."
                            : "Отправка..."
                          : language === "uzl"
                          ? "Qayta urinish"
                          : language === "ru"
                          ? "Повторить"
                          : "Retry"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                {renderPlatformBadge(selectedItemForModal.platform)}
                <span className="text-sm font-semibold text-white">
                  {selectedItemForModal.channelTitle}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="text-zinc-400 hover:text-white text-lg font-bold p-1"
              >
                ×
              </button>
            </div>

            {/* Media Carousel or Single */}
            {selectedItemForModal.mediaUrls && selectedItemForModal.mediaUrls.length > 0 && (
              <div className="mb-4 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 max-h-64 flex items-center justify-center">
                {selectedItemForModal.mediaUrls[0].match(/\.(mp4|mov|webm)$/i) ? (
                  <video
                    src={selectedItemForModal.mediaUrls[0]}
                    controls
                    className="max-h-64 w-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedItemForModal.mediaUrls[0]}
                    alt="Media preview"
                    className="max-h-64 w-full object-contain"
                  />
                )}
              </div>
            )}

            {/* Title & Body */}
            {selectedItemForModal.title && (
              <h3 className="text-base font-bold text-white mb-2">
                {selectedItemForModal.title}
              </h3>
            )}

            <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 max-h-48 overflow-y-auto mb-4">
              <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {selectedItemForModal.bodyText || "(No caption)"}
              </p>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mb-4 bg-zinc-800/30 p-2.5 rounded-lg">
              <div>
                <span className="text-zinc-500">Holat:</span>{" "}
                <span className="font-semibold text-white">{selectedItemForModal.status}</span>
              </div>
              {selectedItemForModal.platformPostId && (
                <div>
                  <span className="text-zinc-500">Post ID:</span>{" "}
                  <span className="font-mono text-zinc-300">{selectedItemForModal.platformPostId}</span>
                </div>
              )}
              {selectedItemForModal.publishedAt && (
                <div className="col-span-2">
                  <span className="text-zinc-500">Vaqti:</span>{" "}
                  <span className="text-zinc-300">{new Date(selectedItemForModal.publishedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                {t.common.cancel}
              </button>

              {selectedItemForModal.postUrl && (
                <a
                  href={selectedItemForModal.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {language === "uzl" ? "Jonli ko'rish" : "Открыть в соцсети"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
