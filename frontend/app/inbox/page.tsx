"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { apiRequest } from "../../lib/api/apiClient";
import {
  Inbox as InboxIcon,
  Send,
  Sparkles,
  User,
  Clock,
  CheckCircle,
  MessageSquare,
  Loader2
} from "lucide-react";

export default function InboxPage() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingReply, setGeneratingReply] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<any[]>("/inbox/conversations");
      setConversations(data);
      if (data.length > 0 && !selectedConv) {
        selectConversation(data[0]);
      }
    } catch (e) {
      console.error("Inbox load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setSelectedConv(conv);
    try {
      const msgs = await apiRequest<any[]>(`/inbox/conversations/${conv.id}/messages`);
      setMessages(msgs);
    } catch (e) {
      console.error("Messages load error:", e);
    }
  };

  const handleGenerateAiReply = async () => {
    if (!selectedConv) return;
    try {
      setGeneratingReply(true);
      const res = await apiRequest<any>(`/inbox/conversations/${selectedConv.id}/suggest-reply`, {
        method: "POST",
      });
      setReplyText(res.suggestedReply);
    } catch (e: any) {
      alert("AI suggestion failed: " + (e?.detail || e?.message));
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim()) return;

    try {
      setSending(true);
      await apiRequest<any>(`/inbox/conversations/${selectedConv.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ replyText }),
      });
      setReplyText("");
      selectConversation(selectedConv);
    } catch (e: any) {
      alert("Failed to send reply: " + (e?.detail || e?.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Left Column: Conversation List */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <InboxIcon className="w-4 h-4 text-indigo-600" />
            <span>Customer Messages ({conversations.length})</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {conversations.map((c) => {
            const active = selectedConv?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => selectConversation(c)}
                className={`p-3.5 cursor-pointer transition ${
                  active
                    ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-l-4 border-indigo-600"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {c.senderName || c.externalSenderId}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      c.sentiment === "POSITIVE"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : c.sentiment === "NEGATIVE"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {c.sentiment}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Priority: {c.priority}</span>
                </div>
              </div>
            );
          })}

          {conversations.length === 0 && !loading && (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet. Inbound customer DMs will appear here in real-time.
            </div>
          )}
        </div>
      </div>

      {/* Right: Active Chat Area */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{selectedConv.senderName || selectedConv.externalSenderId}</h3>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Meta 24h Window active until {new Date(selectedConv.messagingWindowExpiresAt || Date.now()).toLocaleTimeString()}</span>
              </p>
            </div>
            <button
              onClick={handleGenerateAiReply}
              disabled={generatingReply}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {generatingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate AI Reply
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/30">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md p-3 rounded-2xl text-xs ${
                    m.direction === "OUTBOUND"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700/60 shadow-sm"
                  }`}
                >
                  <p>{m.contentText}</p>
                  <span className="text-[9px] opacity-70 block text-right mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your approved reply..."
              className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Reply
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          Select a customer conversation on the left to review and respond.
        </div>
      )}
    </div>
  );
}
