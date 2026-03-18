"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/db";

interface Props {
  initialContent: SiteContent;
}

export default function ContentManagement({ initialContent }: Props) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function saveSection(section: string) {
    setSaving(section);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [section]: content[section as keyof SiteContent] }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בשמירה");
      }
      const updated = await res.json();
      setContent(updated);
      setMessage({ type: "success", text: `${sectionLabels[section]} נשמר בהצלחה` });
    } catch (e) {
      setMessage({ type: "error", text: (e as Error).message });
    } finally {
      setSaving(null);
    }
  }

  const sectionLabels: Record<string, string> = {
    hero: "חלק ראשי (Hero)",
    about: "אודות",
    impact: "השפעתנו",
    donation: "תרומות",
    contact: "צור קשר",
  };

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.type === "success"
              ? "bg-green-900/30 text-green-400 border border-green-800"
              : "bg-red-900/30 text-red-400 border border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      <div className="rounded-xl border border-dark-surface bg-dark-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-sand">🏠 חלק ראשי (Hero)</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">כותרת</label>
            <input
              type="text"
              value={content.hero.title}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, title: e.target.value } })
              }
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">כותרת משנה</label>
            <input
              type="text"
              value={content.hero.subtitle}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })
              }
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">תיאור</label>
            <textarea
              value={content.hero.description}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, description: e.target.value } })
              }
              rows={3}
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
        </div>
        <button
          onClick={() => saveSection("hero")}
          disabled={saving === "hero"}
          className="rounded-lg bg-olive px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-olive-light disabled:opacity-50"
        >
          {saving === "hero" ? "שומר..." : "שמור חלק ראשי"}
        </button>
      </div>

      {/* About Section */}
      <div className="rounded-xl border border-dark-surface bg-dark-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-sand">📖 אודות</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">כותרת</label>
            <input
              type="text"
              value={content.about.title}
              onChange={(e) =>
                setContent({ ...content, about: { ...content.about, title: e.target.value } })
              }
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">טקסט (שורות חדשות מפרידות פסקאות)</label>
            <textarea
              value={content.about.text}
              onChange={(e) =>
                setContent({ ...content, about: { ...content.about, text: e.target.value } })
              }
              rows={8}
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">ערכים (מופרדים בפסיקים)</label>
            <input
              type="text"
              value={content.about.values.join(", ")}
              onChange={(e) =>
                setContent({
                  ...content,
                  about: {
                    ...content.about,
                    values: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                  },
                })
              }
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
        </div>
        <button
          onClick={() => saveSection("about")}
          disabled={saving === "about"}
          className="rounded-lg bg-olive px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-olive-light disabled:opacity-50"
        >
          {saving === "about" ? "שומר..." : "שמור אודות"}
        </button>
      </div>

      {/* Impact Section */}
      <div className="rounded-xl border border-dark-surface bg-dark-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-sand">📊 השפעתנו</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">כותרת</label>
            <input
              type="text"
              value={content.impact.title}
              onChange={(e) =>
                setContent({ ...content, impact: { ...content.impact, title: e.target.value } })
              }
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
          {content.impact.stats.map((stat, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-3 rounded-lg bg-dark-bg p-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">תווית</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => {
                    const stats = [...content.impact.stats];
                    stats[idx] = { ...stats[idx], label: e.target.value };
                    setContent({ ...content, impact: { ...content.impact, stats } });
                  }}
                  className="w-full rounded border border-dark-surface bg-dark-card px-3 py-1.5 text-sm text-gray-200 focus:border-olive focus:outline-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">ערך</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => {
                    const stats = [...content.impact.stats];
                    stats[idx] = { ...stats[idx], value: e.target.value };
                    setContent({ ...content, impact: { ...content.impact, stats } });
                  }}
                  className="w-full rounded border border-dark-surface bg-dark-card px-3 py-1.5 text-sm text-gray-200 focus:border-olive focus:outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">אייקון</label>
                <input
                  type="text"
                  value={stat.icon}
                  onChange={(e) => {
                    const stats = [...content.impact.stats];
                    stats[idx] = { ...stats[idx], icon: e.target.value };
                    setContent({ ...content, impact: { ...content.impact, stats } });
                  }}
                  className="w-full rounded border border-dark-surface bg-dark-card px-3 py-1.5 text-sm text-gray-200 focus:border-olive focus:outline-none"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const stats = [...content.impact.stats, { label: "", value: "", icon: "" }];
              setContent({ ...content, impact: { ...content.impact, stats } });
            }}
            className="text-sm text-olive-light hover:underline"
          >
            + הוסף נתון
          </button>
        </div>
        <button
          onClick={() => saveSection("impact")}
          disabled={saving === "impact"}
          className="rounded-lg bg-olive px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-olive-light disabled:opacity-50"
        >
          {saving === "impact" ? "שומר..." : "שמור השפעתנו"}
        </button>
      </div>

      {/* Donation Section */}
      <div className="rounded-xl border border-dark-surface bg-dark-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-sand">💰 תרומות</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">כותרת</label>
            <input
              type="text"
              value={content.donation.title}
              onChange={(e) =>
                setContent({ ...content, donation: { ...content.donation, title: e.target.value } })
              }
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">טקסט</label>
            <textarea
              value={content.donation.text}
              onChange={(e) =>
                setContent({ ...content, donation: { ...content.donation, text: e.target.value } })
              }
              rows={3}
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
        </div>
        <button
          onClick={() => saveSection("donation")}
          disabled={saving === "donation"}
          className="rounded-lg bg-olive px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-olive-light disabled:opacity-50"
        >
          {saving === "donation" ? "שומר..." : "שמור תרומות"}
        </button>
      </div>

      {/* Contact Section */}
      <div className="rounded-xl border border-dark-surface bg-dark-card p-6 space-y-4">
        <h2 className="text-xl font-bold text-sand">📞 צור קשר</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">כותרת</label>
            <input
              type="text"
              value={content.contact.title}
              onChange={(e) =>
                setContent({ ...content, contact: { ...content.contact, title: e.target.value } })
              }
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">טקסט</label>
            <textarea
              value={content.contact.text}
              onChange={(e) =>
                setContent({ ...content, contact: { ...content.contact, text: e.target.value } })
              }
              rows={2}
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">אימייל</label>
            <input
              type="email"
              value={content.contact.email}
              onChange={(e) =>
                setContent({ ...content, contact: { ...content.contact, email: e.target.value } })
              }
              className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>
        <button
          onClick={() => saveSection("contact")}
          disabled={saving === "contact"}
          className="rounded-lg bg-olive px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-olive-light disabled:opacity-50"
        >
          {saving === "contact" ? "שומר..." : "שמור צור קשר"}
        </button>
      </div>
    </div>
  );
}
