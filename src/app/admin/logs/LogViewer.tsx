"use client";

import { useState, useEffect, useMemo } from "react";

interface LogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  page: string;
  timestamp: string;
}

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterPage, setFilterPage] = useState("");
  const [showCount, setShowCount] = useState(100);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const res = await fetch("/api/admin/logs");
    if (res.ok) setLogs(await res.json());
    setLoading(false);
  }

  async function handleClear() {
    if (!confirm("האם למחוק את כל יומן הפעילות? פעולה זו בלתי הפיכה.")) return;
    await fetch("/api/admin/logs", { method: "DELETE" });
    setLogs([]);
  }

  // Unique users and pages for filters
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach((l) => map.set(l.userEmail, l.userName));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [logs]);

  const uniquePages = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.page));
    return Array.from(set).sort();
  }, [logs]);

  // Stats
  const stats = useMemo(() => {
    const userVisits = new Map<string, number>();
    const pageVisits = new Map<string, number>();
    logs.forEach((l) => {
      userVisits.set(l.userEmail, (userVisits.get(l.userEmail) || 0) + 1);
      pageVisits.set(l.page, (pageVisits.get(l.page) || 0) + 1);
    });

    const topUsers = Array.from(userVisits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topPages = Array.from(pageVisits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalLogs: logs.length, uniqueUsers: userVisits.size, uniquePages: pageVisits.size, topUsers, topPages };
  }, [logs]);

  const filtered = logs.filter((l) => {
    if (filterUser && l.userEmail !== filterUser) return false;
    if (filterPage && l.page !== filterPage) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.userName.toLowerCase().includes(q) ||
        l.userEmail.toLowerCase().includes(q) ||
        l.page.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const displayed = filtered.slice(0, showCount);

  if (loading) {
    return <div className="text-center text-gray-400 py-12">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sand">📊 יומן פעילות</h1>
          <p className="mt-1 text-gray-400">
            מעקב אחר כל הדפים שכל משתמש ביקר בהם
          </p>
        </div>
        <button
          onClick={handleClear}
          className="rounded-xl border border-red-900/50 bg-red-900/20 px-4 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-900/30"
        >
          🗑️ נקה יומן
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-dark-card p-4">
          <p className="text-3xl font-bold text-white">{stats.totalLogs}</p>
          <p className="text-sm text-gray-400">כניסות סה&quot;כ</p>
        </div>
        <div className="rounded-xl bg-dark-card p-4">
          <p className="text-3xl font-bold text-white">{stats.uniqueUsers}</p>
          <p className="text-sm text-gray-400">משתמשים ייחודיים</p>
        </div>
        <div className="rounded-xl bg-dark-card p-4">
          <p className="text-3xl font-bold text-white">{stats.uniquePages}</p>
          <p className="text-sm text-gray-400">דפים ייחודיים</p>
        </div>
      </div>

      {/* Top users & pages */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-dark-card p-4">
          <h3 className="mb-3 font-bold text-sand">👤 משתמשים פעילים ביותר</h3>
          {stats.topUsers.map(([email, count]) => {
            const userName = logs.find((l) => l.userEmail === email)?.userName || email;
            return (
              <div key={email} className="flex items-center justify-between border-b border-dark-surface/50 py-2 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-200">{userName}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                </div>
                <span className="rounded-full bg-olive/20 px-2 py-0.5 text-xs font-bold text-olive-light">
                  {count} ביקורים
                </span>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl bg-dark-card p-4">
          <h3 className="mb-3 font-bold text-sand">📄 דפים נצפים ביותר</h3>
          {stats.topPages.map(([page, count]) => (
            <div key={page} className="flex items-center justify-between border-b border-dark-surface/50 py-2 last:border-0">
              <p className="text-sm text-gray-200 font-mono" dir="ltr">{page}</p>
              <span className="rounded-full bg-sand/20 px-2 py-0.5 text-xs font-bold text-sand">
                {count} צפיות
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="חיפוש חופשי..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-dark-surface bg-dark-card px-4 py-2 text-gray-200 placeholder:text-gray-600 focus:border-sand focus:outline-none"
          aria-label="חיפוש ביומן"
        />
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="rounded-xl border border-dark-surface bg-dark-card px-4 py-2 text-gray-200 focus:border-sand focus:outline-none"
          aria-label="סנן לפי משתמש"
        >
          <option value="">כל המשתמשים</option>
          {uniqueUsers.map(([email, name]) => (
            <option key={email} value={email}>
              {name} ({email})
            </option>
          ))}
        </select>
        <select
          value={filterPage}
          onChange={(e) => setFilterPage(e.target.value)}
          className="rounded-xl border border-dark-surface bg-dark-card px-4 py-2 text-gray-200 focus:border-sand focus:outline-none"
          aria-label="סנן לפי דף"
        >
          <option value="">כל הדפים</option>
          {uniquePages.map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        מציג {displayed.length} מתוך {filtered.length} רשומות
      </p>

      {/* Log table */}
      {displayed.length === 0 ? (
        <div className="rounded-xl bg-dark-card p-8 text-center text-gray-500">
          {logs.length === 0 ? "עדיין אין רשומות ביומן" : "לא נמצאו תוצאות"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-dark-card">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-dark-surface text-gray-500">
                <th className="px-4 py-3 font-medium">זמן</th>
                <th className="px-4 py-3 font-medium">משתמש</th>
                <th className="px-4 py-3 font-medium">אימייל</th>
                <th className="px-4 py-3 font-medium">דף</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-dark-surface/50 transition-colors hover:bg-dark-surface/30"
                >
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("he-IL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-200">
                    {log.userName}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{log.userEmail}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs" dir="ltr">
                    {log.page}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load more */}
      {displayed.length < filtered.length && (
        <div className="text-center">
          <button
            onClick={() => setShowCount((c) => c + 100)}
            className="rounded-xl bg-dark-card px-6 py-2 text-sm text-gray-400 transition-colors hover:bg-dark-surface hover:text-sand"
          >
            הצג עוד {Math.min(100, filtered.length - displayed.length)} רשומות
          </button>
        </div>
      )}
    </div>
  );
}
