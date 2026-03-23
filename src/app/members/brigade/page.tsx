import Link from "next/link";

export const metadata = {
  title: "חטיבה 188 — עמותת ברק | פלוגת צב",
};

export default function BrigadePage() {
  const activities = [
    { icon: "🤝", title: "תמיכה בחיילים ובוגרים", description: "סיוע ותמיכה לחברי החטיבה, תוכניות מנטורינג ומלגות" },
    { icon: "🕯️", title: "הנצחה ומורשת", description: "הנצחת חללי החטיבה ושמירה על מורשתה במרכז ההנצחה בעליקה" },
    { icon: "👥", title: "קהילה", description: "CLUB הברק — רשת חברים, אירועים חטיבתיים ופעילויות משפחתיות" },
    { icon: "💪", title: "מיזמים חברתיים", description: 'מיזם "אור כי יהל" לתמיכה בנפגעים, ו"ברק של תקווה" לחוסן המשפחה' },
    { icon: "🎓", title: "עמית לדרך", description: "תוכנית מנטורינג ליווי אישי לחיילים ובוגרי החטיבה" },
    { icon: "❤️", title: "טיפול בנפגעים", description: "ליווי וטיפול בחיילים שנפצעו בקרבות ובמשפחותיהם" },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-l from-amber-900/30 to-dark-card p-8">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🛡️</span>
          <div>
            <h1 className="text-3xl font-bold text-sand">חטיבה 188 — עמותת ברק</h1>
            <p className="mt-1 text-gray-400">
              לסייע לחיילי החטיבה ובוגריה, להנציח את חלליה ולהנחיל את מורשתה
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl bg-dark-surface p-6">
        <h2 className="mb-4 text-xl font-bold text-sand">אודות העמותה</h2>
        <p className="leading-relaxed text-gray-300">
          עמותת ברק הוקמה כדי לסייע לחיילי חטיבה 188 ובוגריה, להנציח את חלליה ולהנחיל את מורשתה.
          העמותה מפעילה מגוון תוכניות תמיכה, הנצחה ופעילויות קהילתיות עבור חיילי החטיבה, הבוגרים והמשפחות.
        </p>
      </div>

      {/* Activities grid */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-sand">פעילויות עיקריות</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <div
              key={activity.title}
              className="rounded-xl border border-dark-border bg-dark-card p-5 transition-all hover:border-amber-800/30"
            >
              <span className="text-2xl">{activity.icon}</span>
              <h3 className="mt-2 font-bold text-white">{activity.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Link to official site */}
      <div className="rounded-2xl border border-amber-800/30 bg-amber-900/10 p-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-sand">אתר עמותת ברק</h2>
        <p className="mb-4 text-gray-400">
          למידע נוסף, הצטרפות לעמותה ותרומות
        </p>
        <a
          href="https://barak-188.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-amber-700 px-8 py-3 font-bold text-white transition-colors hover:bg-amber-600"
        >
          לאתר העמותה ←
        </a>
      </div>

      <div className="text-center">
        <Link href="/members" className="text-sm text-gray-500 hover:text-sand">
          ← חזרה לאזור האישי
        </Link>
      </div>
    </div>
  );
}
