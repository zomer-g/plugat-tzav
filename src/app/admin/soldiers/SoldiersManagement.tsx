"use client";

import { useState, useEffect } from "react";

interface SoldierData {
  id: string;
  name: string;
  personalId: string;
  role: string;
  phone?: string;
  email?: string;
  region?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  serviceEndDate?: string;
  unitJoinDate?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

export default function SoldiersManagement() {
  const [soldiers, setSoldiers] = useState<SoldierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [seeding, setSeeding] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [personalId, setPersonalId] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [serviceEndDate, setServiceEndDate] = useState("");
  const [unitJoinDate, setUnitJoinDate] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    fetchSoldiers();
  }, []);

  async function fetchSoldiers() {
    const res = await fetch("/api/admin/soldiers");
    if (res.ok) setSoldiers(await res.json());
    setLoading(false);
  }

  function resetForm() {
    setName("");
    setPersonalId("");
    setRole("");
    setPhone("");
    setEmail("");
    setRegion("");
    setCity("");
    setAddress("");
    setBirthDate("");
    setServiceEndDate("");
    setUnitJoinDate("");
    setLat("");
    setLng("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(soldier: SoldierData) {
    setName(soldier.name);
    setPersonalId(soldier.personalId);
    setRole(soldier.role);
    setPhone(soldier.phone || "");
    setEmail(soldier.email || "");
    setRegion(soldier.region || "");
    setCity(soldier.city || "");
    setAddress(soldier.address || "");
    setBirthDate(soldier.birthDate || "");
    setServiceEndDate(soldier.serviceEndDate || "");
    setUnitJoinDate(soldier.unitJoinDate || "");
    setLat(soldier.coordinates?.lat.toString() || "");
    setLng(soldier.coordinates?.lng.toString() || "");
    setEditingId(soldier.id);
    setShowForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById("soldier-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: Record<string, unknown> = {
      name,
      personalId,
      role,
      phone: phone || undefined,
      email: email || undefined,
      region: region || undefined,
      city: city || undefined,
      address: address || undefined,
      birthDate: birthDate || undefined,
      serviceEndDate: serviceEndDate || undefined,
      unitJoinDate: unitJoinDate || undefined,
      coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
    };

    if (editingId) {
      payload.id = editingId;
      await fetch("/api/admin/soldiers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/soldiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    fetchSoldiers();
  }

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק חייל זה?")) return;
    await fetch("/api/admin/soldiers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchSoldiers();
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed-soldiers", { method: "POST" });
      const data = await res.json();
      alert(data.message || "Done!");
      fetchSoldiers();
    } catch {
      alert("שגיאה בטעינת נתונים");
    }
    setSeeding(false);
  }

  const filtered = soldiers.filter(
    (s) =>
      s.name.includes(search) ||
      s.personalId.includes(search) ||
      s.role.includes(search) ||
      (s.city && s.city.includes(search)) ||
      (s.phone && s.phone.includes(search)) ||
      (s.email && s.email.includes(search))
  );

  if (loading) {
    return <div className="text-center text-gray-400 py-12">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sand">🪖 ניהול חיילים</h1>
          <p className="mt-1 text-gray-400">
            {soldiers.length} חיילים במערכת
          </p>
        </div>
        <div className="flex gap-3">
          {soldiers.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="rounded-xl border border-sand/30 px-6 py-3 font-bold text-sand transition-colors hover:bg-sand/10 focus:outline-none focus:ring-3 focus:ring-sand disabled:opacity-50"
            >
              {seeding ? "טוען..." : "📥 טען נתוני חיילים"}
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-xl bg-olive px-6 py-3 font-bold text-white transition-colors hover:bg-olive-dark focus:outline-none focus:ring-3 focus:ring-sand"
          >
            + חייל חדש
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="חיפוש לפי שם, מספר אישי, תפקיד, עיר..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-dark-surface bg-dark-card px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
        aria-label="חיפוש חיילים"
      />

      {/* Form */}
      {showForm && (
        <form
          id="soldier-form"
          onSubmit={handleSubmit}
          className="rounded-xl border border-dark-surface bg-dark-card p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-sand">
            {editingId ? "עריכת חייל" : "חייל חדש"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="soldier-name" className="mb-1 block text-sm text-gray-400">
                שם מלא *
              </label>
              <input
                id="soldier-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="soldier-personalId" className="mb-1 block text-sm text-gray-400">
                מספר אישי *
              </label>
              <input
                id="soldier-personalId"
                type="text"
                required
                value={personalId}
                onChange={(e) => setPersonalId(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="soldier-role" className="mb-1 block text-sm text-gray-400">
                תפקיד *
              </label>
              <input
                id="soldier-role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder='לדוגמה: מ"כ, סמל, טוראי'
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="soldier-phone" className="mb-1 block text-sm text-gray-400">
                טלפון
              </label>
              <input
                id="soldier-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="soldier-email" className="mb-1 block text-sm text-gray-400">
                אימייל
              </label>
              <input
                id="soldier-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="soldier-region" className="mb-1 block text-sm text-gray-400">
                אזור
              </label>
              <input
                id="soldier-region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="מרכז / צפון / דרום"
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="soldier-city" className="mb-1 block text-sm text-gray-400">
                עיר
              </label>
              <input
                id="soldier-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="לדוגמה: תל אביב"
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="soldier-address" className="mb-1 block text-sm text-gray-400">
                כתובת
              </label>
              <input
                id="soldier-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="soldier-birthDate" className="mb-1 block text-sm text-gray-400">
                תאריך לידה
              </label>
              <input
                id="soldier-birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="soldier-serviceEndDate" className="mb-1 block text-sm text-gray-400">
                תום שירות
              </label>
              <input
                id="soldier-serviceEndDate"
                type="date"
                value={serviceEndDate}
                onChange={(e) => setServiceEndDate(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="soldier-unitJoinDate" className="mb-1 block text-sm text-gray-400">
                תאריך הצטרפות
              </label>
              <input
                id="soldier-unitJoinDate"
                type="date"
                value={unitJoinDate}
                onChange={(e) => setUnitJoinDate(e.target.value)}
                className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 focus:border-sand focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="soldier-lat" className="mb-1 block text-sm text-gray-400">
                  קו רוחב (Lat)
                </label>
                <input
                  id="soldier-lat"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="32.08"
                  className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="soldier-lng" className="mb-1 block text-sm text-gray-400">
                  קו אורך (Lng)
                </label>
                <input
                  id="soldier-lng"
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="34.78"
                  className="w-full rounded-lg border border-dark-surface bg-dark-bg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            * קואורדינטות מזוהות אוטומטית לפי עיר. ניתן לדרוס ידנית.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-olive px-6 py-2 font-bold text-white transition-colors hover:bg-olive-dark focus:outline-none focus:ring-3 focus:ring-sand"
            >
              {editingId ? "שמור שינויים" : "צור חייל"}
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

      {/* Soldiers table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-dark-card p-8 text-center text-gray-500">
          {soldiers.length === 0 ? "עדיין אין חיילים. הוסף את הראשון או טען נתונים!" : "לא נמצאו תוצאות"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-dark-card">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-dark-surface text-gray-500">
                <th className="px-4 py-3 font-medium">שם</th>
                <th className="px-4 py-3 font-medium">מ.א.</th>
                <th className="px-4 py-3 font-medium">תפקיד</th>
                <th className="px-4 py-3 font-medium">טלפון</th>
                <th className="px-4 py-3 font-medium">עיר</th>
                <th className="px-4 py-3 font-medium">תאריך לידה</th>
                <th className="px-4 py-3 font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => a.name.localeCompare(b.name, "he"))
                .map((soldier) => (
                  <tr
                    key={soldier.id}
                    className="border-b border-dark-surface/50 transition-colors hover:bg-dark-surface/30"
                  >
                    <td className="px-4 py-3 font-medium text-gray-200">
                      {soldier.name}
                    </td>
                    <td className="px-4 py-3 text-gray-400" dir="ltr">
                      {soldier.personalId}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-olive/20 px-2 py-0.5 text-xs font-bold text-olive-light">
                        {soldier.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400" dir="ltr">
                      {soldier.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {soldier.city || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {soldier.birthDate
                        ? new Date(soldier.birthDate).toLocaleDateString("he-IL")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(soldier)}
                          className="rounded-lg bg-sand/10 px-3 py-1 text-xs text-sand transition-colors hover:bg-sand/20"
                        >
                          ערוך
                        </button>
                        <button
                          onClick={() => handleDelete(soldier.id)}
                          className="rounded-lg bg-red-900/20 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-900/30"
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
