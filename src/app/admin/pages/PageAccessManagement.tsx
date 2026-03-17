"use client";

import { useState } from "react";
import type { PageAccess, PageAccessLevel, DbGroup } from "@/lib/db";

interface Props {
  initialPages: PageAccess[];
  groups: DbGroup[];
}

const LEVEL_LABELS: Record<PageAccessLevel, { label: string; icon: string; desc: string }> = {
  public: { label: "פתוח", icon: "🌐", desc: "נגיש לכולם ללא התחברות" },
  members: { label: "חברים", icon: "🔒", desc: "כל חברי הפלוגה המחוברים" },
  groups: { label: "קבוצות", icon: "🏷️", desc: "קבוצות ספציפיות בלבד" },
};

export default function PageAccessManagement({ initialPages, groups }: Props) {
  const [pages, setPages] = useState(initialPages);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  // New page form
  const [newPageId, setNewPageId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newLevel, setNewLevel] = useState<PageAccessLevel>("members");
  const [newGroups, setNewGroups] = useState<string[]>([]);

  async function handleSave(page: PageAccess) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה בשמירה");
        return;
      }
      setPages((prev) => {
        const idx = prev.findIndex((p) => p.pageId === page.pageId);
        if (idx === -1) return [...prev, page];
        const updated = [...prev];
        updated[idx] = page;
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(pageId: string) {
    if (!confirm("למחוק הגדרת גישה זו?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/pages?pageId=${encodeURIComponent(pageId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "שגיאה במחיקה");
        return;
      }
      setPages((prev) => prev.filter((p) => p.pageId !== pageId));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNew() {
    if (!newPageId.trim() || !newLabel.trim()) return;
    const page: PageAccess = {
      pageId: newPageId.trim(),
      label: newLabel.trim(),
      level: newLevel,
      allowedGroups: newLevel === "groups" ? newGroups : [],
    };
    await handleSave(page);
    setNewPageId("");
    setNewLabel("");
    setNewLevel("members");
    setNewGroups([]);
    setShowNew(false);
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-xl bg-dark-card p-4">
        {Object.entries(LEVEL_LABELS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span>{val.icon}</span>
            <span className="font-bold text-gray-200">{val.label}</span>
            <span className="text-gray-500">— {val.desc}</span>
          </div>
        ))}
      </div>

      {/* Add new page rule */}
      <button
        onClick={() => setShowNew(!showNew)}
        className="rounded-xl bg-olive px-6 py-3 font-bold text-white transition-colors hover:bg-olive-light"
      >
        {showNew ? "ביטול" : "+ כלל גישה חדש"}
      </button>

      {showNew && (
        <div className="rounded-xl bg-dark-card p-6 space-y-4">
          <h2 className="text-xl font-bold text-sand">כלל גישה חדש</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">
                מזהה דף (Route)
              </label>
              <input
                type="text"
                value={newPageId}
                onChange={(e) => setNewPageId(e.target.value)}
                placeholder="לדוגמה: members/secret-docs"
                className="w-full rounded-lg bg-dark-surface px-4 py-2 text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-sand"
                dir="ltr"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">
                תיאור הדף
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="לדוגמה: מסמכים סודיים"
                className="w-full rounded-lg bg-dark-surface px-4 py-2 text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-sand"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-400">רמת גישה</label>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(LEVEL_LABELS) as [PageAccessLevel, typeof LEVEL_LABELS.public][]).map(
                ([level, info]) => (
                  <button
                    key={level}
                    onClick={() => setNewLevel(level)}
                    className={`rounded-lg px-4 py-2 text-sm transition-all ${
                      newLevel === level
                        ? "bg-olive text-white ring-2 ring-olive-light"
                        : "bg-dark-surface text-gray-300 hover:bg-dark-bg"
                    }`}
                    aria-pressed={newLevel === level}
                  >
                    {info.icon} {info.label}
                  </button>
                )
              )}
            </div>
          </div>
          {newLevel === "groups" && (
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                קבוצות מורשות
              </label>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const selected = newGroups.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() =>
                        setNewGroups((prev) =>
                          selected
                            ? prev.filter((id) => id !== g.id)
                            : [...prev, g.id]
                        )
                      }
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                        selected
                          ? "ring-2 ring-white/30"
                          : "opacity-50 hover:opacity-80"
                      }`}
                      style={{
                        backgroundColor: g.color + (selected ? "40" : "20"),
                        color: g.color,
                      }}
                      aria-pressed={selected}
                    >
                      {selected ? "✓ " : ""}
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button
            onClick={handleCreateNew}
            disabled={loading || !newPageId.trim() || !newLabel.trim()}
            className="rounded-lg bg-olive px-6 py-2 font-bold text-white hover:bg-olive-light disabled:opacity-50"
          >
            {loading ? "שומר..." : "שמור"}
          </button>
        </div>
      )}

      {/* Existing pages */}
      {pages.length === 0 ? (
        <div className="rounded-xl bg-dark-card p-8 text-center">
          <p className="text-gray-400">אין כללי גישה מוגדרים.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <PageAccessRow
              key={page.pageId}
              page={page}
              groups={groups}
              onSave={handleSave}
              onDelete={handleDelete}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PageAccessRow({
  page,
  groups,
  onSave,
  onDelete,
  loading,
}: {
  page: PageAccess;
  groups: DbGroup[];
  onSave: (page: PageAccess) => Promise<void>;
  onDelete: (pageId: string) => Promise<void>;
  loading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [level, setLevel] = useState(page.level);
  const [allowedGroups, setAllowedGroups] = useState(page.allowedGroups);

  function handleSaveClick() {
    onSave({
      ...page,
      level,
      allowedGroups: level === "groups" ? allowedGroups : [],
    });
    setEditing(false);
  }

  const info = LEVEL_LABELS[page.level];
  const pageGroups = groups.filter((g) => page.allowedGroups.includes(g.id));

  return (
    <div className="rounded-xl bg-dark-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span>{info.icon}</span>
            <p className="font-bold text-gray-200">{page.label}</p>
          </div>
          <p className="text-sm text-gray-500" dir="ltr">
            /{page.pageId}
          </p>
          {page.level === "groups" && pageGroups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {pageGroups.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: g.color + "30",
                    color: g.color,
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-lg bg-dark-surface px-3 py-1.5 text-sm text-gray-300 hover:bg-dark-bg"
          >
            ✏️ ערוך
          </button>
          <button
            onClick={() => onDelete(page.pageId)}
            className="rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10"
          >
            🗑️
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-3 rounded-lg bg-dark-surface p-4">
          <div className="flex flex-wrap gap-3">
            {(Object.entries(LEVEL_LABELS) as [PageAccessLevel, typeof LEVEL_LABELS.public][]).map(
              ([lvl, lvlInfo]) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`rounded-lg px-4 py-2 text-sm transition-all ${
                    level === lvl
                      ? "bg-olive text-white ring-2 ring-olive-light"
                      : "bg-dark-card text-gray-300 hover:bg-dark-bg"
                  }`}
                  aria-pressed={level === lvl}
                >
                  {lvlInfo.icon} {lvlInfo.label}
                </button>
              )
            )}
          </div>
          {level === "groups" && (
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => {
                const selected = allowedGroups.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() =>
                      setAllowedGroups((prev) =>
                        selected
                          ? prev.filter((id) => id !== g.id)
                          : [...prev, g.id]
                      )
                    }
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      selected
                        ? "ring-2 ring-white/30"
                        : "opacity-50 hover:opacity-80"
                    }`}
                    style={{
                      backgroundColor: g.color + (selected ? "40" : "20"),
                      color: g.color,
                    }}
                    aria-pressed={selected}
                  >
                    {selected ? "✓ " : ""}
                    {g.name}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSaveClick}
              disabled={loading}
              className="rounded-lg bg-olive px-4 py-2 text-sm font-bold text-white hover:bg-olive-light disabled:opacity-50"
            >
              שמור
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg bg-dark-card px-4 py-2 text-sm text-gray-300 hover:bg-dark-bg"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
