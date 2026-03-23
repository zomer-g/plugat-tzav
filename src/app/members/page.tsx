import { auth } from "@/lib/auth";
import { getUserByEmail, getGroups, canUserAccessPage } from "@/lib/db";
import Link from "next/link";

export default async function MembersHome() {
  const session = await auth();
  const user = getUserByEmail(session!.user!.email!);
  const groups = getGroups();
  const userGroups = groups.filter((g) => user?.groups.includes(g.id));

  const allTiles = [
    { href: "/members/events", pageId: "members/events", icon: "📅", title: "אירועי הפלוגה", description: "מפה וציר זמן", color: "from-blue-900/40 to-blue-800/20" },
    { href: "/members/battles", pageId: "members/battles", icon: "⚔️", title: "קרבות בלימה", description: "סיפור הקרבות", color: "from-red-900/40 to-red-800/20" },
    { href: "/members/gallery", pageId: "members/gallery", icon: "🖼️", title: "גלריה", description: "תמונות וסרטונים", color: "from-purple-900/40 to-purple-800/20" },
    { href: "/members/documents", pageId: "members/documents", icon: "📄", title: "מסמכים", description: "תכנים לחברי הפלוגה", color: "from-cyan-900/40 to-cyan-800/20" },
    { href: "/members/brigade", pageId: "members/brigade", icon: "🛡️", title: "חטיבה 188", description: "עמותת ברק", color: "from-amber-900/40 to-amber-800/20" },
    { href: "/members/tools", pageId: "members/tools", icon: "🔧", title: "כלים שימושיים", description: "קישורים למילואימניקים", color: "from-green-900/40 to-green-800/20" },
  ];

  const navTiles = allTiles.filter((tile) =>
    canUserAccessPage(user?.email || null, tile.pageId)
  );

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-l from-olive/20 to-dark-card p-6">
        <h1 className="mb-1 text-2xl font-bold text-sand">
          שלום, {user?.name || "חבר/ת פלוגה"}! 👋
        </h1>
        <p className="text-sm text-gray-400">
          ברוכים הבאים לאזור האישי של פלוגת צב
        </p>
      </div>

      {/* Square widget tiles — Instagram/mobile style */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {navTiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${tile.color} border border-white/5 p-4 text-center transition-all hover:scale-[1.03] hover:border-white/15 hover:shadow-xl`}
          >
            <span className="mb-2 text-4xl drop-shadow-lg transition-transform group-hover:scale-110">
              {tile.icon}
            </span>
            <h2 className="text-base font-bold text-white">{tile.title}</h2>
            <p className="mt-1 text-xs text-gray-400">{tile.description}</p>
          </Link>
        ))}

        {/* Admin tile */}
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="group relative flex aspect-square flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-olive/30 to-olive/10 border border-olive/20 p-4 text-center transition-all hover:scale-[1.03] hover:border-olive/40 hover:shadow-xl"
          >
            <span className="mb-2 text-4xl drop-shadow-lg transition-transform group-hover:scale-110">⚙️</span>
            <h2 className="text-base font-bold text-olive-light">ניהול האתר</h2>
            <p className="mt-1 text-xs text-gray-400">לוח בקרה</p>
          </Link>
        )}
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* My details */}
        <div className="rounded-2xl bg-dark-surface p-5">
          <h2 className="mb-3 text-lg font-bold text-sand">הפרטים שלי</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p><span className="text-gray-500">שם:</span> {user?.name}</p>
            <p><span className="text-gray-500">אימייל:</span> {user?.email}</p>
            <p>
              <span className="text-gray-500">תפקיד:</span>{" "}
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${user?.role === "admin" ? "bg-olive/20 text-olive-light" : "bg-slate-mil/20 text-slate-mil-light"}`}>
                {user?.role === "admin" ? "מנהל" : "חבר/ת פלוגה"}
              </span>
            </p>
          </div>
        </div>

        {/* My groups */}
        <div className="rounded-2xl bg-dark-surface p-5">
          <h2 className="mb-3 text-lg font-bold text-sand">הקבוצות שלי</h2>
          {userGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userGroups.map((g) => (
                <span key={g.id} className="rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: g.color + "30", color: g.color }}>
                  {g.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">עדיין לא שויכת לקבוצות</p>
          )}
        </div>
      </div>
    </div>
  );
}
