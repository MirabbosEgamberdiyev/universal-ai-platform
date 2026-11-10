"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  BookOpen,
  Search,
  Plus,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCircle2,
  FolderPlus,
  FileText,
  Quote,
  RefreshCw,
  Library,
  Layers,
  ChevronRight
} from "lucide-react";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  scope: string;
}

interface KnowledgeArticle {
  id: string;
  knowledgeBaseId: string;
  title: string;
  content: string;
  sourceCitation: string;
  tags?: string[];
  createdAt: string;
}

interface SearchResultItem {
  title: string;
  snippet: string;
  source: string;
  relevanceScore: number;
}

interface RagResponse {
  answer?: string;
  synthesizedAnswer?: string;
  sources?: SearchResultItem[];
  citations?: string[];
  articlesRetrieved?: number;
}

export default function KnowledgePage() {
  const { t } = useLanguage();
  const [bases, setBases] = useState<KnowledgeBase[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Search & RAG state
  const [searchQuery, setSearchQuery] = useState("");
  const [ragResult, setRagResult] = useState<RagResponse | null>(null);
  const [searching, setSearching] = useState(false);

  // Modals
  const [showCreateBase, setShowCreateBase] = useState(false);
  const [newBaseName, setNewBaseName] = useState("");
  const [newBaseDesc, setNewBaseDesc] = useState("");

  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [newArticleBaseId, setNewArticleBaseId] = useState("");
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleCitation, setNewArticleCitation] = useState("");
  const [newArticleTags, setNewArticleTags] = useState("");
  const [newArticleContent, setNewArticleContent] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const bList = await apiRequest<KnowledgeBase[]>("/knowledge/bases");
      setBases(bList || []);
      if (bList && bList.length > 0 && !newArticleBaseId) {
        setNewArticleBaseId(bList[0].id);
      }
      const aList = await apiRequest<KnowledgeArticle[]>("/knowledge/articles");
      setArticles(aList || []);
    } catch (err) {
      console.error("Failed to load knowledge", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await apiRequest<RagResponse>("/knowledge/search", {
        method: "POST",
        body: JSON.stringify({ query: searchQuery })
      });
      setRagResult(res);
    } catch (err: any) {
      alert("Search failed: " + (err.message || err.detail));
    } finally {
      setSearching(false);
    }
  };

  const handleCreateBase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBaseName.trim()) return;
    try {
      const created = await apiRequest<KnowledgeBase>("/knowledge/bases", {
        method: "POST",
        body: JSON.stringify({ name: newBaseName, description: newBaseDesc })
      });
      setShowCreateBase(false);
      setNewBaseName("");
      setNewBaseDesc("");
      loadData();
      setNotification(`Knowledge base "${created.name}" created successfully!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert("Failed to create base: " + (err.message || err.detail));
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleTitle.trim() || !newArticleBaseId) return;
    try {
      const tagArray = newArticleTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await apiRequest<KnowledgeArticle>("/knowledge/articles", {
        method: "POST",
        body: JSON.stringify({
          knowledgeBaseId: newArticleBaseId,
          title: newArticleTitle,
          content: newArticleContent,
          sourceCitation: newArticleCitation || "Internal Company Documentation",
          tags: tagArray
        })
      });

      setShowCreateArticle(false);
      setNewArticleTitle("");
      setNewArticleCitation("");
      setNewArticleTags("");
      setNewArticleContent("");
      loadData();
      setNotification("Knowledge article published to semantic vector store!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert("Failed to publish article: " + (err.message || err.detail));
    }
  };

  const filteredArticles = articles.filter((a) => {
    if (selectedBaseId === "ALL") return true;
    return a.knowledgeBaseId === selectedBaseId;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.knowledge}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise Retrieval-Augmented Generation (RAG) vector repository with strict XML boundary prompt-injection isolation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateBase(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            New Knowledge Base
          </button>
          <button
            onClick={() => setShowCreateArticle(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Article
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Semantic RAG Search Box */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Semantic Vector Search & Natural Language Q&A
        </div>
        <form onSubmit={handleRagSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Ask anything across your organization's knowledge bases (e.g. What is our refund policy?)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 shrink-0"
          >
            {searching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Synthesize Answer
              </>
            )}
          </button>
        </form>

        {/* Synthesized RAG Result Display */}
        {ragResult && (
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-5 space-y-3 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Sanitized RAG Synthesis ({ragResult.sources?.length || ragResult.articlesRetrieved || 0} Sources Retrieved)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Boundaries: &lt;untrusted_document_context&gt;
              </span>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              {ragResult.answer || ragResult.synthesizedAnswer || "No direct answer generated."}
            </div>

            {((ragResult.sources && ragResult.sources.length > 0) || (ragResult.citations && ragResult.citations.length > 0)) && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Quote className="w-3 h-3 text-indigo-400" />
                  Verified Citations & Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {ragResult.sources?.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-[10px] font-mono text-indigo-300"
                    >
                      [{s.source}] {s.title} ({Math.round(s.relevanceScore * 100)}%)
                    </span>
                  ))}
                  {ragResult.citations?.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-[10px] font-mono text-indigo-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Knowledge Base Navigation & Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Base Collections */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Library className="w-4 h-4 text-indigo-500" />
              Collections ({bases.length})
            </h3>

            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedBaseId("ALL")}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition ${
                  selectedBaseId === "ALL"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>All Articles</span>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {articles.length}
                </span>
              </button>

              {bases.map((b) => {
                const count = articles.filter((a) => a.knowledgeBaseId === b.id).length;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBaseId(b.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition text-left ${
                      selectedBaseId === b.id
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="truncate">{b.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal truncate">{b.description || "Default scope"}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Articles List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Knowledge Articles ({filteredArticles.length})
              </h3>
              <span className="text-xs text-slate-400">Indexed for Retrieval</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading indexed articles...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No articles found in this collection. Click "Add Article" above to contribute.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredArticles.map((art) => (
                  <div key={art.id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition">
                        {art.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(art.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {art.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="italic flex items-center gap-1 text-slate-500">
                        <Quote className="w-3 h-3 text-indigo-400" />
                        Source: {art.sourceCitation}
                      </span>
                      {art.tags && art.tags.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {art.tags.map((tg, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: New Knowledge Base */}
      {showCreateBase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-600" />
              Create Knowledge Base
            </h3>
            <form onSubmit={handleCreateBase} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Playbooks & Pricing"
                  value={newBaseName}
                  onChange={(e) => setNewBaseName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Scope and purpose of this knowledge collection..."
                  value={newBaseDesc}
                  onChange={(e) => setNewBaseDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBase(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Knowledge Article */}
      {showCreateArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Publish Knowledge Article
            </h3>
            <form onSubmit={handleCreateArticle} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Knowledge Base
                </label>
                <select
                  value={newArticleBaseId}
                  onChange={(e) => setNewArticleBaseId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard SLA Guarantees and Response Times"
                  value={newArticleTitle}
                  onChange={(e) => setNewArticleTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source Citation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Services Agreement §4.2"
                    value={newArticleCitation}
                    onChange={(e) => setNewArticleCitation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="sla, pricing, enterprise"
                    value={newArticleTags}
                    onChange={(e) => setNewArticleTags(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Article Body (Markdown Supported)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write clear, structured knowledge text that the AI can cite during RAG retrieval..."
                  value={newArticleContent}
                  onChange={(e) => setNewArticleContent(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateArticle(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Index & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
