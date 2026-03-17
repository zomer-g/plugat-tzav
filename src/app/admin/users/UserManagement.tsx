"use client";

import { useState } from "react";
import type { DbUser, DbGroup } from "@/lib/db";

interface Props {
  initialUsers: DbUser[];
  groups: DbGroup[];
}

export default function UserManagement({ initialUsers, groups }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleUpdateUser(
    id: string,
    updates: Partial<Pick<DbUser, "role" | "groups" | "active">>
  ) {
    setLoading(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה בעדכון המשתמש");
        return;
      }
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } finally {
      setLoading(null);
    }
  }

  async function handleDeleteUser(id: string, name: string) {
    if (!confirm(`למחוק את המשתמש ${name}?`)) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה במחיקת המשתמש");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setLoading(null);
    }
  }

  function toggleGroup(userId: string, groupId: string, currentGroups: string[]) {
    const newGroups = currentGroups.includes(groupId)
      ? currentGroups.filter((g) => g !== groupId)
      : [...currentGroups, groupId];
    handleUpdateUser(userId, { groups: newGroups });
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="חיפוש לפי שם או אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-dark-card px-4 py-3 text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-sand"
          aria-label="חיפוש משתמשים"
        />
      </div>

      {/* Users count */}
      <p className="text-sm text-gray-500">
        {filteredUsers.length} משתמשים{search ? ` (מתוך ${users.length})` : ""}
      </p>

      {/* Users list */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-xl bg-dark-card p-8 text-center">
          <p className="text-gray-400">
            {users.length === 0
              ? "עדיין אין משתמשים רשומים. משתמשים נוספים אוטומטית בהתחברות הראשונה."
              : "לא נמצאו משתמשים התואמים את החיפוש"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`rounded-xl bg-dark-card p-4 transition-all ${
                loading === user.id ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* User info */}
                <div className="flex items-center gap-3">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="h-10 w-10 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive text-lg font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-200">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Role toggle */}
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleUpdateUser(user.id, {
                        role: e.target.value as "admin" | "member",
                      })
                    }
                    className="rounded-lg bg-dark-surface px-3 py-1.5 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-sand"
                    aria-label={`תפקיד ${user.name}`}
                  >
                    <option value="member">חבר/ת פלוגה</option>
                    <option value="admin">מנהל</option>
                  </select>

                  {/* Active toggle */}
                  <button
                    onClick={() =>
                      handleUpdateUser(user.id, { active: !user.active })
                    }
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      user.active
                        ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                        : "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                    }`}
                    aria-label={`${user.active ? "השבת" : "הפעל"} ${user.name}`}
                  >
                    {user.active ? "פעיל" : "מושבת"}
                  </button>

                  {/* Edit groups */}
                  <button
                    onClick={() =>
                      setEditingUser(editingUser === user.id ? null : user.id)
                    }
                    className="rounded-lg bg-dark-surface px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-dark-bg"
                    aria-expanded={editingUser === user.id}
                    aria-label={`ערוך קבוצות ${user.name}`}
                  >
                    🏷️ קבוצות ({user.groups.length})
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-400/10"
                    aria-label={`מחק ${user.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Groups editor */}
              {editingUser === user.id && (
                <div className="mt-4 rounded-lg bg-dark-surface p-4">
                  <p className="mb-3 text-sm font-bold text-gray-300">
                    שיוך לקבוצות:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group) => {
                      const isIn = user.groups.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          onClick={() =>
                            toggleGroup(user.id, group.id, user.groups)
                          }
                          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                            isIn
                              ? "ring-2 ring-white/30"
                              : "opacity-50 hover:opacity-80"
                          }`}
                          style={{
                            backgroundColor: group.color + (isIn ? "40" : "20"),
                            color: group.color,
                          }}
                          aria-pressed={isIn}
                          aria-label={`${isIn ? "הסר מ" : "הוסף ל"}קבוצת ${group.name}`}
                        >
                          {isIn ? "✓ " : ""}
                          {group.name}
                        </button>
                      );
                    })}
                    {groups.length === 0 && (
                      <p className="text-sm text-gray-500">
                        אין קבוצות. צרו קבוצות בדף ניהול קבוצות.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
