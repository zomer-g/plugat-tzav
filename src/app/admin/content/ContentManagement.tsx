"use client";

import { useState } from "react";
import type { SiteContent, PageLayout, PageSection } from "@/lib/db";

interface SectionMeta {
  type: string;
  label: string;
  icon: string;
}

const SECTION_TYPES: SectionMeta[] = [
  { type: "hero", label: "חלק ראשי (Hero)", icon: "🏠" },
  { type: "about", label: "אודות", icon: "📖" },
  { type: "impact", label: "השפעתנו", icon: "📊" },
  { type: "gallery", label: "עדכונים וגלריה", icon: "🖼️" },
  { type: "timeline", label: "ציר הזמן", icon: "📅" },
  { type: "donation", label: "תרומות", icon: "💰" },
  { type: "contact", label: "צור קשר", icon: "📧" },
  { type: "impactDashboard", label: "דשבורד השפעה", icon: "📊" },
  { type: "navbar", label: "ניווט עליון", icon: "🔗" },
  { type: "footer", label: "כותרת תחתונה", icon: "📋" },
];

function getMeta(type: string): SectionMeta {
  return SECTION_TYPES.find((s) => s.type === type) || { type, label: type, icon: "📄" };
}

interface Props {
  initialContent: SiteContent;
  initialLayout: PageLayout;
}

export default function ContentManagement({ initialContent, initialLayout }: Props) {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [layout, setLayout] = useState<PageLayout>(initialLayout);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sortedSections = [...layout.sections].sort((a, b) => a.order - b.order);

  async function saveContent(section: string) {
    setSaving(section);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [section]: content[section as keyof SiteContent] }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "שגיאה");
      const updated = await res.json();
      setContent(updated);
      setMsg({ type: "success", text: `${getMeta(section).label} נשמר בהצלחה` });
    } catch (e) {
      setMsg({ type: "error", text: (e as Error).message });
    } finally {
      setSaving(null);
    }
  }

  async function saveLayout(newSections: PageSection[]) {
    try {
      const res = await fetch("/api/admin/page-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: "main", sections: newSections }),
      });
      if (!res.ok) throw new Error("שגיאה בשמירת הסידור");
      const updated = await res.json();
      setLayout(updated);
    } catch (e) {
      setMsg({ type: "error", text: (e as Error).message });
    }
  }

  function moveSection(id: string, dir: -1 | 1) {
    const sorted = [...layout.sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === sorted.length - 1)) return;
    const swapIdx = idx + dir;
    const newSections = sorted.map((s, i) => {
      if (i === idx) return { ...s, order: swapIdx };
      if (i === swapIdx) return { ...s, order: idx };
      return { ...s, order: i };
    });
    saveLayout(newSections);
  }

  function toggleSection(id: string) {
    const newSections = layout.sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    saveLayout(newSections);
  }

  function removeSection(id: string) {
    if (!confirm("להסיר את הסקשן? (התוכן נשמר)")) return;
    const newSections = layout.sections.filter((s) => s.id !== id);
    saveLayout(newSections);
  }

  function addSection(type: string) {
    const maxOrder = layout.sections.reduce((max, s) => Math.max(max, s.order), -1);
    const newSection: PageSection = {
      id: type + "-" + Date.now(),
      type,
      enabled: true,
      order: maxOrder + 1,
    };
    saveLayout([...layout.sections, newSection]);
  }

  const usedTypes = new Set(layout.sections.map((s) => s.type));
  const availableTypes = SECTION_TYPES.filter((t) =>
    !usedTypes.has(t.type) && ["hero", "about", "impact", "gallery", "timeline", "donation", "contact", "impactDashboard"].includes(t.type)
  );

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`rounded-lg p-3 text-sm ${msg.type === "success" ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: Section list */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-400">סדר סקשנים בעמוד הראשי</h3>
          {sortedSections.map((section, idx) => {
            const meta = getMeta(section.type);
            return (
              <div
                key={section.id}
                className={`rounded-lg border p-3 transition-all cursor-pointer ${
                  selected === section.type
                    ? "border-olive bg-olive/10"
                    : "border-dark-surface bg-dark-card hover:border-dark-border"
                } ${!section.enabled ? "opacity-50" : ""}`}
                onClick={() => setSelected(section.type)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{meta.icon}</span>
                    <span className="text-sm font-bold text-white">{meta.label}</span>
                    {!section.enabled && (
                      <span className="rounded bg-red-900/30 px-1.5 py-0.5 text-xs text-red-400">מוסתר</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1); }}
                      disabled={idx === 0}
                      className="rounded p-1 text-gray-400 hover:bg-dark-bg hover:text-white disabled:opacity-30"
                      title="הזז למעלה"
                    >▲</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1); }}
                      disabled={idx === sortedSections.length - 1}
                      className="rounded p-1 text-gray-400 hover:bg-dark-bg hover:text-white disabled:opacity-30"
                      title="הזז למטה"
                    >▼</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                      className={`rounded p-1 text-xs ${section.enabled ? "text-green-400 hover:text-red-400" : "text-red-400 hover:text-green-400"}`}
                      title={section.enabled ? "הסתר" : "הצג"}
                    >{section.enabled ? "👁️" : "🚫"}</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                      className="rounded p-1 text-red-400 hover:bg-red-900/20"
                      title="הסר"
                    >✕</button>
                  </div>
                </div>
              </div>
            );
          })}

          {availableTypes.length > 0 && (
            <div className="pt-2">
              <select
                onChange={(e) => { if (e.target.value) { addSection(e.target.value); e.target.value = ""; } }}
                className="w-full rounded-lg border border-dashed border-dark-surface bg-dark-bg px-3 py-2 text-sm text-gray-400"
                defaultValue=""
              >
                <option value="" disabled>+ הוסף סקשן...</option>
                {availableTypes.map((t) => (
                  <option key={t.type} value={t.type}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Always-available sections (navbar/footer) */}
          <div className="border-t border-dark-surface pt-3">
            <h3 className="mb-2 text-sm font-bold text-gray-400">הגדרות גלובליות</h3>
            {(["navbar", "footer"] as const).map((type) => {
              const meta = getMeta(type);
              return (
                <div
                  key={type}
                  className={`mb-2 rounded-lg border p-3 cursor-pointer transition-all ${
                    selected === type ? "border-olive bg-olive/10" : "border-dark-surface bg-dark-card hover:border-dark-border"
                  }`}
                  onClick={() => setSelected(type)}
                >
                  <span>{meta.icon} {meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Section editor */}
        <div className="rounded-xl border border-dark-surface bg-dark-card p-6">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>בחר סקשן מהרשימה כדי לערוך את התוכן שלו</p>
            </div>
          ) : (
            <SectionEditor
              type={selected}
              content={content}
              setContent={setContent}
              onSave={() => saveContent(selected)}
              saving={saving === selected}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section Editor ──────────────────────────────────────────────────────

function SectionEditor({ type, content, setContent, onSave, saving }: {
  type: string;
  content: SiteContent;
  setContent: (c: SiteContent) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const meta = getMeta(type);

  const inputCls = "w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none";
  const labelCls = "mb-1 block text-sm text-gray-400";

  function renderFields() {
    switch (type) {
      case "hero":
        return (
          <>
            <Field label="כותרת" value={content.hero.title} onChange={(v) => setContent({ ...content, hero: { ...content.hero, title: v } })} />
            <Field label="כותרת משנה" value={content.hero.subtitle} onChange={(v) => setContent({ ...content, hero: { ...content.hero, subtitle: v } })} />
            <TextArea label="תיאור" value={content.hero.description} onChange={(v) => setContent({ ...content, hero: { ...content.hero, description: v } })} />
            <Field label="טקסט כפתור תרומה" value={content.hero.donateButtonText} onChange={(v) => setContent({ ...content, hero: { ...content.hero, donateButtonText: v } })} />
            <Field label="טקסט כפתור למידע" value={content.hero.learnMoreButtonText} onChange={(v) => setContent({ ...content, hero: { ...content.hero, learnMoreButtonText: v } })} />
          </>
        );

      case "about":
        return (
          <>
            <Field label="כותרת" value={content.about.title} onChange={(v) => setContent({ ...content, about: { ...content.about, title: v } })} />
            <TextArea label="טקסט" value={content.about.text} rows={6} onChange={(v) => setContent({ ...content, about: { ...content.about, text: v } })} />
            <div>
              <label className={labelCls}>ערכים</label>
              {content.about.values.map((val, idx) => (
                <div key={idx} className="mb-2 grid grid-cols-[40px_1fr_1fr_30px] gap-2">
                  <input value={val.icon} onChange={(e) => {
                    const values = [...content.about.values];
                    values[idx] = { ...values[idx], icon: e.target.value };
                    setContent({ ...content, about: { ...content.about, values } });
                  }} className={inputCls} placeholder="🛡️" />
                  <input value={val.name} onChange={(e) => {
                    const values = [...content.about.values];
                    values[idx] = { ...values[idx], name: e.target.value };
                    setContent({ ...content, about: { ...content.about, values } });
                  }} className={inputCls} placeholder="שם" dir="rtl" />
                  <input value={val.description} onChange={(e) => {
                    const values = [...content.about.values];
                    values[idx] = { ...values[idx], description: e.target.value };
                    setContent({ ...content, about: { ...content.about, values } });
                  }} className={inputCls} placeholder="תיאור" dir="rtl" />
                  <button onClick={() => {
                    const values = content.about.values.filter((_, i) => i !== idx);
                    setContent({ ...content, about: { ...content.about, values } });
                  }} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button onClick={() => {
                const values = [...content.about.values, { name: "", icon: "⭐", description: "" }];
                setContent({ ...content, about: { ...content.about, values } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף ערך</button>
            </div>
          </>
        );

      case "impact":
        return (
          <>
            <Field label="כותרת" value={content.impact.title} onChange={(v) => setContent({ ...content, impact: { ...content.impact, title: v } })} />
            <Field label="כותרת משנה" value={content.impact.subtitle} onChange={(v) => setContent({ ...content, impact: { ...content.impact, subtitle: v } })} />
            <div>
              <label className={labelCls}>נתונים</label>
              {content.impact.stats.map((stat, idx) => (
                <div key={idx} className="mb-2 grid grid-cols-[40px_1fr_80px_30px] gap-2">
                  <input value={stat.icon} onChange={(e) => {
                    const stats = [...content.impact.stats];
                    stats[idx] = { ...stats[idx], icon: e.target.value };
                    setContent({ ...content, impact: { ...content.impact, stats } });
                  }} className={inputCls} />
                  <input value={stat.label} onChange={(e) => {
                    const stats = [...content.impact.stats];
                    stats[idx] = { ...stats[idx], label: e.target.value };
                    setContent({ ...content, impact: { ...content.impact, stats } });
                  }} className={inputCls} dir="rtl" placeholder="תווית" />
                  <input value={stat.value} onChange={(e) => {
                    const stats = [...content.impact.stats];
                    stats[idx] = { ...stats[idx], value: e.target.value };
                    setContent({ ...content, impact: { ...content.impact, stats } });
                  }} className={inputCls} dir="ltr" placeholder="ערך" />
                  <button onClick={() => {
                    const stats = content.impact.stats.filter((_, i) => i !== idx);
                    setContent({ ...content, impact: { ...content.impact, stats } });
                  }} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button onClick={() => {
                const stats = [...content.impact.stats, { label: "", value: "", icon: "" }];
                setContent({ ...content, impact: { ...content.impact, stats } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף נתון</button>
            </div>
          </>
        );

      case "donation":
        return (
          <>
            <Field label="כותרת" value={content.donation.title} onChange={(v) => setContent({ ...content, donation: { ...content.donation, title: v } })} />
            <TextArea label="טקסט" value={content.donation.text} onChange={(v) => setContent({ ...content, donation: { ...content.donation, text: v } })} />
            <Field label="טקסט כפתור משני" value={content.donation.secondaryButtonText} onChange={(v) => setContent({ ...content, donation: { ...content.donation, secondaryButtonText: v } })} />
            <Field label="הערת מס" value={content.donation.taxNote} onChange={(v) => setContent({ ...content, donation: { ...content.donation, taxNote: v } })} />
            <div>
              <label className={labelCls}>אמצעי תשלום</label>
              <p className="mb-2 text-xs text-gray-500">הוסיפו קישורים לאמצעי תשלום שונים. הראשון יוצג ככפתור ראשי.</p>
              {(content.donation.paymentLinks || []).map((link, idx) => (
                <div key={idx} className="mb-2 grid grid-cols-[40px_1fr_1fr_30px] gap-2">
                  <input value={link.icon} onChange={(e) => {
                    const paymentLinks = [...(content.donation.paymentLinks || [])];
                    paymentLinks[idx] = { ...paymentLinks[idx], icon: e.target.value };
                    setContent({ ...content, donation: { ...content.donation, paymentLinks } });
                  }} className={inputCls} placeholder="💳" />
                  <input value={link.label} onChange={(e) => {
                    const paymentLinks = [...(content.donation.paymentLinks || [])];
                    paymentLinks[idx] = { ...paymentLinks[idx], label: e.target.value };
                    setContent({ ...content, donation: { ...content.donation, paymentLinks } });
                  }} className={inputCls} placeholder="שם (PayBox, ביט...)" dir="rtl" />
                  <input value={link.url} onChange={(e) => {
                    const paymentLinks = [...(content.donation.paymentLinks || [])];
                    paymentLinks[idx] = { ...paymentLinks[idx], url: e.target.value };
                    setContent({ ...content, donation: { ...content.donation, paymentLinks } });
                  }} className={inputCls} placeholder="https://..." dir="ltr" />
                  <button onClick={() => {
                    const paymentLinks = (content.donation.paymentLinks || []).filter((_, i) => i !== idx);
                    setContent({ ...content, donation: { ...content.donation, paymentLinks } });
                  }} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button onClick={() => {
                const paymentLinks = [...(content.donation.paymentLinks || []), { label: "", url: "", icon: "💳" }];
                setContent({ ...content, donation: { ...content.donation, paymentLinks } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף אמצעי תשלום</button>
            </div>
          </>
        );

      case "contact":
        return (
          <>
            <Field label="כותרת" value={content.contact.title} onChange={(v) => setContent({ ...content, contact: { ...content.contact, title: v } })} />
            <TextArea label="טקסט" value={content.contact.text} onChange={(v) => setContent({ ...content, contact: { ...content.contact, text: v } })} />
            <Field label="אימייל" value={content.contact.email} onChange={(v) => setContent({ ...content, contact: { ...content.contact, email: v } })} dir="ltr" />
            <Field label="טקסט טלפון" value={content.contact.phoneText} onChange={(v) => setContent({ ...content, contact: { ...content.contact, phoneText: v } })} />
            <Field label="טקסט מיקום" value={content.contact.locationText} onChange={(v) => setContent({ ...content, contact: { ...content.contact, locationText: v } })} />
          </>
        );

      case "gallery":
        return (
          <>
            <Field label="כותרת" value={content.gallery.title} onChange={(v) => setContent({ ...content, gallery: { ...content.gallery, title: v } })} />
            <Field label="כותרת משנה" value={content.gallery.subtitle} onChange={(v) => setContent({ ...content, gallery: { ...content.gallery, subtitle: v } })} />
          </>
        );

      case "timeline":
        return (
          <>
            <Field label="כותרת" value={content.timeline.title} onChange={(v) => setContent({ ...content, timeline: { ...content.timeline, title: v } })} />
            <Field label="כותרת משנה" value={content.timeline.subtitle} onChange={(v) => setContent({ ...content, timeline: { ...content.timeline, subtitle: v } })} />
            <div>
              <label className={labelCls}>אירועים</label>
              {content.timeline.entries.map((entry, idx) => (
                <div key={idx} className="mb-3 rounded-lg bg-dark-bg p-3 space-y-2">
                  <div className="grid grid-cols-[80px_1fr_30px] gap-2">
                    <input value={entry.date} onChange={(e) => {
                      const entries = [...content.timeline.entries];
                      entries[idx] = { ...entries[idx], date: e.target.value };
                      setContent({ ...content, timeline: { ...content.timeline, entries } });
                    }} className={inputCls} placeholder="שנה" dir="ltr" />
                    <input value={entry.title} onChange={(e) => {
                      const entries = [...content.timeline.entries];
                      entries[idx] = { ...entries[idx], title: e.target.value };
                      setContent({ ...content, timeline: { ...content.timeline, entries } });
                    }} className={inputCls} placeholder="כותרת" dir="rtl" />
                    <button onClick={() => {
                      const entries = content.timeline.entries.filter((_, i) => i !== idx);
                      setContent({ ...content, timeline: { ...content.timeline, entries } });
                    }} className="text-red-400 hover:text-red-300">✕</button>
                  </div>
                  <textarea value={entry.description} onChange={(e) => {
                    const entries = [...content.timeline.entries];
                    entries[idx] = { ...entries[idx], description: e.target.value };
                    setContent({ ...content, timeline: { ...content.timeline, entries } });
                  }} className={inputCls} rows={2} placeholder="תיאור" dir="rtl" />
                </div>
              ))}
              <button onClick={() => {
                const entries = [...content.timeline.entries, { date: "", title: "", description: "" }];
                setContent({ ...content, timeline: { ...content.timeline, entries } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף אירוע</button>
            </div>
          </>
        );

      case "navbar":
        return (
          <>
            <div>
              <label className={labelCls}>קישורי ניווט</label>
              {content.navbar.links.map((link, idx) => (
                <div key={idx} className="mb-2 grid grid-cols-[1fr_1fr_30px] gap-2">
                  <input value={link.label} onChange={(e) => {
                    const links = [...content.navbar.links];
                    links[idx] = { ...links[idx], label: e.target.value };
                    setContent({ ...content, navbar: { ...content.navbar, links } });
                  }} className={inputCls} placeholder="תווית" dir="rtl" />
                  <input value={link.href} onChange={(e) => {
                    const links = [...content.navbar.links];
                    links[idx] = { ...links[idx], href: e.target.value };
                    setContent({ ...content, navbar: { ...content.navbar, links } });
                  }} className={inputCls} placeholder="קישור" dir="ltr" />
                  <button onClick={() => {
                    const links = content.navbar.links.filter((_, i) => i !== idx);
                    setContent({ ...content, navbar: { ...content.navbar, links } });
                  }} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button onClick={() => {
                const links = [...content.navbar.links, { href: "#", label: "" }];
                setContent({ ...content, navbar: { ...content.navbar, links } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף קישור</button>
            </div>
            <Field label="טקסט כפתור תרומה" value={content.navbar.donateText} onChange={(v) => setContent({ ...content, navbar: { ...content.navbar, donateText: v } })} />
            <Field label="טקסט התחברות" value={content.navbar.loginText} onChange={(v) => setContent({ ...content, navbar: { ...content.navbar, loginText: v } })} />
            <Field label="טקסט אזור אישי" value={content.navbar.membersText} onChange={(v) => setContent({ ...content, navbar: { ...content.navbar, membersText: v } })} />
          </>
        );

      case "footer":
        return (
          <>
            <Field label="טקסט זכויות יוצרים" value={content.footer.copyright} onChange={(v) => setContent({ ...content, footer: { ...content.footer, copyright: v } })} />
            <div>
              <label className={labelCls}>קישורים</label>
              {content.footer.links.map((link, idx) => (
                <div key={idx} className="mb-2 grid grid-cols-[1fr_1fr_30px] gap-2">
                  <input value={link.label} onChange={(e) => {
                    const links = [...content.footer.links];
                    links[idx] = { ...links[idx], label: e.target.value };
                    setContent({ ...content, footer: { ...content.footer, links } });
                  }} className={inputCls} placeholder="תווית" dir="rtl" />
                  <input value={link.href} onChange={(e) => {
                    const links = [...content.footer.links];
                    links[idx] = { ...links[idx], href: e.target.value };
                    setContent({ ...content, footer: { ...content.footer, links } });
                  }} className={inputCls} placeholder="קישור" dir="ltr" />
                  <button onClick={() => {
                    const links = content.footer.links.filter((_, i) => i !== idx);
                    setContent({ ...content, footer: { ...content.footer, links } });
                  }} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button onClick={() => {
                const links = [...content.footer.links, { href: "#", label: "" }];
                setContent({ ...content, footer: { ...content.footer, links } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף קישור</button>
            </div>
          </>
        );

      case "impactDashboard":
        return (
          <>
            <Field label="כותרת" value={content.impactDashboard.title} onChange={(v) => setContent({ ...content, impactDashboard: { ...content.impactDashboard, title: v } })} />
            <Field label="כותרת משנה" value={content.impactDashboard.subtitle} onChange={(v) => setContent({ ...content, impactDashboard: { ...content.impactDashboard, subtitle: v } })} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>יעד כולל</label>
                <input type="number" value={content.impactDashboard.totalGoal} onChange={(e) => setContent({ ...content, impactDashboard: { ...content.impactDashboard, totalGoal: Number(e.target.value) } })} className={inputCls} dir="ltr" />
              </div>
              <div>
                <label className={labelCls}>סה&quot;כ שנאסף</label>
                <input type="number" value={content.impactDashboard.totalRaised} onChange={(e) => setContent({ ...content, impactDashboard: { ...content.impactDashboard, totalRaised: Number(e.target.value) } })} className={inputCls} dir="ltr" />
              </div>
            </div>
            <Field label="מטבע" value={content.impactDashboard.currency} onChange={(v) => setContent({ ...content, impactDashboard: { ...content.impactDashboard, currency: v } })} dir="ltr" />

            {/* Categories */}
            <div>
              <label className={labelCls}>קטגוריות</label>
              {content.impactDashboard.categories.map((cat, idx) => (
                <div key={idx} className="mb-2 grid grid-cols-[40px_1fr_80px_70px_30px] gap-2">
                  <input value={cat.icon} onChange={(e) => {
                    const categories = [...content.impactDashboard.categories];
                    categories[idx] = { ...categories[idx], icon: e.target.value };
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, categories } });
                  }} className={inputCls} placeholder="🛡️" />
                  <input value={cat.name} onChange={(e) => {
                    const categories = [...content.impactDashboard.categories];
                    categories[idx] = { ...categories[idx], name: e.target.value };
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, categories } });
                  }} className={inputCls} placeholder="שם" dir="rtl" />
                  <input type="number" value={cat.amount} onChange={(e) => {
                    const categories = [...content.impactDashboard.categories];
                    categories[idx] = { ...categories[idx], amount: Number(e.target.value) };
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, categories } });
                  }} className={inputCls} dir="ltr" />
                  <input type="color" value={cat.color} onChange={(e) => {
                    const categories = [...content.impactDashboard.categories];
                    categories[idx] = { ...categories[idx], color: e.target.value };
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, categories } });
                  }} className="h-[38px] w-full cursor-pointer rounded-lg border border-dark-surface bg-dark-bg" />
                  <button onClick={() => {
                    const categories = content.impactDashboard.categories.filter((_, i) => i !== idx);
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, categories } });
                  }} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button onClick={() => {
                const categories = [...content.impactDashboard.categories, { name: "", amount: 0, color: "#556B2F", icon: "⭐" }];
                setContent({ ...content, impactDashboard: { ...content.impactDashboard, categories } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף קטגוריה</button>
            </div>

            {/* Recent Donations */}
            <div>
              <label className={labelCls}>תרומות אחרונות</label>
              {content.impactDashboard.recentDonations.map((don, idx) => (
                <div key={idx} className="mb-3 rounded-lg bg-dark-bg p-3 space-y-2">
                  <div className="grid grid-cols-[1fr_80px_100px_30px] gap-2">
                    <input value={don.name} onChange={(e) => {
                      const recentDonations = [...content.impactDashboard.recentDonations];
                      recentDonations[idx] = { ...recentDonations[idx], name: e.target.value };
                      setContent({ ...content, impactDashboard: { ...content.impactDashboard, recentDonations } });
                    }} className={inputCls} placeholder="שם" dir="rtl" />
                    <input type="number" value={don.amount} onChange={(e) => {
                      const recentDonations = [...content.impactDashboard.recentDonations];
                      recentDonations[idx] = { ...recentDonations[idx], amount: Number(e.target.value) };
                      setContent({ ...content, impactDashboard: { ...content.impactDashboard, recentDonations } });
                    }} className={inputCls} dir="ltr" />
                    <input type="date" value={don.date} onChange={(e) => {
                      const recentDonations = [...content.impactDashboard.recentDonations];
                      recentDonations[idx] = { ...recentDonations[idx], date: e.target.value };
                      setContent({ ...content, impactDashboard: { ...content.impactDashboard, recentDonations } });
                    }} className={inputCls} />
                    <button onClick={() => {
                      const recentDonations = content.impactDashboard.recentDonations.filter((_, i) => i !== idx);
                      setContent({ ...content, impactDashboard: { ...content.impactDashboard, recentDonations } });
                    }} className="text-red-400 hover:text-red-300">✕</button>
                  </div>
                  <input value={don.message || ""} onChange={(e) => {
                    const recentDonations = [...content.impactDashboard.recentDonations];
                    recentDonations[idx] = { ...recentDonations[idx], message: e.target.value || undefined };
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, recentDonations } });
                  }} className={inputCls} placeholder="הודעה (אופציונלי)" dir="rtl" />
                </div>
              ))}
              <button onClick={() => {
                const recentDonations = [...content.impactDashboard.recentDonations, { name: "אנונימי", amount: 0, date: new Date().toISOString().split("T")[0] }];
                setContent({ ...content, impactDashboard: { ...content.impactDashboard, recentDonations } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף תרומה</button>
            </div>

            {/* Stats */}
            <div>
              <label className={labelCls}>נתונים סטטיסטיים</label>
              {content.impactDashboard.stats.map((stat, idx) => (
                <div key={idx} className="mb-2 grid grid-cols-[40px_1fr_80px_30px] gap-2">
                  <input value={stat.icon} onChange={(e) => {
                    const stats = [...content.impactDashboard.stats];
                    stats[idx] = { ...stats[idx], icon: e.target.value };
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, stats } });
                  }} className={inputCls} />
                  <input value={stat.label} onChange={(e) => {
                    const stats = [...content.impactDashboard.stats];
                    stats[idx] = { ...stats[idx], label: e.target.value };
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, stats } });
                  }} className={inputCls} dir="rtl" placeholder="תווית" />
                  <input value={stat.value} onChange={(e) => {
                    const stats = [...content.impactDashboard.stats];
                    stats[idx] = { ...stats[idx], value: e.target.value };
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, stats } });
                  }} className={inputCls} dir="ltr" placeholder="ערך" />
                  <button onClick={() => {
                    const stats = content.impactDashboard.stats.filter((_, i) => i !== idx);
                    setContent({ ...content, impactDashboard: { ...content.impactDashboard, stats } });
                  }} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <button onClick={() => {
                const stats = [...content.impactDashboard.stats, { label: "", value: "", icon: "⭐" }];
                setContent({ ...content, impactDashboard: { ...content.impactDashboard, stats } });
              }} className="text-sm text-olive-light hover:underline">+ הוסף נתון</button>
            </div>
          </>
        );

      default:
        return <p className="text-gray-500">אין אפשרויות עריכה לסקשן זה</p>;
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-sand">{meta.icon} {meta.label}</h2>
      <div className="space-y-4">{renderFields()}</div>
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-lg bg-olive px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-olive-light disabled:opacity-50"
      >
        {saving ? "שומר..." : `שמור ${meta.label}`}
      </button>
    </div>
  );
}

// ─── Shared field components ────────────────────────────────────────────

function Field({ label, value, onChange, dir = "rtl" }: { label: string; value: string; onChange: (v: string) => void; dir?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
        dir={dir}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-400">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-dark-surface bg-dark-bg px-4 py-2 text-gray-200 focus:border-olive focus:outline-none"
        dir="rtl"
      />
    </div>
  );
}
