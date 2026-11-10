"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api/apiClient";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import {
  Send,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Video,
  Hash,
  AlertCircle,
  CheckCircle2,
  Clock,
  Instagram,
  Youtube,
  RefreshCw,
  Eye,
  Sliders,
  Copy,
  Plus,
  PenTool
} from "lucide-react";

interface Channel {
  id: string;
  connectedAccountId: string;
  externalChannelId: string;
  title: string;
  channelType: string;
  active: boolean;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");

  // Scheduling state
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiTargetPlatform, setAiTargetPlatform] = useState("INSTAGRAM");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Preview tab state
  const [activePreview, setActivePreview] = useState<"INSTAGRAM" | "TELEGRAM" | "YOUTUBE">("INSTAGRAM");

  // Publishing state
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchChannels();
    // Default scheduled time to 2 hours in the future
    const d = new Date(Date.now() + 2 * 3600 * 1000);
    setScheduledDate(d.toISOString().split("T")[0]);
    setScheduledTime(d.toTimeString().substring(0, 5));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCaption = params.get("caption");
      if (urlCaption) {
        setBodyText(urlCaption);
      }
    }
  }, []);

  const fetchChannels = async () => {
    try {
      const data = await apiRequest<Channel[]>("/accounts/channels");
      setChannels(data || []);
      if (data && data.length > 0) {
        setSelectedChannelIds([data[0].id]);
      }
    } catch {
      // ignore
    }
  };

  const toggleChannel = (id: string) => {
    setSelectedChannelIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const addMediaUrl = () => {
    if (!mediaInput.trim()) return;
    setMediaUrls((prev) => [...prev, mediaInput.trim()]);
    setMediaInput("");
  };

  const removeMedia = (idx: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const addHashtag = () => {
    if (!hashtagInput.trim()) return;
    let tag = hashtagInput.trim();
    if (!tag.startsWith("#")) tag = "#" + tag;
    if (!hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
    }
    setHashtagInput("");
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((h) => h !== tag));
  };

  const generateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setStatusMsg(null);
    try {
      const res = await apiRequest<any>("/content/generate-ai", {
        method: "POST",
        body: JSON.stringify({
          topic: aiPrompt.trim(),
          platform: aiTargetPlatform,
          tone: aiTone,
          language: language === "ru" ? "Russian" : language.startsWith("uz") ? "Uzbek" : "English",
          targetAudience: "General Social Audience"
        })
      });

      if (res) {
        if (res.headline && !title) setTitle(res.headline);
        if (res.bodyText) setBodyText(res.bodyText);
        if (res.hashtags && Array.isArray(res.hashtags)) {
          setHashtags((prev) => Array.from(new Set([...prev, ...res.hashtags])));
        }
        setShowAiModal(false);
        setStatusMsg({ type: "success", text: "AI matn muvaffaqiyatli tayyorlandi!" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err?.message || "AI xizmati vaqtincha band" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePublish = async (publishNow: boolean) => {
    if (selectedChannelIds.length === 0) {
      setStatusMsg({ type: "error", text: "Kamida bitta kanal yoki akkauntni tanlang!" });
      return;
    }
    if (!bodyText.trim()) {
      setStatusMsg({ type: "error", text: "Iltimos, post matnini kiriting!" });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      let finalScheduledFor: string | null = null;
      if (!publishNow && isScheduling) {
        finalScheduledFor = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      }

      // Combine text and hashtags if any
      const fullText = hashtags.length > 0
        ? `${bodyText.trim()}\n\n${hashtags.join(" ")}`
        : bodyText.trim();

      await apiRequest("/publications/quick-publish", {
        method: "POST",
        body: JSON.stringify({
          title: title || (bodyText.length > 50 ? bodyText.substring(0, 47) + "..." : bodyText),
          bodyText: fullText,
          mediaUrls,
          channelIds: selectedChannelIds,
          scheduledFor: finalScheduledFor,
          publishNow,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tashkent"
        })
      });

      setStatusMsg({
        type: "success",
        text: publishNow
          ? "Post tanlangan barcha kanallarga muvaffaqiyatli chiqarildi!"
          : "Post jadvalga kiritildi va belgilangan vaqtda chiqariladi!"
      });

      setTimeout(() => {
        router.push("/published");
      }, 1500);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err?.detail || err?.message || "Chiqarishda xatolik yuz berdi" });
    } finally {
      setLoading(false);
    }
  };

  // Validation warnings
  const selectedTypes = channels
    .filter((c) => selectedChannelIds.includes(c.id))
    .map((c) => c.channelType.toUpperCase());

  const requiresVideo = selectedTypes.some((t) => t.includes("YOUTUBE"));
  const hasVideo = mediaUrls.some((u) => u.toLowerCase().match(/\.(mp4|mov|avi|webm)$/));
  const isVideoMissingForYoutube = requiresVideo && !hasVideo;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.nav.createPost}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bir marta yozing, moslashtiring va barcha tarmoqlarga birdaniga chiqaring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>AI Yordamchi</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {isVideoMissingForYoutube && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>YouTube kanalini tanladingiz. YouTube ga post chiqarish uchun kamida 1 ta MP4 video fayl biriktirilishi shart.</span>
        </div>
      )}

      {/* Main 2-Column Split: Left Editor, Right Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Post Form */}
        <div className="lg:col-span-7 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
          {/* Destination Accounts Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Qayerga chiqarilsin? (Kanallarni tanlang)
            </label>
            {channels.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 flex items-center justify-between">
                <span>Hozircha ulangan kanallar yo'q.</span>
                <button
                  onClick={() => router.push("/accounts")}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Kanal ulash →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {channels.map((ch) => {
                  const selected = selectedChannelIds.includes(ch.id);
                  const isIg = ch.channelType.includes("IG");
                  const isYt = ch.channelType.includes("YOUTUBE");
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChannel(ch.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100 font-semibold shadow-xs"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          selected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {selected && "✓"}
                      </div>
                      <div className="truncate">
                        <p className="truncate font-medium">{ch.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {isIg ? "Instagram" : isYt ? "YouTube" : "Telegram"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Post Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Sarlavha (Ixtiyoriy yoki YouTube uchun)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Yangi mahsulot taqdimoti 🚀"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Post Body Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Post Matni (Caption)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {bodyText.length} belgi
              </span>
            </div>
            <textarea
              rows={6}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Post matnini bu yerga yozing yoki AI Yordamchi orqali yarating..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Hashtags Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Hashtaglar
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                  placeholder="masalan: yangilik, marketing..."
                  className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={addHashtag}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                Qo'shish
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-semibold"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media Attachments Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Rasm yoki Video Havolalari
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={mediaInput}
                onChange={(e) => setMediaInput(e.target.value)}
                placeholder="https://images.unsplash.com/... yoki MP4 havola"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addMediaUrl}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                Biriktirish
              </button>
            </div>

            {/* Quick Demo Media chips */}
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-3">
              <span>Namuna:</span>
              <button
                type="button"
                onClick={() => setMediaUrls(["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"])}
                className="text-indigo-600 hover:underline"
              >
                + Rasm (Design)
              </button>
              <button
                type="button"
                onClick={() => setMediaUrls(["https://www.w3schools.com/html/mov_bbb.mp4"])}
                className="text-indigo-600 hover:underline"
              >
                + Video (MP4)
              </button>
            </div>

            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {mediaUrls.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 h-24">
                    {url.match(/\.(mp4|mov|avi|webm)$/) ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                        <Video className="w-6 h-6 mb-1 text-indigo-500" />
                        <span>Video Fayl</span>
                      </div>
                    ) : (
                      <img src={url} alt="Attached media" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons: Publish Now vs Schedule */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsScheduling(!isScheduling)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition"
              >
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>{isScheduling ? "Rejali chiqarish yoqilgan" : "Kechiktirib chiqarish (Rejalashtirish)?"}</span>
              </button>
            </div>

            {isScheduling && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePublish(true)}
                className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "Chiqarilmoqda..." : "Hozir Chiqarish (Publish Now)"}</span>
              </button>

              {isScheduling && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handlePublish(false)}
                  className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Jadvalga Qo'yish (Schedule)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Platform Previews */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>Jonli Ko'rinish (Live Preview)</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActivePreview("INSTAGRAM")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activePreview === "INSTAGRAM"
                      ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreview("TELEGRAM")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activePreview === "TELEGRAM"
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Telegram
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreview("YOUTUBE")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activePreview === "YOUTUBE"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  YouTube
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="pt-4 flex justify-center">
              {/* Instagram Feed Device Frame */}
              {activePreview === "INSTAGRAM" && (
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
                  {/* Account bar */}
                  <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-bold">
                          IG
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">your_brand_official</span>
                    </div>
                    <span className="text-slate-400 text-xs">•••</span>
                  </div>

                  {/* Media area */}
                  <div className="h-64 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    {mediaUrls.length > 0 ? (
                      mediaUrls[0].match(/\.(mp4|mov|avi|webm)$/) ? (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                          <Video className="w-10 h-10 text-indigo-500 mb-1 animate-pulse" />
                          <span>Video Reels formatida chiqariladi</span>
                        </div>
                      ) : (
                        <img src={mediaUrls[0]} alt="Post image" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                        <span>Rasm biriktirilmagan</span>
                      </div>
                    )}
                  </div>

                  {/* Caption & Actions */}
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <span>❤️</span>
                      <span>💬</span>
                      <span>✈️</span>
                    </div>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap line-clamp-4">
                      <span className="font-bold mr-1.5">your_brand_official</span>
                      {bodyText || "Sizning post matningiz bu yerda ko'rinadi..."}
                    </p>
                    {hashtags.length > 0 && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                        {hashtags.join(" ")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Telegram Channel Bubble Preview */}
              {activePreview === "TELEGRAM" && (
                <div className="w-full max-w-sm rounded-2xl bg-sky-50/50 dark:bg-slate-950 p-4 border border-sky-100 dark:border-slate-800">
                  <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    {mediaUrls.length > 0 && (
                      <div className="h-48 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        <img src={mediaUrls[0]} alt="Telegram attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-3 text-xs space-y-2">
                      <div className="font-bold text-sky-600 dark:text-sky-400 text-[11px]">
                        {title || "Tech Updates Official"}
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap text-[11px] leading-relaxed">
                        {bodyText || "Telegram kanali uchun xabar matni..."}
                      </p>
                      {hashtags.length > 0 && (
                        <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                          {hashtags.join(" ")}
                        </p>
                      )}
                      <div className="flex justify-end text-[10px] text-slate-400 pt-1">
                        12:45 • 👁️ 1.2k
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* YouTube Video Player Preview */}
              {activePreview === "YOUTUBE" && (
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
                  <div className="h-44 bg-slate-900 flex items-center justify-center relative">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                      ▶
                    </div>
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                      12:30
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                      {title || "Video Sarlavhasi (100 belgigacha)"}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-3 whitespace-pre-wrap">
                      {bodyText || "Video tavsifi (Description) bu yerda aks etadi..."}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                        Public
                      </span>
                      <span className="text-[10px] text-slate-400">• People & Blogs</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Kontent Yordamchisi</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Qanday mavzuda post yozamiz?
              </label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Masalan: Yangi dasturimiz orqali ijtimoiy tarmoqlarga post chiqarish qanchalik osonlashgani haqida..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ohang (Tone)
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Professional">Professional & Rasmiy</option>
                  <option value="Casual">Do'stona & Samimiy</option>
                  <option value="Viral">Viral & Qiziqtiruvchi</option>
                  <option value="Enthusiastic">Ilhomlantiruvchi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Asosiy Tarmoq
                </label>
                <select
                  value={aiTargetPlatform}
                  onChange={(e) => setAiTargetPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                >
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TELEGRAM">Telegram</option>
                  <option value="YOUTUBE">YouTube</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={isAiLoading || !aiPrompt.trim()}
                onClick={generateWithAi}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow transition disabled:opacity-50"
              >
                {isAiLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isAiLoading ? "Yozilmoqda..." : "Matnni yaratish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
