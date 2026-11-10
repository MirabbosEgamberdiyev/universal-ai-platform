"use client";

import React, { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useAuth } from "../../lib/auth/AuthContext";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  MoreVertical, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Shield
} from "lucide-react";

interface Member {
  id: string;
  fullName: string;
  email: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  status: "ACTIVE" | "PENDING";
  joinedAt: string;
}

export default function TeamPage() {
  const { t, language } = useLanguage();
  const { activeOrg, user } = useAuth();

  const [members, setMembers] = useState<Member[]>([
    {
      id: "mem-1",
      fullName: user?.fullName || "Lead Administrator",
      email: user?.email || "admin@omnicorp.ai",
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: "2026-10-01"
    },
    {
      id: "mem-2",
      fullName: "Nodira Karimova",
      email: "nodira.smm@omnicorp.ai",
      role: "EDITOR",
      status: "ACTIVE",
      joinedAt: "2026-10-15"
    },
    {
      id: "mem-3",
      fullName: "Alexey Smirnov",
      email: "alexey.marketing@omnicorp.ai",
      role: "ADMIN",
      status: "ACTIVE",
      joinedAt: "2026-10-20"
    },
    {
      id: "mem-4",
      fullName: "Jasur Rahimov",
      email: "jasur.analytics@omnicorp.ai",
      role: "VIEWER",
      status: "PENDING",
      joinedAt: "2026-11-04"
    }
  ]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      fullName: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "PENDING",
      joinedAt: "Just now"
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    setIsInviteOpen(false);
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const getRoleBadge = (role: Member["role"]) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "ADMIN":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "EDITOR":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "VIEWER":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>{t.nav.team}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === "uz-Latn"
              ? "Tashkilot xodimlari, rollar va kirish huquqlarini boshqarish"
              : language === "ru"
              ? "Управление участниками рабочей области, ролями и уровнями доступа"
              : `Manage organization members, workspace access, and RBAC roles in ${activeOrg?.name || "Workspace"}`}
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>
            {language === "uz-Latn" ? "A'zo taklif qilish" : language === "ru" ? "Пригласить участника" : "Invite Member"}
          </span>
        </button>
      </div>

      {inviteSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            {language === "uz-Latn"
              ? "Taklifnoma muvaffaqiyatli yuborildi!"
              : language === "ru"
              ? "Приглашение успешно отправлено!"
              : "Invitation email successfully dispatched!"}
          </span>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {language === "uz-Latn" ? `Jamoa a'zolari (${members.length})` : language === "ru" ? `Участники (${members.length})` : `Members (${members.length})`}
          </h3>
          <span className="text-xs text-slate-500">
            {activeOrg?.name || "OmniCorp Digital"}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300">
                  {member.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{member.fullName}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRoleBadge(member.role)}`}>
                      {member.role}
                    </span>
                    {member.status === "PENDING" && (
                      <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                        Pending
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{member.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="hidden sm:inline text-[11px]">Joined: {member.joinedAt}</span>
                {member.role !== "OWNER" && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role permission matrix explanation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { role: "OWNER", desc: "Full administrative ownership, billing, workspace deletion, autonomy settings." },
          { role: "ADMIN", desc: "Team invitation, connect social channels, configure brand voice and workflows." },
          { role: "EDITOR", desc: "Generate content in Studio, schedule publications, manage Inbox messages." },
          { role: "VIEWER", desc: "Read-only access to analytics dashboards, calendar, and published logs." }
        ].map((item) => (
          <div key={item.role} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{item.role}</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === "uz-Latn" ? "Yangi a'zoni taklif qilish" : language === "ru" ? "Пригласить нового участника" : "Invite Team Member"}
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workspace Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ADMIN">ADMIN — Management & Integrations</option>
                  <option value="EDITOR">EDITOR — Content Creation & Scheduling</option>
                  <option value="VIEWER">VIEWER — Analytics & Reporting</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
                >
                  {language === "uz-Latn" ? "Taklifnoma yuborish" : language === "ru" ? "Отправить инвайт" : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
