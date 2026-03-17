import { auth } from "@/lib/auth";
import { getUserByEmail, getGroups } from "@/lib/db";
import Link from "next/link";

export default async function MembersHome() {
  const session = await auth();
  const user = getUserByEmail(session!.user!.email!);
  const groups = getGroups();
  const userGroups = groups.filter((g) => user?.groups.includes(g.id));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-dark-card p-8">
        <h1 className="mb-2 text-3xl font-bold text-sand">
          שלום, {user?.name || "חבר/ת פלוגה"}! 👋
        </h1>
        <p className="text-gray-400">
          ברוכים הבאים לאזור האישי של פלוגת צב
        </p>
      </div>

      {/* User info card */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-dark-surface p-6">
          <h2 className="mb-4 text-xl font-bold text-sand">הפרטים שלי</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              <span className="text-gray-500">שם:</span> {user?.name}
            </p>
            <p>
              <span className="text-gray-500">אימייל:</span> {user?.email}
            </p>
            <p>
              <span className="text-gray-500">תפקיד:</span>{" "}
              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  user?.role === "admin"
                    ? "bg-olive/20 text-olive-light"
                    : "bg-slate-mil/20 text-slate-mil-light"
                }`}
              >
                {user?.role === "admin" ? "מנהל" : "חבר/ת פלוגה"}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-dark-surface p-6">
          <h2 className="mb-4 text-xl font-bold text-sand">הקבוצות שלי</h2>
          {userGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userGroups.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{
                    backgroundColor: g.color + "30",
                    color: g.color,
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">עדיין לא שויכת לקבוצות</p>
          )}
        </div>

        <div className="rounded-xl bg-dark-surface p-6">
          <h2 className="mb-4 text-xl font-bold text-sand">קישורים מהירים</h2>
          <div className="space-y-2">
            <Link
              href="/members/documents"
              className="block rounded-lg bg-dark-card px-4 py-3 text-gray-300 transition-colors hover:bg-dark-bg hover:text-sand"
            >
              📄 מסמכים
            </Link>
            <Link
              href="/members/gallery"
              className="block rounded-lg bg-dark-card px-4 py-3 text-gray-300 transition-colors hover:bg-dark-bg hover:text-sand"
            >
              🖼️ גלריה פנימית
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="block rounded-lg bg-olive/20 px-4 py-3 text-olive-light transition-colors hover:bg-olive/30"
              >
                ⚙️ ניהול אתר
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-gray-500 underline hover:text-sand"
        >
          חזרה לאתר הראשי
        </Link>
      </div>
    </div>
  );
}
