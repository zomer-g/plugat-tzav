import Link from "next/link";
import { getUsers, getGroups, getPageAccess } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const users = getUsers();
  const groups = getGroups();
  const pages = getPageAccess();

  const stats = [
    {
      label: "משתמשים",
      value: users.length,
      icon: "👥",
      href: "/admin/users",
      color: "olive",
    },
    {
      label: "קבוצות",
      value: groups.length,
      icon: "🏷️",
      href: "/admin/groups",
      color: "sand",
    },
    {
      label: "דפים מנוהלים",
      value: pages.length,
      icon: "📄",
      href: "/admin/pages",
      color: "slate-mil",
    },
    {
      label: "מנהלים",
      value: users.filter((u) => u.role === "admin").length,
      icon: "🛡️",
      href: "/admin/users",
      color: "olive",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-sand">לוח בקרה</h1>
        <p className="mt-1 text-gray-400">ניהול משתמשים, קבוצות והרשאות</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl bg-dark-card p-6 transition-all hover:bg-dark-surface hover:shadow-lg"
          >
            <div className="mb-2 text-3xl">{stat.icon}</div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 group-hover:text-sand">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/admin/users"
          className="rounded-xl border border-dark-surface bg-dark-card p-6 transition-all hover:border-olive hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-bold text-sand">👥 ניהול משתמשים</h2>
          <p className="text-sm text-gray-400">
            הוספה, עריכה, הסרה של משתמשים. שיוך לקבוצות והגדרת תפקידים.
          </p>
        </Link>
        <Link
          href="/admin/groups"
          className="rounded-xl border border-dark-surface bg-dark-card p-6 transition-all hover:border-sand hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-bold text-sand">🏷️ ניהול קבוצות</h2>
          <p className="text-sm text-gray-400">
            יצירה ועריכה של קבוצות משתמשים לניהול הרשאות.
          </p>
        </Link>
        <Link
          href="/admin/pages"
          className="rounded-xl border border-dark-surface bg-dark-card p-6 transition-all hover:border-slate-mil hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-bold text-sand">📄 הרשאות דפים</h2>
          <p className="text-sm text-gray-400">
            הגדרת רמת גישה לכל דף — פתוח, חברים בלבד, או קבוצות ספציפיות.
          </p>
        </Link>
      </div>

      {/* Recent users */}
      <div className="rounded-xl bg-dark-card p-6">
        <h2 className="mb-4 text-xl font-bold text-sand">משתמשים אחרונים</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">עדיין אין משתמשים רשומים</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-dark-surface text-gray-500">
                  <th className="px-3 py-2 font-medium">שם</th>
                  <th className="px-3 py-2 font-medium">אימייל</th>
                  <th className="px-3 py-2 font-medium">תפקיד</th>
                  <th className="px-3 py-2 font-medium">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-dark-surface/50"
                  >
                    <td className="px-3 py-3 text-gray-200">{user.name}</td>
                    <td className="px-3 py-3 text-gray-400">{user.email}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          user.role === "admin"
                            ? "bg-olive/20 text-olive-light"
                            : "bg-slate-mil/20 text-slate-mil-light"
                        }`}
                      >
                        {user.role === "admin" ? "מנהל" : "חבר"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          user.active
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {user.active ? "פעיל" : "מושבת"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
