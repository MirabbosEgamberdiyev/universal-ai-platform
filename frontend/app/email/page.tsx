"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  Mail,
  Inbox,
  Send,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  CheckSquare,
  RefreshCw,
  Tag,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface EmailAccount {
  id: string;
  provider: string;
  emailAddress: string;
  accountName: string;
  status: string;
}

interface Email {
  id: string;
  subject: string;
  senderAddress: string;
  recipientAddress: string;
  bodySnippet: string;
  bodyHtml?: string;
  category: "URGENT" | "LEAD" | "SUPPORT" | "NEWSLETTER" | "GENERAL";
  priority: string;
  aiSuggestedReply?: string;
  receivedAt: string;
  isRead: boolean;
  isReplied: boolean;
}

export default function EmailPage() {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newEmailAddress, setNewEmailAddress] = useState("");
  const [newProvider, setNewProvider] = useState("GMAIL");
  const [notification, setNotification] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const data = await apiRequest<EmailAccount[]>("/emails/accounts");
      setAccounts(data || []);
    } catch (err) {
      console.error("Failed to load accounts", err);
    }
  };

  const fetchEmails = async (category = "ALL") => {
    setLoading(true);
    try {
      const url = category === "ALL" ? "/emails" : `/emails?category=${category}`;
      const data = await apiRequest<Email[]>(url);
      setEmails(data || []);
      if (data && data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
        setReplyText(data[0].aiSuggestedReply || "");
      }
    } catch (err) {
      console.error("Failed to load emails", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchEmails();
  }, []);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setReplyText(email.aiSuggestedReply || "");
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchEmails(cat);
  };

  const handleGenerateDraft = async () => {
    if (!selectedEmail) return;
    setGeneratingDraft(true);
    try {
      const updated = await apiRequest<Email>(`/emails/${selectedEmail.id}/draft`, {
        method: "POST"
      });
      setSelectedEmail(updated);
      setReplyText(updated.aiSuggestedReply || "");
      setNotification("AI generated high-converting contextual draft!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert("Error generating draft: " + (err.message || err.detail));
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyText.trim()) return;
    try {
      await apiRequest(`/emails/${selectedEmail.id}/send`, {
        method: "POST",
        body: JSON.stringify({ replyBody: replyText })
      });
      setNotification("Email dispatched successfully under HITL Mode 3 verification!");
      setTimeout(() => setNotification(null), 4000);
      fetchEmails(selectedCategory);
    } catch (err: any) {
      alert("Send failed: " + (err.message || err.detail));
    }
  };

  const handleConvertToTask = async () => {
    if (!selectedEmail) return;
    try {
      await apiRequest(`/emails/${selectedEmail.id}/to-task`, {
        method: "POST"
      });
      setNotification(`Converted "${selectedEmail.subject}" into actionable Task!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert("Conversion failed: " + (err.message || err.detail));
    }
  };

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailAddress.trim()) return;
    try {
      await apiRequest("/emails/accounts", {
        method: "POST",
        body: JSON.stringify({
          provider: newProvider,
          emailAddress: newEmailAddress,
          accountName: newEmailAddress.split("@")[0]
        })
      });
      setShowConnectModal(false);
      setNewEmailAddress("");
      fetchAccounts();
      setNotification("Connected enterprise email mailbox successfully!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert("Failed to connect account: " + (err.message || err.detail));
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "URGENT":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300";
      case "LEAD":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300";
      case "SUPPORT":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200 border-sky-300";
      case "NEWSLETTER":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border-purple-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t.nav.email}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise multi-inbox management, automated AI classification, triage, and HITL response workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEmails(selectedCategory)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t.common.refresh}
          </button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Connect Mailbox
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Account overview pills */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase">Connected Mailboxes:</span>
        {accounts.length === 0 ? (
          <span className="text-xs text-slate-400 italic">No mailboxes connected yet. Click Connect Mailbox to add one.</span>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">{acc.provider}</span>: {acc.emailAddress}
            </div>
          ))
        )}
      </div>

      {/* Main Mail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Email List Left Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center overflow-x-auto border-b border-slate-200 dark:border-slate-800 p-2 gap-1 bg-slate-50/50 dark:bg-slate-900/50">
            {["ALL", "URGENT", "LEAD", "SUPPORT", "NEWSLETTER"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Email Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                Loading email threads...
              </div>
            ) : emails.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No emails found in this category.
              </div>
            ) : (
              emails.map((em) => {
                const isSelected = selectedEmail?.id === em.id;
                return (
                  <div
                    key={em.id}
                    onClick={() => handleSelectEmail(em)}
                    className={`p-4 cursor-pointer transition flex flex-col gap-2 ${
                      isSelected
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[200px]">
                        {em.senderAddress}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getCategoryColor(em.category)}`}>
                        {em.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {em.subject}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {em.bodySnippet}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{new Date(em.receivedAt || Date.now()).toLocaleDateString()}</span>
                      {em.aiSuggestedReply && (
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px]">
                          <Sparkles className="w-3 h-3" /> AI Draft Ready
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Email Detailed View & AI Studio Right Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
              {/* Header Info */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {selectedEmail.subject}
                  </h2>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border uppercase shrink-0 ${getCategoryColor(selectedEmail.category)}`}>
                    {selectedEmail.category}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                  <div>
                    From: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEmail.senderAddress}</span>
                  </div>
                  <div>
                    To: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEmail.recipientAddress}</span>
                  </div>
                  <div>
                    {new Date(selectedEmail.receivedAt || Date.now()).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="bg-slate-50 dark:bg-slate-950/60 rounded-lg p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedEmail.bodySnippet || "No preview content available."}
              </div>

              {/* Action Buttons: Convert to Task & Trigger AI */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleConvertToTask}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Convert to Task
                </button>
                <button
                  onClick={handleGenerateDraft}
                  disabled={generatingDraft}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  {generatingDraft ? "Crafting AI Reply..." : "Regenerate AI Draft"}
                </button>
              </div>

              {/* AI Draft Reply Composer (HITL Mode 3) */}
              <div className="border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    HITL Verified AI Reply Composer (Mode 3)
                  </div>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-300">
                    Requires Human Dispatch
                  </span>
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Draft reply will appear here, or type your response..."
                  rows={6}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dispatches directly through authorized email adapter.
                  </p>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Approve & Dispatch Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-center">
              <Mail className="w-12 h-12 mb-3 opacity-30 text-indigo-500" />
              <p className="text-sm font-semibold">Select an email to view full conversation and AI response</p>
              <p className="text-xs text-slate-500 mt-1">
                You can draft responses, convert inquiries to tasks, or trigger automated workflows.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Connect Mailbox Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Connect Enterprise Mailbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Integrate Gmail Workspace, Microsoft 365, or IMAP/SMTP accounts with zero-trust OAuth 2.0 token storage.
            </p>
            <form onSubmit={handleConnectAccount} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mailbox Provider
                </label>
                <select
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="GMAIL">Google Workspace / Gmail</option>
                  <option value="OUTLOOK">Microsoft 365 / Outlook</option>
                  <option value="IMAP_SMTP">Custom IMAP / SMTP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="support@company.com"
                  value={newEmailAddress}
                  onChange={(e) => setNewEmailAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm"
                >
                  Authorize & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
