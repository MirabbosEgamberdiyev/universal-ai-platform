"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  FileText,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Eye,
  X,
  FileCheck
} from "lucide-react";

interface DocumentItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  tokenCount: number;
  status: "PROCESSING" | "INDEXED" | "QUARANTINED" | "FAILED";
  promptInjectionRiskScore: number;
  quarantineReason?: string;
  createdAt: string;
}

interface DocumentChunk {
  id: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
}

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState("PDF");
  const [newContent, setNewContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<DocumentItem[]>("/documents");
      setDocs(data || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleInspectChunks = async (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setLoadingChunks(true);
    try {
      const chunkData = await apiRequest<DocumentChunk[]>(`/documents/${doc.id}/chunks`);
      setChunks(chunkData || []);
    } catch (err) {
      console.error("Failed to fetch chunks", err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    setUploading(true);
    try {
      const created = await apiRequest<DocumentItem>("/documents", {
        method: "POST",
        body: JSON.stringify({
          fileName: newFileName,
          fileType: newFileType,
          fileSizeBytes: newContent.length || 2048,
          textContent: newContent
        })
      });
      setShowUploadModal(false);
      setNewFileName("");
      setNewContent("");
      fetchDocs();

      if (created.status === "QUARANTINED") {
        setNotification(`⚠️ Document "${created.fileName}" was QUARANTINED by Prompt Injection Defense (Risk Score: ${created.promptInjectionRiskScore}/100)`);
      } else {
        setNotification(`Document "${created.fileName}" successfully scanned, indexed, and chunked!`);
      }
      setTimeout(() => setNotification(null), 6000);
    } catch (err: any) {
      alert("Upload failed: " + (err.message || err.detail));
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = docs.filter((d) => {
    const matchesType = filterType === "ALL" || d.fileType === filterType;
    const matchesSearch = d.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusBadge = (doc: DocumentItem) => {
    if (doc.status === "QUARANTINED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300">
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          QUARANTINED ({doc.promptInjectionRiskScore}%)
        </span>
      );
    }
    if (doc.status === "INDEXED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          INDEXED (Clean)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
        <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
        {doc.status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.documents}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Zero-Trust Document Ingestion with automated prompt-injection heuristics, token chunking, and semantic embedding.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDocs}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t.common.refresh}
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Ingest Document
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-medium text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Security Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Prompt Injection Defense Engine Active</p>
            <p className="text-xs text-slate-300">
              Every document is scanned against 12 injection patterns (system prompt overrides, jailbreaks, payload markers) before chunking.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-mono bg-indigo-950 border border-indigo-700 text-indigo-300 px-3 py-1 rounded">
          Quarantine Gate: 50%
        </span>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "PDF", "DOCX", "CONTRACT", "TXT", "SPREADSHEET"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                filterType === type
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Security Status</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading enterprise documents...
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No documents found. Ingest your first document to populate the knowledge corpus.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate max-w-xs">{doc.fileName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {doc.tokenCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(doc)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(doc.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleInspectChunks(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Chunks
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chunk Inspector Drawer / Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-3xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Semantic Chunks: {selectedDoc.fileName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  500-character normalized slices with 100-character boundary overlap for RAG retrieval.
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDoc.status === "QUARANTINED" && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-800 dark:text-rose-200">
                <strong>Security Alert:</strong> {selectedDoc.quarantineReason || "Prompt injection heuristics tripped. Chunks locked from RAG synthesis."}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {loadingChunks ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                  Extracting vector chunks...
                </div>
              ) : chunks.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No chunks generated yet for this document.
                </div>
              ) : (
                chunks.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Chunk #{chk.chunkIndex}</span>
                      <span>{chk.tokenCount} Tokens</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                      {chk.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingest Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              Ingest Document into Knowledge Corpus
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide document metadata and text payload. Automated heuristic scanner will inspect for injection vectors before indexing.
            </p>
            <form onSubmit={handleUpload} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title / File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4_Brand_Strategy_2026.pdf"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Format Type
                </label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="DOCX">Word (.docx)</option>
                  <option value="CONTRACT">Legal Contract / SLA</option>
                  <option value="TXT">Plain Text / Markdown</option>
                  <option value="SPREADSHEET">Financial Spreadsheet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Text Content
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste document text or extracted content here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  {uploading ? "Scanning & Indexing..." : "Scan & Ingest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
