"use client";

import { useState, useEffect } from "react";

interface CampaignData {
  id: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
  goal: number;
  raised: number;
  currency: string;
  startDate: string;
  endDate?: string;
  paymentLinks: { label: string; url: string; icon: string }[];
  active: boolean;
  shareText?: string;
  createdAt: string;
  updatedAt: string;
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || `campaign-${Date.now()}`;
}

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [goal, setGoal] = useState("");
  const [raised, setRaised] = useState("");
  const [currency, setCurrency] = useState("₪");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);
  const [shareText, setShareText] = useState("");
  const [paymentLinks, setPaymentLinks] = useState<{ label: string; url: string; icon: string }[]>([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    const res = await fetch("/api/admin/campaigns");
    if (res.ok) setCampaigns(await res.json());
    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setSlug("");
    setDescription("");
    setImage("");
    setGoal("");
    setRaised("");
    setCurrency("₪");
    setStartDate("");
    setEndDate("");
    setActive(true);
    setShareText("");
    setPaymentLinks([]);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(campaign: CampaignData) {
    setTitle(campaign.title);
    setSlug(campaign.slug);
    setDescription(campaign.description);
    setImage(campaign.image || "");
    setGoal(campaign.goal.toString());
    setRaised(campaign.raised.toString());
    setCurrency(campaign.currency);
    setStartDate(campaign.startDate);
    setEndDate(campaign.endDate || "");
    setActive(campaign.active);
    setShareText(campaign.shareText || "");
    setPaymentLinks(campaign.paymentLinks || []);
    setEditingId(campaign.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: Record<string, unknown> = {
      title,
      slug: slug || slugify(title),
      description,
      image: image || undefined,
      goal: Number(goal) || 0,
      raised: Number(raised) || 0,
      currency,
      startDate,
      endDate: endDate || undefined,
      active,
      shareText: shareText || undefined,
      paymentLinks,
    };

    if (editingId) {
      payload.id = editingId;
      await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    fetchCampaigns();
  }

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק קמפיין זה?")) return;
    await fetch("/api/admin/campaigns", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCampaigns();
  }

  async function toggleActive(campaign: CampaignData) {
    await fetch("/api/admin/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: campaign.id, active: !campaign.active }),
    });
    fetchCampaigns();
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/campaigns/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = campaigns.filter(
    (c) => c.title.includes(search) || c.slug.includes(search)
  );

  const inputCls = "w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none";

  if (loading) {
    return <div className="text-center text-gray-400 py-12">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sand">🎯 ניהול קמפיינים</h1>
          <p className="mt-1 text-gray-400">
            {campaigns.length} קמפיינים במערכת
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="rounded-xl bg-olive px-6 py-3 font-bold text-white transition-colors hover:bg-olive-dark focus:outline-none focus:ring-3 focus:ring-sand"
        >
          + קמפיין חדש
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="חיפוש לפי שם או slug..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-dark-surface bg-dark-card px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
        aria-label="חיפוש קמפיינים"
      />

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-dark-surface bg-dark-card p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-sand">
            {editingId ? "עריכת קמפיין" : "קמפיין חדש"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">שם הקמפיין *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
                className={inputCls}
                dir="rtl"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputCls}
                dir="ltr"
                placeholder="auto-generated"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-gray-400">תיאור *</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={inputCls}
                dir="rtl"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">תמונה (URL)</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className={inputCls}
                dir="ltr"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">מטבע</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputCls}
                dir="ltr"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">יעד *</label>
              <input
                type="number"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={inputCls}
                dir="ltr"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">נאסף</label>
              <input
                type="number"
                value={raised}
                onChange={(e) => setRaised(e.target.value)}
                className={inputCls}
                dir="ltr"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">תאריך התחלה *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">תאריך סיום</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-gray-400">טקסט שיתוף (WhatsApp)</label>
              <input
                type="text"
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                className={inputCls}
                dir="rtl"
                placeholder="עזרו לנו להגיע ליעד!"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="text-sm text-gray-400">סטטוס:</label>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`rounded-full px-4 py-1 text-sm font-bold ${
                  active ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                }`}
              >
                {active ? "פעיל" : "לא פעיל"}
              </button>
            </div>
          </div>

          {/* Payment Links */}
          <div>
            <label className="mb-2 block text-sm text-gray-400">אמצעי תשלום</label>
            {paymentLinks.map((link, idx) => (
              <div key={idx} className="mb-2 grid grid-cols-[40px_1fr_1fr_30px] gap-2">
                <input
                  value={link.icon}
                  onChange={(e) => {
                    const updated = [...paymentLinks];
                    updated[idx] = { ...updated[idx], icon: e.target.value };
                    setPaymentLinks(updated);
                  }}
                  className={inputCls}
                  placeholder="💳"
                />
                <input
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...paymentLinks];
                    updated[idx] = { ...updated[idx], label: e.target.value };
                    setPaymentLinks(updated);
                  }}
                  className={inputCls}
                  placeholder="שם (PayBox, ביט...)"
                  dir="rtl"
                />
                <input
                  value={link.url}
                  onChange={(e) => {
                    const updated = [...paymentLinks];
                    updated[idx] = { ...updated[idx], url: e.target.value };
                    setPaymentLinks(updated);
                  }}
                  className={inputCls}
                  placeholder="https://..."
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setPaymentLinks(paymentLinks.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPaymentLinks([...paymentLinks, { label: "", url: "", icon: "💳" }])}
              className="text-sm text-olive-light hover:underline"
            >
              + הוסף אמצעי תשלום
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-olive px-6 py-2 font-bold text-white transition-colors hover:bg-olive-dark"
            >
              {editingId ? "עדכן" : "צור קמפיין"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-dark-surface px-6 py-2 text-gray-400 transition-colors hover:bg-dark-surface"
            >
              ביטול
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-dark-card p-12 text-center text-gray-500">
          {search ? "לא נמצאו קמפיינים תואמים" : "עדיין אין קמפיינים"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-dark-surface">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-dark-surface bg-dark-card text-gray-500">
                <th className="px-4 py-3 font-medium">שם</th>
                <th className="px-4 py-3 font-medium">יעד</th>
                <th className="px-4 py-3 font-medium">נאסף</th>
                <th className="px-4 py-3 font-medium">התקדמות</th>
                <th className="px-4 py-3 font-medium">סטטוס</th>
                <th className="px-4 py-3 font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((campaign) => {
                const pct = campaign.goal > 0
                  ? Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100)
                  : 0;
                return (
                  <tr key={campaign.id} className="border-b border-dark-surface/50 hover:bg-dark-surface/30">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-200">{campaign.title}</p>
                      <p className="text-xs text-gray-500">/{campaign.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {campaign.currency}{campaign.goal.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {campaign.currency}{campaign.raised.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-dark-surface">
                          <div
                            className="h-full rounded-full bg-olive"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(campaign)}
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          campaign.active
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {campaign.active ? "פעיל" : "לא פעיל"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(campaign)}
                          className="text-sand hover:text-sand-light"
                          title="עריכה"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => copyLink(campaign.slug)}
                          className="text-gray-400 hover:text-white"
                          title="העתק קישור"
                        >
                          {copied === campaign.slug ? "✅" : "🔗"}
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-400 hover:text-red-300"
                          title="מחיקה"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
