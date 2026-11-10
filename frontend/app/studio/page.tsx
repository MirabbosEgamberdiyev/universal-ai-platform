"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  Sparkles,
  Save,
  Calendar,
  Send,
  Instagram,
  Linkedin,
  Copy,
  Check,
  Loader2
} from "lucide-react";

export default function StudioPage() {
  const { t } = useLanguage();

  // Generator inputs
  const [topic, setTopic] = useState("");
  const [targetPlatform, setTargetPlatform] = useState("TELEGRAM");
  const [tone, setTone] = useState("Engaging & Professional");
  const [genLanguage, setGenLanguage] = useState("uz-Latn");
  const [targetAudience, setTargetAudience] = useState("Youth, Entrepreneurs & Tech enthusiasts");
  const [generating, setGenerating] = useState(false);

  // Editor states
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [previewPlatform, setPreviewPlatform] = useState("TELEGRAM");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setGenerating(true);
      const res = await apiRequest<any>("/content/generate-ai", {
        method: "POST",
        body: JSON.stringify({
          topic,
          platform: targetPlatform,
          tone,
          language: genLanguage,
          targetAudience,
        }),
      });

      setTitle(res.headline || topic);
      setBodyText(res.bodyText);
      setHashtags(res.hashtags || []);
    } catch (e: any) {
      alert("AI Generation failed: " + (e?.detail || e?.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!bodyText.trim()) return;
    try {
      setSaving(true);
      await apiRequest<any>("/content", {
        method: "POST",
        body: JSON.stringify({
          title,
          bodyText,
          locale: genLanguage,
          tags: hashtags,
        }),
      });
      alert("Draft saved successfully to Content Library!");
    } catch (e: any) {
      alert("Save failed: " + (e?.detail || e?.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.nav.studio}</h1>
          <p className="text-xs text-slate-500">Multimodal AI post creation with native 4-language synthesis and platform preview.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={saving || !bodyText.trim()}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Draft
          </button>
        </div>
      </div>

      {/* 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Generator Controls (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Creative Brief</span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic / Promotion Subject</label>
              <textarea
                rows={3}
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Launching our autumn apparel collection with 20% discount this Friday..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                <select
                  value={targetPlatform}
                  onChange={(e) => { setTargetPlatform(e.target.value); setPreviewPlatform(e.target.value); }}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <option value="TELEGRAM">Telegram</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="TIKTOK">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</label>
                <select
                  value={genLanguage}
                  onChange={(e) => setGenLanguage(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <option value="uz-Latn">O'zbekcha (Lotin)</option>
                  <option value="uz-Cyrl">Ўзбекча (Кирилл)</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="Engaging & Professional">Engaging & Professional</option>
                <option value="Enthusiastic & Viral">Enthusiastic & Viral</option>
                <option value="Direct & Educational">Direct & Educational</option>
                <option value="Urgent Promotion (Flash Sale)">Urgent Promotion (Flash Sale)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating || !topic.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Multilingual Post
            </button>
          </form>
        </div>

        {/* Center: Editor Canvas (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Editor Canvas</span>
            <span className="text-[11px] text-slate-400">{bodyText.length} characters</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title / Headline..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
          />

          <textarea
            rows={12}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Generated post content will appear here. You can refine and edit directly..."
            className="flex-1 w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none font-sans"
          />

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  onClick={() => setBodyText((prev) => prev + " " + tag)}
                  className="cursor-pointer text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Real-Time Platform Preview (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Preview</span>
            <button onClick={handleCopy} className="text-slate-400 hover:text-slate-600 p-1" title="Copy text">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setPreviewPlatform("TELEGRAM")}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${previewPlatform === "TELEGRAM" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "text-slate-500"}`}
            >
              <Send className="w-3 h-3" /> TG
            </button>
            <button
              onClick={() => setPreviewPlatform("INSTAGRAM")}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${previewPlatform === "INSTAGRAM" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "text-slate-500"}`}
            >
              <Instagram className="w-3 h-3" /> IG
            </button>
            <button
              onClick={() => setPreviewPlatform("LINKEDIN")}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${previewPlatform === "LINKEDIN" ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" : "text-slate-500"}`}
            >
              <Linkedin className="w-3 h-3" /> LI
            </button>
          </div>

          {/* Device Mockup Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-3.5 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                O
              </div>
              <div>
                <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Your Channel Name</p>
                <p className="text-[9px] text-slate-400">Just now</p>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {bodyText || "Your formatted post copy and hashtags will appear here dynamically as you write."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
