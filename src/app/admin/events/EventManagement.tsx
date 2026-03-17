"use client";

import { useState, useEffect } from "react";

interface EventData {
  id: string;
  title: string;
  type: "training" | "operational" | "social" | "uniform";
  startDate: string;
  endDate?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  description?: string;
  albumUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  training: { label: "אימון", color: "bg-blue-900/30 text-blue-400", icon: "🎯" },
  operational: { label: "פעילות מבצעית", color: "bg-red-900/30 text-red-400", icon: "⚔️" },
  social: { label: "פעילות חברתית", color: "bg-green-900/30 text-green-400", icon: "🤝" },
  uniform: { label: "מדים", color: "bg-purple-900/30 text-purple-400", icon: "👔" },
};

export default function EventManagement() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventData["type"]>("training");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [albumUrl, setAlbumUrl] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const res = await fetch("/api/admin/events");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setType("training");
    setStartDate("");
    setEndDate("");
    setLocation("");
    setLat("");
    setLng("");
    setDescription("");
    setAlbumUrl("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(event: EventData) {
    setTitle(event.title);
    setType(event.type);
    setStartDate(event.startDate);
    setEndDate(event.endDate || "");
    setLocation(event.location);
    setLat(event.coordinates?.lat.toString() || "");
    setLng(event.coordinates?.lng.toString() || "");
    setDescription(event.description || "");
    setAlbumUrl(event.albumUrl || "");
    setEditingId(event.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: Record<string, unknown> = {
      title,
      type,
      startDate,
      endDate: endDate || undefined,
      location,
      coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
      description: description || undefined,
      albumUrl: albumUrl || undefined,
    };

    if (editingId) {
      payload.id = editingId;
      await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    fetchEvents();
  }

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק אירוע זה?")) return;
    await fetch("/api/admin/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchEvents();
  }

  const filtered = events.filter(
    (e) =>
      e.title.includes(search) ||
      e.location.includes(search) ||
      TYPE_LABELS[e.type]?.label.includes(search)
  );

  if (loading) {
    return <div className="text-center text-gray-400 py-12">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sand">📅 ניהול אירועים</h1>
          <p className="mt-1 text-gray-400">
            {events.length} אירועים במערכת
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-xl bg-olive px-6 py-3 font-bold text-white transition-colors hover:bg-olive-dark focus:outline-none focus:ring-3 focus:ring-sand"
        >
          + אירוע חדש
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="חיפוש לפי שם, מיקום או סוג..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-dark-surface bg-dark-card px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
        aria-label="חיפוש אירועים"
      />

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-dark-surface bg-dark-card p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-sand">
            {editingId ? "עריכת אירוע" : "אירוע חדש"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="event-title" className="mb-1 block text-sm text-gray-400">
                שם האירוע *
              </label>
              <input
                id="event-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="event-type" className="mb-1 block text-sm text-gray-400">
                סוג אירוע *
              </label>
              <select
                id="event-type"
                required
                value={type}
                onChange={(e) => setType(e.target.value as EventData["type"])}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              >
                {Object.entries(TYPE_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.icon} {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="event-start" className="mb-1 block text-sm text-gray-400">
                תאריך התחלה *
              </label>
              <input
                id="event-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="event-end" className="mb-1 block text-sm text-gray-400">
                תאריך סיום
              </label>
              <input
                id="event-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="event-location" className="mb-1 block text-sm text-gray-400">
                מיקום *
              </label>
              <input
                id="event-location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="לדוגמה: בסיס שיזפון"
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="event-lat" className="mb-1 block text-sm text-gray-400">
                  קו רוחב (Lat)
                </label>
                <input
                  id="event-lat"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="31.25"
                  className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="event-lng" className="mb-1 block text-sm text-gray-400">
                  קו אורך (Lng)
                </label>
                <input
                  id="event-lng"
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="34.79"
                  className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="event-album" className="mb-1 block text-sm text-gray-400">
                קישור לאלבום תמונות
              </label>
              <input
                id="event-album"
                type="url"
                value={albumUrl}
                onChange={(e) => setAlbumUrl(e.target.value)}
                placeholder="https://photos.google.com/..."
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="event-desc" className="mb-1 block text-sm text-gray-400">
                תיאור
              </label>
              <textarea
                id="event-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-olive px-6 py-2 font-bold text-white transition-colors hover:bg-olive-dark focus:outline-none focus:ring-3 focus:ring-sand"
            >
              {editingId ? "שמור שינויים" : "צור אירוע"}
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

      {/* Events table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-dark-card p-8 text-center text-gray-500">
          {events.length === 0 ? "עדיין אין אירועים. צור את הראשון!" : "לא נמצאו תוצאות"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-dark-card">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-dark-surface text-gray-500">
                <th className="px-4 py-3 font-medium">שם</th>
                <th className="px-4 py-3 font-medium">סוג</th>
                <th className="px-4 py-3 font-medium">תאריך</th>
                <th className="px-4 py-3 font-medium">מיקום</th>
                <th className="px-4 py-3 font-medium">קואורדינטות</th>
                <th className="px-4 py-3 font-medium">אלבום</th>
                <th className="px-4 py-3 font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .map((event) => {
                  const typeInfo = TYPE_LABELS[event.type] || TYPE_LABELS.training;
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-dark-surface/50 transition-colors hover:bg-dark-surface/30"
                    >
                      <td className="px-4 py-3 font-medium text-gray-200">
                        {event.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(event.startDate).toLocaleDateString("he-IL")}
                        {event.endDate && (
                          <> — {new Date(event.endDate).toLocaleDateString("he-IL")}</>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{event.location}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {event.coordinates
                          ? `${event.coordinates.lat.toFixed(3)}, ${event.coordinates.lng.toFixed(3)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {event.albumUrl ? (
                          <a
                            href={event.albumUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-olive-light hover:underline"
                          >
                            📸 צפה
                          </a>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(event)}
                            className="rounded-lg bg-sand/10 px-3 py-1 text-xs text-sand transition-colors hover:bg-sand/20"
                          >
                            ערוך
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="rounded-lg bg-red-900/20 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-900/30"
                          >
                            מחק
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
