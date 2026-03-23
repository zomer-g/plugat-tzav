import Link from "next/link";

export const metadata = {
  title: "כלים שימושיים למילואימניקים | פלוגת צב",
};

export default function ToolsPage() {
  const sections = [
    {
      title: "אתר המילואים ופורטלים ממשלתיים",
      icon: "🎖️",
      description: "ריכוז המידע הרשמי מצה\"ל ומשרד הביטחון",
      links: [
        { label: "אתר המילואים הראשי של צה\"ל", url: "https://www.miluim.idf.il/", description: "הפקת אישורי שמ\"פ (3010), עדכון פרטים אישיים וצפייה בסטטוס מענקים" },
        { label: "קרן הסיוע למשרתי המילואים", url: "https://www.miluim.idf.il/articles-list/%D7%A7%D7%A8%D7%9F-%D7%94%D7%A1%D7%99%D7%95%D7%A2-%D7%9C%D7%9E%D7%A9%D7%A8%D7%AA%D7%99-%D7%94%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D", description: "הגשת בקשות לסיוע בגין נזקים כלכליים, ביטול חופשות וסיוע לסטודנטים" },
        { label: "מחשבון תגמולים ומענקים", url: "https://www.miluim.idf.il/calculator", description: "סימולציה אישית של גובה המענקים הצפויים על בסיס ימי השירות" },
        { label: "כיוונים 360 — מיצוי זכויות", url: "https://www.whiteboard.co.il/post/%D7%9B%D7%99%D7%95%D7%95%D7%A0%D7%99%D7%9D-360-%D7%90%D7%AA%D7%A8-%D7%9C%D7%9E%D7%99%D7%A6%D7%95%D7%99-%D7%96%D7%9B%D7%95%D7%99%D7%95%D7%AA-%D7%91%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D-%D7%A4%D7%A2%D7%99%D7%9C-%D7%9E%D7%9C%D7%97%D7%9E%D7%AA-%D7%97%D7%A8%D7%91%D7%95%D7%AA-%D7%91%D7%A8%D7%96%D7%9C", description: "מערכת דיגיטלית המרכזת רשימת פעולות לביצוע לפי סטטוס אישי (שכיר, עצמאי, סטודנט)" },
      ],
    },
    {
      title: "זכויות כלכליות ופיצויים",
      icon: "💰",
      description: "תגמולים מהביטוח הלאומי וסיוע לעסקים",
      links: [
        { label: "פורטל מילואים — הביטוח הלאומי", url: "https://www.btl.gov.il/HaravotBarzel1/KizbeotHB/MiloeimHB/Pages/MsrtimMiloeim.aspx", description: "מידע על תגמול המינימום (328.76 ש\"ח ליום) וחישוב תוספת 40% למשרתים" },
        { label: "מענק נזק עקיף לעצמאיים (רשות המסים)", url: "https://www.gov.il/he/service/grant-for-reservists", description: "הגשת תביעות בגין ירידה במחזור העסקי עקב שירות מילואים בצו 8" },
        { label: "קבוצת עוגן — הלוואות ללא ריבית", url: "https://lp.ogen.org/loans-for-individuals-and-families-2/", description: "הלוואות עד 50,000 ש\"ח ללא ריבית וללא ערבים למילואימניקים שנקלעו לקושי" },
        { label: "מילג'ובס (MilJobs)", url: "https://www.miluim.idf.il/", description: "לוח תפקידים למציאת שיבוץ מילואים מותאם אישית או חזרה לשירות בהתנדבות" },
      ],
    },
    {
      title: "סטודנטים ומלגות",
      icon: "🎓",
      description: "הגנה אקדמית ומימון לימודים",
      links: [
        { label: "מדריך זכויות הסטודנט (מל\"ג)", url: "https://che.org.il/%D7%9E%D7%99%D7%93%D7%A2-%D7%9C%D7%A1%D7%98%D7%95%D7%93%D7%A0%D7%98%D7%99%D7%9D/%D7%96%D7%9B%D7%95%D7%99%D7%95%D7%AA-%D7%A1%D7%98%D7%95%D7%93%D7%A0%D7%98%D7%99%D7%9D/%D7%96%D7%9B%D7%95%D7%99%D7%95%D7%AA-%D7%A1%D7%98%D7%95%D7%93%D7%A0%D7%98%D7%99%D7%9D-%D7%91%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D/", description: "התאמות בבחינות, דחיית מטלות והארכת לימודים בשני סמסטרים למי ששירת 150 יום" },
        { label: "מלגת 'ממדים ללימודים'", url: "https://www.hachvana.mod.gov.il/MainEducation/HachvanaScholarship/Pages/UniformToStudies.aspx", description: "מימון מלא של שכר הלימוד ללוחמים ואוכלוסיות ייחודיות" },
        { label: "מלגת מענק מילואים 2026 (Milgapo)", url: "https://milgapo.co.il/?milga=_miluim-limudim", description: "מענק של עד 11,653 ש\"ח לסטודנטים שביצעו מעל 50 ימי מילואים, ללא חובת התנדבות" },
      ],
    },
    {
      title: "חוסן נפשי ורווחה",
      icon: "🧠",
      description: "טיפולים רגשיים ופעילויות Wellness",
      links: [
        { label: "תוכנית עמית (משרד הביטחון)", url: "https://www.hachvana.mod.gov.il/ConsultationAndDirection/Pages/amit-program.aspx", description: "12 טיפולים נפשיים במימון מלא ושלל פעילויות ספורט, יוגה וסדנאות חווייתיות" },
        { label: "אפליקציית תוכנית עמית", url: "https://tochnitamit.mod.gov.il/", description: "הזמנת טיפולים ופעילויות Wellness ישירות מהסמארטפון" },
        { label: "מוקד 'נפש אחת' (*8944)", url: "https://shikum.mod.gov.il/about/harvot-barzel/mental-treatment", description: "תמיכה נפשית והכוונה לפצועים, משוחררים ובני משפחה" },
        { label: "היחידה לתגובות קרב", url: "https://shikum.mod.gov.il/about/harvot-barzel", description: "אבחון וטיפול בטראומה ללא תשלום וללא הגבלת זמן למשרתים שנחשפו לאירועי לחימה" },
        { label: "קו הסיוע של נט\"ל (1-800-363-363)", url: "https://sahar.org.il/blog/help_type/%D7%A6%D7%91%D7%90-%D7%A1%D7%93%D7%99%D7%A8-%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D-%D7%95%D7%9E%D7%A9%D7%A4%D7%97%D7%95%D7%AA%D7%99%D7%94%D7%9D/", description: "מענה טלפוני 24/7 לנפגעי טראומה על רקע מלחמה" },
      ],
    },
    {
      title: "הגנה תעסוקתית וייעוץ משפטי",
      icon: "⚖️",
      description: "סיוע מול מעסיקים ומיצוי זכויות",
      links: [
        { label: "ייעוץ משפטי חינם — קהילת המילואימניקים", url: "https://miluimnikim.org/mishpati/", description: "ליווי וייצוג משפטי במקרים של פיטורין או פגיעה בזכויות עקב שירות המילואים" },
        { label: "מוקד החירום של ההסתדרות (*2383)", url: "https://www.histadrut.org.il/news/%D7%9E%D7%92%D7%95%D7%99%D7%A1%D7%99%D7%9D-%D7%9C%D7%9E%D7%A2%D7%A0%D7%9B%D7%9D/", description: "סיוע משפטי מול מעסיקים, עזרה בחיפוש עבודה והטבות תרבות" },
        { label: "כל זכות — מדריך מילואים", url: "https://www.kolzchut.org.il/he/%D7%9E%D7%99%D7%9C%D7%95%D7%90%D7%99%D7%9D", description: "מאגר מידע מקיף על חובות המעסיק ואיסור פיטורין בתקופת המילואים ו-60 יום לאחריהם" },
      ],
    },
    {
      title: "משפחה ובת הזוג",
      icon: "🏠",
      description: "מעטפת תמיכה לעורף המשפחתי",
      links: [
        { label: "פורום נשות המילואימניקים", url: "https://miluimnikim.org/help/", description: "קהילה תומכת עם סדנאות חוסן, עזרה בבית (\"לב אחד\"), וסיוע כלכלי לעסק של בת הזוג" },
        { label: "העוגן למשפחות המילואים", url: "https://lp.ogen.org/loans-for-individuals-and-families-2/", description: "מערך מתנדבים לסיוע בבייביסיטר, ארוחות חמות ומטלות בית" },
        { label: "מענק לבת זוג לאחר חופשת לידה", url: "https://www.miluim.idf.il/benefits-list/", description: "מענק חד-פעמי של 10,700 ש\"ח לבת זוג של משרת שביצע 45 ימים" },
      ],
    },
    {
      title: "אפליקציות וכלים דיגיטליים",
      icon: "📱",
      description: "הטבות וניהול השירות מהנייד",
      links: [
        { label: "אפליקציית 'המילואימניקים פלוס'", url: "https://miluimnikim.org/", description: "ארנק דיגיטלי להטבות ברשתות מזון, מסעדות ואטרקציות" },
        { label: "מועדון 'בהצדעה'", url: "https://www.miluim.idf.il/benefits-list/", description: "אתר ההטבות הרשמי למשרתים פעילים" },
      ],
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-l from-green-900/30 to-dark-card p-8">
        <div className="flex items-center gap-4">
          <span className="text-5xl">🛠️</span>
          <div>
            <h1 className="text-3xl font-bold text-sand">כלים שימושיים למילואימניקים</h1>
            <p className="mt-1 text-gray-400">
              ריכוז קישורים חיוניים למיצוי זכויות, תמיכה כלכלית ומעטפת חוסן למשרתים ולבני המשפחה
            </p>
          </div>
        </div>
      </div>

      {/* Emergency banner */}
      <div className="rounded-xl border border-red-800/40 bg-red-900/20 p-4">
        <p className="text-center text-sm font-bold text-red-300">
          📞 קו חירום נפשי 24/7: <span dir="ltr">1-800-363-363</span> (נט&quot;ל) &nbsp;|&nbsp; מוקד נפש אחת: <span dir="ltr">*8944</span>
        </p>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl bg-dark-surface p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">{section.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-sand">{section.title}</h2>
              <p className="text-sm text-gray-400">{section.description}</p>
            </div>
          </div>
          <div className="space-y-3">
            {section.links.map((link) => (
              <a
                key={link.url + link.label}
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

      {/* Footer note */}
      <div className="rounded-xl bg-dark-card p-4 text-center">
        <p className="text-xs text-gray-500">
          המידע מעודכן לשנים 2024–2026 ומתבסס על החלטות ממשלה ופקודות צה&quot;ל העדכניות
        </p>
      </div>

      <div className="text-center">
        <Link href="/members" className="text-sm text-gray-500 hover:text-sand">
          ← חזרה לאזור האישי
        </Link>
      </div>
    </div>
  );
}
