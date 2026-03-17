"use client";

import { useState } from "react";
import type { DbGroup } from "@/lib/db";

const COLORS = [
  "#556B2F",
  "#708090",
  "#D4C89A",
  "#8DB63C",
  "#4A5568",
  "#A89860",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#F59E0B",
];

interface Props {
  initialGroups: DbGroup[];
}

export default function GroupManagement({ initialGroups }: Props) {
  const [groups, setGroups] = useState(initialGroups);
  const [showNew, setShowNew] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New group form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("");

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          color: newColor,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה ביצירת הקבוצה");
        return;
      }
      const group = await res.json();
      setGroups((prev) => [...prev, group]);
      setNewName("");
      setNewDesc("");
      setNewColor(COLORS[0]);
      setShowNew(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName,
          description: editDesc,
          color: editColor,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה בעדכון הקבוצה");
        return;
      }
      const updated = await res.json();
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
      setEditingGroup(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`למחוק את הקבוצה "${name}"? המשתמשים לא יימחקו.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/groups?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה במחיקת הקבוצה");
        return;
      }
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } finally {
      setLoading(false);
    }
  }

  function startEdit(group: DbGroup) {
    setEditingGroup(group.id);
    setEditName(group.name);
    setEditDesc(group.description);
    setEditColor(group.color);
  }

  return (
    <div className="space-y-4">
      {/* Add new group button */}
      <button
        onClick={() => setShowNew(!showNew)}
        className="rounded-xl bg-olive px-6 py-3 font-bold text-white transition-colors hover:bg-olive-light"
      >
        {showNew ? "ביטול" : "+ קבוצה חדשה"}
      </button>

      {/* New group form */}
      {showNew && (
        <div className="rounded-xl bg-dark-card p-6 space-y-4">
          <h2 className="text-xl font-bold text-sand">קבוצה חדשה</h2>
          <div>
            <label className="mb-1 block text-sm text-gray-400">שם הקבוצה</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="לדוגמה: מפקדים"
              className="w-full rounded-lg bg-dark-surface px-4 py-2 text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-sand"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">תיאור</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="תיאור קצר..."
              className="w-full rounded-lg bg-dark-surface px-4 py-2 text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-sand"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">צבע</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    newColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-dark-card" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`צבע ${c}`}
                  aria-pressed={newColor === c}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading || !newName.trim()}
            className="rounded-lg bg-olive px-6 py-2 font-bold text-white transition-colors hover:bg-olive-light disabled:opacity-50"
          >
            {loading ? "יוצר..." : "צור קבוצה"}
          </button>
        </div>
      )}

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="rounded-xl bg-dark-card p-8 text-center">
          <p className="text-gray-400">אין קבוצות. צרו קבוצה חדשה למעלה.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="rounded-xl bg-dark-card p-4">
              {editingGroup === group.id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg bg-dark-surface px-4 py-2 text-gray-200 outline-none focus:ring-2 focus:ring-sand"
                  />
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full rounded-lg bg-dark-surface px-4 py-2 text-gray-200 outline-none focus:ring-2 focus:ring-sand"
                  />
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className={`h-8 w-8 rounded-full transition-all ${
                          editColor === c
                            ? "ring-2 ring-white ring-offset-2 ring-offset-dark-card"
                            : ""
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`צבע ${c}`}
                        aria-pressed={editColor === c}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(group.id)}
                      disabled={loading}
                      className="rounded-lg bg-olive px-4 py-2 text-sm font-bold text-white hover:bg-olive-light disabled:opacity-50"
                    >
                      שמור
                    </button>
                    <button
                      onClick={() => setEditingGroup(null)}
                      className="rounded-lg bg-dark-surface px-4 py-2 text-sm text-gray-300 hover:bg-dark-bg"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <div>
                      <p className="font-bold text-gray-200">{group.name}</p>
                      <p className="text-sm text-gray-500">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(group)}
                      className="rounded-lg bg-dark-surface px-3 py-1.5 text-sm text-gray-300 hover:bg-dark-bg"
                    >
                      ✏️ ערוך
                    </button>
                    <button
                      onClick={() => handleDelete(group.id, group.name)}
                      className="rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10"
                    >
                      🗑️ מחק
                    </button>
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
