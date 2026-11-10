"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Search, 
  Filter, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink,
  PenTool,
  FolderOpen,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "../../lib/api/apiClient";

interface BackendAsset {
  id: string;
  originalFilename?: string;
  assetType: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  fileSizeBytes: number;
  mimeType: string;
  fileUrl?: string;
  storagePath: string;
  width?: number;
  height?: number;
  tags?: string;
  createdAt?: string;
}

export default function MediaLibraryPage() {
  const { t, language } = useLanguage();
  const [filterType, setFilterType] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [assets, setAssets] = useState<BackendAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const query = filterType !== "ALL" ? `?type=${filterType}` : "";
      const data = await apiClient.get<BackendAsset[]>(`/media${query}`);
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [filterType]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tags", "Uploaded");

    setUploading(true);
    setStatusMsg(null);

    try {
      await apiClient.upload<BackendAsset>("/media/upload", formData);
      setStatusMsg({
        type: "success",
        text: language === "uz-Latn" 
          ? `"${file.name}" muvaffaqiyatli yuklandi va MIME magic bytes tekshiruvidan o'tdi.` 
          : `"${file.name}" uploaded successfully and passed MIME magic inspection.`
      });
      await loadMedia();
    } catch (err: any) {
      const errorMsg = err?.detail || err?.title || err?.message || "Faylni yuklashda xatolik yuz berdi";
      setStatusMsg({
        type: "error",
        text: `${errorMsg}`
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(language === "uz-Latn" ? `"${name}" faylini o'chirishni tasdiqlaysizmi?` : `Delete "${name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/media/${id}`);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setStatusMsg({
        type: "success",
        text: language === "uz-Latn" ? "Fayl muvaffaqiyatli o'chirildi" : "File deleted successfully"
      });
    } catch (err: any) {
      alert(err?.detail || "O'chirishda xatolik");
    }
  };

  const handleCopy = (id: string, url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalBytes = assets.reduce((acc, curr) => acc + (curr.fileSizeBytes || 0), 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  const filteredAssets = assets.filter((item) => {
    const name = item.originalFilename || item.storagePath || "";
    const tags = item.tags || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-indigo-600" />
            <span>{t.nav.media}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === "uz-Latn"
              ? "Haqiqiy media aktivlar markazi — MIME magic bayt tekshiruvi va ijtimoiy tarmoqlar uchun avtomatik optimizatsiya"
              : language === "ru"
              ? "Хранилище медиафайлов — валидация magic-байтов и автоматическая оптимизация для соцсетей"
              : "Enterprise Media Library — raw byte inspection and multi-network container formatting"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMedia}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{language === "uz-Latn" ? "Yangilash" : "Refresh"}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>
              {uploading
                ? (language === "uz-Latn" ? "Tekshirilmoqda..." : "Uploading & Verifying...")
                : (language === "uz-Latn" ? "Fayl yuklash" : language === "ru" ? "Загрузить файл" : "Upload File")}
            </span>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          statusMsg.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
            : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Storage usage meter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span>
              {language === "uz-Latn" ? "Haqiqiy saqlangan hajm:" : language === "ru" ? "Используемое место:" : "Actual Cloud Storage:"}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">{totalMb} MB / 10 GB</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === "uz-Latn"
              ? "Barcha fayllar magic byte xavfsizlik filtri orqali tekshiriladi (JPEG, PNG, MP4, WEBM)."
              : "All binaries strictly authenticated via magic byte headers preventing MIME spoofing."}
          </p>
        </div>
        <div className="w-full md:w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(1, (totalBytes / (10 * 1024 * 1024 * 1024)) * 100))}%` }}></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterType === "ALL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {language === "uz-Latn" ? "Barchasi" : language === "ru" ? "Все" : "All Assets"}
          </button>
          <button
            onClick={() => setFilterType("IMAGE")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
              filterType === "IMAGE"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{language === "uz-Latn" ? "Rasmlar" : language === "ru" ? "Изображения" : "Images"}</span>
          </button>
          <button
            onClick={() => setFilterType("VIDEO")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
              filterType === "VIDEO"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{language === "uz-Latn" ? "Videolar" : language === "ru" ? "Видео" : "Videos"}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs">{language === "uz-Latn" ? "Media fayllar yuklanmoqda..." : "Loading media assets..."}</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        /* Zero-mock Empty state */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {language === "uz-Latn" ? "Hozircha media fayllar yo'q" : "No media assets found"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            {language === "uz-Latn"
              ? "Ijtimoiy tarmoqlarda post yaratishda ishlatish uchun rasm (JPEG, PNG) yoki video (MP4) yuklang."
              : "Upload authentic images or videos to publish directly to Instagram, Telegram, and YouTube."}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            <span>{language === "uz-Latn" ? "Birinchi faylni yuklash" : "Upload First File"}</span>
          </button>
        </div>
      ) : (
        /* Grid of authentic media items */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((item) => {
            const fileName = item.originalFilename || "Media Asset";
            const dimensions = item.width && item.height ? `${item.width}x${item.height}` : item.assetType;
            const fileSize = formatFileSize(item.fileSizeBytes);
            const downloadUrl = `http://localhost:8090/api/v1/media/${item.id}/raw`;

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col hover:border-indigo-300 dark:hover:border-indigo-800 transition"
              >
                {/* Thumbnail banner area */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                  {item.assetType === "IMAGE" ? (
                    <img 
                      src={downloadUrl} 
                      alt={fileName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Video className="w-12 h-12 stroke-[1.2] text-indigo-500" />
                      <span className="text-[10px] font-semibold mt-1 text-slate-500">{item.mimeType}</span>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs">
                    {dimensions}
                  </span>
                  <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-900/80 text-slate-200 backdrop-blur-xs">
                    {fileSize}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={fileName}>
                      {fileName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recently uploaded"}
                    </p>

                    {/* Tags */}
                    {item.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.split(",").map((tag) => (
                          <span
                            key={tag.trim()}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(item.id, downloadUrl)}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>URL olish</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/create-post?mediaUrl=${encodeURIComponent(downloadUrl)}`}
                        title={language === "uz-Latn" ? "Post yaratishda ishlatish" : "Use in Post"}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, fileName)}
                        title={t.common.delete}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
