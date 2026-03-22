"use client";

import { useState } from "react";
import type { DbUser, DbGroup } from "@/lib/db";

interface Props {
  initialUsers: DbUser[];
  groups: DbGroup[];
  currentPolicyVersion: number;
}

export default function UserManagement({ initialUsers, groups, currentPolicyVersion }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "member">("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [consentFilter, setConsentFilter] = useState<"all" | "consented" | "pending">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>({});

  const filteredUsers = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (activeFilter === "active" && !u.active) return false;
    if (activeFilter === "inactive" && u.active) return false;
    if (consentFilter === "consented" && u.consentVersion !== currentPolicyVersion) return false;
    if (consentFilter === "pending" && u.consentVersion === currentPolicyVersion) return false;
    return true;
  });

  async function updateUser(id: string, updates: Record<string, unknown>) {
    setLoading(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה");
        return;
      }
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } finally {
      setLoading(null);
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`למחוק את ${name}?`)) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setLoading(null);
    }
  }

  const selectCls = "rounded-lg bg-dark-surface px-3 py-2 text-sm text-gray-300 outline-none focus:ring-1 focus:ring-sand";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="חיפוש לפי שם או אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-xl bg-dark-card px-4 py-2.5 text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-sand"
          aria-label="חיפוש משתמשים"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className={selectCls}>
          <option value="all">כל התפקידים</option>
          <option value="admin">מנהלים</option>
          <option value="member">חברים</option>
        </select>
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)} className={selectCls}>
          <option value="all">כל הסטטוסים</option>
          <option value="active">פעילים</option>
          <option value="inactive">מושבתים</option>
        </select>
        {currentPolicyVersion > 0 && (
          <select value={consentFilter} onChange={(e) => setConsentFilter(e.target.value as typeof consentFilter)} className={selectCls}>
            <option value="all">כל האישורים</option>
            <option value="consented">אישרו מדיניות</option>
            <option value="pending">טרם אישרו</option>
          </select>
        )}
      </div>

      <p className="text-sm text-gray-500">
        {filteredUsers.length} משתמשים{search || roleFilter !== "all" || activeFilter !== "all" || consentFilter !== "all" ? ` (מתוך ${users.length})` : ""}
      </p>

      {/* User cards */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-xl bg-dark-card p-8 text-center text-gray-400">
          {users.length === 0 ? "עדיין אין משתמשים" : "לא נמצאו משתמשים"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const isExpanded = expandedUser === user.id;
            return (
              <div key={user.id} className={`rounded-xl bg-dark-card transition-all ${loading === user.id ? "opacity-50" : ""}`}>
                {/* Zone 1+2: Identity + Access Control */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                  {/* Identity */}
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt="" className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive text-lg font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-200">{user.name}</span>
                        {currentPolicyVersion > 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            user.consentVersion === currentPolicyVersion
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}>
                            {user.consentVersion === currentPolicyVersion ? `✓ v${user.consentVersion}` : "טרם אישר/ה"}
                          </span>
                        )}
                        {user.internalCategory && (
                          <span className="rounded-full bg-purple-900/30 px-2 py-0.5 text-xs text-purple-300">
                            {user.internalCategory}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </div>
                  </div>

                  {/* Access Control */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(user.id, { role: e.target.value })}
                      className="rounded-lg bg-dark-surface px-3 py-1.5 text-sm text-gray-300 outline-none"
                    >
                      <option value="member">חבר/ת פלוגה</option>
                      <option value="admin">מנהל</option>
                    </select>

                    <button
                      onClick={() => updateUser(user.id, { active: !user.active })}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        user.active ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {user.active ? "פעיל" : "מושבת"}
                    </button>

                    {/* Inline group pills */}
                    <div className="flex items-center gap-1">
                      {groups.map((group) => {
                        const isIn = user.groups.includes(group.id);
                        return (
                          <button
                            key={group.id}
                            onClick={() => {
                              const newGroups = isIn
                                ? user.groups.filter((g) => g !== group.id)
                                : [...user.groups, group.id];
                              updateUser(user.id, { groups: newGroups });
                            }}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                              isIn ? "ring-1 ring-white/30" : "opacity-40 hover:opacity-70"
                            }`}
                            style={{
                              backgroundColor: group.color + (isIn ? "40" : "15"),
                              color: group.color,
                            }}
                            title={`${isIn ? "הסר מ" : "הוסף ל"}${group.name}`}
                          >
                            {isIn ? "✓ " : ""}{group.name}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                      className="rounded-lg bg-dark-surface px-3 py-1.5 text-sm text-gray-300 hover:bg-dark-bg"
                    >
                      {isExpanded ? "▲" : "▼"} פרטים
                    </button>

                    <button
                      onClick={() => deleteUser(user.id, user.name)}
                      className="rounded-lg px-2 py-1.5 text-sm text-red-400 hover:bg-red-400/10"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Expanded zones */}
                {isExpanded && (
                  <div className="border-t border-dark-surface px-4 pb-4 pt-3 space-y-4">
                    {/* Zone 3: Admin Classification — visually distinct */}
                    <div className="rounded-lg border border-purple-800/30 bg-purple-900/10 p-4">
                      <h4 className="mb-2 text-sm font-bold text-purple-300">
                        🏷️ סיווג פנימי <span className="font-normal text-purple-400/60">(נראה רק למנהלים — לא קשור להרשאות)</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={categoryInputs[user.id] ?? user.internalCategory ?? ""}
                          onChange={(e) => setCategoryInputs((prev) => ({ ...prev, [user.id]: e.target.value }))}
                          placeholder="לדוגמה: מפקד, לוחם ותיק, תורם..."
                          className="flex-1 rounded-lg border border-purple-800/30 bg-dark-bg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
                          maxLength={100}
                        />
                        <button
                          onClick={() => updateUser(user.id, { internalCategory: (categoryInputs[user.id] ?? user.internalCategory ?? "").trim() })}
                          className="rounded-lg bg-purple-800/30 px-4 py-2 text-sm font-bold text-purple-300 hover:bg-purple-800/50"
                        >
                          שמור
                        </button>
                      </div>
                    </div>

                    {/* Zone 4: Profile & Consent Details */}
                    <div className="rounded-lg bg-dark-surface p-4">
                      <h4 className="mb-2 text-sm font-bold text-gray-300">📋 פרטי פרופיל ואישורים</h4>
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <div className="rounded bg-dark-bg p-2">
                          <span className="text-gray-500">הצטרף/ה: </span>
                          <span className="text-white">{new Date(user.createdAt).toLocaleDateString("he-IL")}</span>
                        </div>
                        {user.consentVersion ? (
                          <>
                            <div className="rounded bg-dark-bg p-2">
                              <span className="text-gray-500">אישור מדיניות: </span>
                              <span className="text-white">v{user.consentVersion}</span>
                              {user.consentVersion === currentPolicyVersion
                                ? <span className="mr-1 text-green-400"> ✓</span>
                                : <span className="mr-1 text-red-400"> ✗ לא עדכני</span>}
                            </div>
                            <div className="rounded bg-dark-bg p-2">
                              <span className="text-gray-500">תאריך אישור: </span>
                              <span className="text-white">{user.consentDate ? new Date(user.consentDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" }) : "—"}</span>
                            </div>
                          </>
                        ) : (
                          <div className="rounded bg-dark-bg p-2 text-gray-500">טרם אישר/ה מדיניות</div>
                        )}
                        {user.phone && (
                          <div className="rounded bg-dark-bg p-2">
                            <span className="text-gray-500">טלפון: </span>
                            <span className="text-white" dir="ltr">{user.phone}</span>
                          </div>
                        )}
                        {user.relationToPlugah && (
                          <div className="rounded bg-dark-bg p-2">
                            <span className="text-gray-500">קשר לפלוגה: </span>
                            <span className="text-white">{user.relationToPlugah}</span>
                          </div>
                        )}
                        <div className="rounded bg-dark-bg p-2">
                          <span className="text-gray-500">דיוורים: </span>
                          <span className={user.agreeToMailings ? "text-green-400" : "text-red-400"}>
                            {user.agreeToMailings ? "כן ✓" : "לא ✗"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
