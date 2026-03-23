import Link from "next/link";

export const metadata = {
  title: "כלים שימושיים למילואימניקים | פלוגת צב",
};

export default function ToolsPage() {
  const sections = [
    {
      title: "אתר מילואים — צה\"ל",
      icon: "🎖️",
      description: "הפורטל הרשמי של מערך המילואים בצה\"ל — מידע, עדכונים ושירותים",
      links: [
        { label: "אתר המילואים הראשי", url: "https://www.miluim.idf.il/", description: "מידע כללי, חדשות ועדכונים ממערך המילואים" },
        { label: "קרן הסיוע למשרתי המילואים", url: "https://www.miluim.idf.il/articles-list/%D7%A7%D7%A8%D7%9F-%D7%94%D7%A1%D7%99%D7%95%D7%A2-%D7%9C%D7%9E%D7%A9%D7%A8%D7%AA%D7%99-%D7%94%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D", description: "סיוע כלכלי וחברתי למשרתי מילואים ומשפחותיהם" },
        { label: "הטבות למילואימניקים", url: "https://www.miluim.idf.il/benefits-list/", description: "רשימת ההטבות המלאה לחיילי מילואים" },
      ],
    },
    {
      title: "משרד הביטחון — הכוונה",
      icon: "🏛️",
      description: "הטבות ושירותים ממשרד הביטחון",
      links: [
        { label: "הטבות נוספות למילואימניקים", url: "https://www.hachvana.mod.gov.il/ExtraBenefits/Pages/Miluim.aspx", description: "מידע על הטבות ייחודיות ממשרד הביטחון למשרתי מילואים" },
      ],
    },
    {
      title: "כל זכות — זכויות מילואימניקים",
      icon: "⚖️",
      description: "מידע מקיף על זכויות חיילי מילואים",
      links: [
        { label: "מילואים — כל זכות", url: "https://www.kolzchut.org.il/he/%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D", description: "מדריך מקיף על כל הזכויות, ההטבות והחובות של משרתי מילואים" },
      ],
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-l from-green-900/30 to-dark-card p-8">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🔧</span>
          <div>
            <h1 className="text-3xl font-bold text-sand">כלים שימושיים למילואימניקים</h1>
            <p className="mt-1 text-gray-400">
              קישורים חשובים למידע, זכויות והטבות לחיילי מילואים
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl bg-dark-surface p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl">{section.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-sand">{section.title}</h2>
              <p className="text-sm text-gray-400">{section.description}</p>
            </div>
          </div>
          <div className="space-y-3">
            {section.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-dark-border bg-dark-card p-4 transition-all hover:border-green-800/40 hover:bg-dark-bg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">{link.label}</h3>
                    <p className="mt-1 text-sm text-gray-400">{link.description}</p>
                  </div>
                  <span className="text-gray-500 text-xl">←</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center">
        <Link href="/members" className="text-sm text-gray-500 hover:text-sand">
          ← חזרה לאזור האישי
        </Link>
      </div>
    </div>
  );
}
