"use client";

import { useState } from "react";
import type { DbUpdate } from "@/lib/db";
import type { UpdateMeta } from "@/lib/types";

interface Props {
  initialUpdates: DbUpdate[];
  markdownUpdates: UpdateMeta[];
}

const emptyForm = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  excerpt: "",
  content: "",
  coverImage: "",
  tags: "",
};

export default function UpdatesManagement({ initialUpdates, markdownUpdates }: Props) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [mdUpdates, setMdUpdates] = useState(markdownUpdates);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [migratingSlug, setMigratingSlug] = useState<string | null>(null);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
    setMessage("");
  }

  function openEdit(u: DbUpdate) {
    setForm({
      title: u.title,
      date: u.date,
      excerpt: u.excerpt,
      content: u.content,
      coverImage: u.coverImage || "",
      tags: u.tags.join(", "),
    });
    setEditing(u.id);
    setShowForm(true);
    setMessage("");
  }

  async function handleSave() {
    if (!form.title.trim()) { setMessage("יש להזין כותרת"); return; }
    if (!form.date) { setMessage("יש להזין תאריך"); return; }

    setSaving(true);
    setMessage("");

    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (editing) {
        const res = await fetch("/api/admin/updates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing, title: form.title, date: form.date, excerpt: form.excerpt, content: form.content, coverImage: form.coverImage || undefined, tags }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated = await res.json();
        setUpdates((prev) => prev.map((u) => (u.id === editing ? updated : u)));
        setMessage("העדכון נשמר בהצלחה!");
      } else {
        const res = await fetch("/api/admin/updates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, date: form.date, excerpt: form.excerpt, content: form.content, coverImage: form.coverImage || undefined, tags }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created = await res.json();
        setUpdates((prev) => [...prev, created]);
        setMessage("העדכון נוצר בהצלחה!");
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setMessage(`שגיאה: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`למחוק את "${title}"?`)) return;
    try {
      const res = await fetch("/api/admin/updates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setUpdates((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(`שגיאה: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  }

  async function handleMigrate(slug: string, deleteFile: boolean) {
    setMigratingSlug(slug);
    try {
      const res = await fetch("/api/admin/migrate-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, deleteFile }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { dbUpdate } = await res.json();
      setUpdates((prev) => [...prev, dbUpdate]);
      if (deleteFile) {
        setMdUpdates((prev) => prev.filter((u) => u.slug !== slug));
      }
      setMessage(`"${dbUpdate.title}" הועבר למערכת בהצלחה!${deleteFile ? " הקובץ נמחק." : ""}`);
    } catch (err) {
      setMessage(`שגיאה: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setMigratingSlug(null);
    }
  }

  async function handleDeleteMd(slug: string, title: string) {
    if (!confirm(`למחוק את הקובץ "${title}"? פעולה זו בלתי הפיכה.`)) return;
    try {
      const res = await fetch("/api/admin/migrate-update", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMdUpdates((prev) => prev.filter((u) => u.slug !== slug));
      setMessage(`הקובץ נמחק בהצלחה.`);
    } catch (err) {
      alert(`שגיאה: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  }

  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <button
        onClick={openNew}
        className="rounded-lg bg-olive px-6 py-2 font-bold text-white hover:bg-olive-light"
      >
        + עדכון חדש
      </button>

      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.startsWith("שגיאה") ? "border border-red-600/50 bg-red-900/20 text-red-300" : "border border-green-600/50 bg-green-900/20 text-green-300"}`}>
          {message}
        </div>
      )}

      {/* Editor form */}
      {showForm && (
        <div className="rounded-xl border border-dark-border bg-dark-surface p-6 space-y-4">
          <h2 className="text-lg font-bold text-sand">
            {editing ? "עריכת עדכון" : "עדכון חדש"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">כותרת *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white focus:border-olive focus:outline-none" placeholder="כותרת העדכון" maxLength={200} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">תאריך *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white focus:border-olive focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">תקציר</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white focus:border-olive focus:outline-none" rows={2} placeholder="תיאור קצר שיופיע בכרטיס..." maxLength={500} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">תוכן (Markdown)</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 font-mono text-sm text-white focus:border-olive focus:outline-none" rows={10} placeholder="כתבו כאן את התוכן המלא..." dir="rtl" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">קישור לתמונת כיסוי</label>
              <input type="text" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white focus:border-olive focus:outline-none" placeholder="/images/gallery/photo.jpg או URL" dir="ltr" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">תגיות (מופרדות בפסיק)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white focus:border-olive focus:outline-none" placeholder="אימון, 2024, קיץ" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-olive px-6 py-2 font-bold text-white hover:bg-olive-light disabled:opacity-50">
              {saving ? "שומר..." : editing ? "שמור שינויים" : "צור עדכון"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-lg bg-dark-bg px-6 py-2 text-gray-300 hover:bg-dark-card">
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* DB Updates */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-white">
          עדכונים במערכת <span className="text-sm font-normal text-gray-500">({updates.length})</span>
        </h3>
        {sortedUpdates.length === 0 ? (
          <div className="rounded-xl bg-dark-card p-6 text-center text-gray-400">
            אין עדכונים במערכת עדיין.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedUpdates.map((u) => (
              <div key={u.id} className="rounded-xl bg-dark-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{u.title}</span>
                      <span className="text-sm text-gray-500">{new Date(u.date).toLocaleDateString("he-IL")}</span>
                    </div>
                    {u.excerpt && <p className="mt-1 text-sm text-gray-400 line-clamp-1">{u.excerpt}</p>}
                    {u.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {u.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-olive/20 px-2 py-0.5 text-xs text-olive-light">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(u)} className="rounded-lg bg-dark-surface px-3 py-1.5 text-sm text-gray-300 hover:bg-dark-bg">✏️ ערוך</button>
                    <button onClick={() => handleDelete(u.id, u.title)} className="rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10">🗑️ מחק</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Markdown Updates (legacy) */}
      {mdUpdates.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">
            📁 עדכונים מקבצי Markdown <span className="text-sm font-normal text-gray-500">({mdUpdates.length} קבצים)</span>
          </h3>
          <p className="mb-3 text-sm text-gray-400">
            עדכונים אלה נמצאים בקבצי Markdown בתוך הפרויקט. ניתן להעביר אותם למערכת הניהול או למחוק אותם.
          </p>
          <div className="space-y-3">
            {mdUpdates.map((u) => (
              <div key={u.slug} className="rounded-xl border border-amber-800/30 bg-amber-900/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-amber-800/30 px-2 py-0.5 text-xs text-amber-300">MD</span>
                      <span className="font-bold text-white">{u.title}</span>
                      <span className="text-sm text-gray-500">{u.date ? new Date(u.date).toLocaleDateString("he-IL") : ""}</span>
                    </div>
                    {u.excerpt && <p className="mt-1 text-sm text-gray-400 line-clamp-1">{u.excerpt}</p>}
                    <p className="mt-1 text-xs text-gray-600">קובץ: content/updates/{u.slug}.md</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMigrate(u.slug, true)}
                      disabled={migratingSlug === u.slug}
                      className="rounded-lg bg-olive px-3 py-1.5 text-sm font-bold text-white hover:bg-olive-light disabled:opacity-50"
                    >
                      {migratingSlug === u.slug ? "מעביר..." : "📥 העבר למערכת ומחק קובץ"}
                    </button>
                    <button
                      onClick={() => handleMigrate(u.slug, false)}
                      disabled={migratingSlug === u.slug}
                      className="rounded-lg bg-dark-surface px-3 py-1.5 text-sm text-gray-300 hover:bg-dark-bg disabled:opacity-50"
                    >
                      📋 העתק למערכת
                    </button>
                    <button
                      onClick={() => handleDeleteMd(u.slug, u.title)}
                      className="rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10"
                    >
                      🗑️ מחק קובץ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
