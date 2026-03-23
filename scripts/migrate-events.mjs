// Migration script: import events from CSV data into the site
// Run with: node scripts/migrate-events.mjs <BASE_URL> <COOKIE>
// Example: node scripts/migrate-events.mjs https://pluga.org.il "authjs.session-token=..."

const BASE_URL = process.argv[2] || "http://localhost:3000";
const COOKIE = process.argv[3] || "";

const typeMap = {
  "אימון": "training",
  "לחימה": "operational",
  "קו": "operational",
  "על אזרחי": "social",
};

const events = [
  { title: "קו מצרים", type: "לחימה", startDate: "2012-01-18", location: "קו מצרים", lat: 30.1181178, lng: 34.7217645, description: 'קו חי"ר בגבול מצרים', albumUrl: "https://photos.app.goo.gl/FXTkmeEEYnBN8YgH9" },
  { title: "אימון פלוגה", type: "אימון", startDate: "2015-11-19", location: "בסיס צאלים", lat: 31.175747, lng: 34.557411, description: "אימון פלוגתי", albumUrl: "https://photos.app.goo.gl/gGKj7nBugYfgobX28" },
  { title: "אימון מחלקה - ערד", type: "אימון", startDate: "2016-01-31", location: "ערד", lat: 31.2813701, lng: 35.1604042, description: 'חלק מסבב אימוני מחלקה בשת"פ חי"ר', albumUrl: "https://photos.app.goo.gl/FauhcuQdYHsv2pvv5" },
  { title: 'אימון בקעה - שת"פ נח"ל', type: "אימון", startDate: "2016-11-08", location: "אימון בקעה", lat: 31.9928913, lng: 35.4475479, description: 'אימון מחלקתי בשת"פ נח"ל', albumUrl: "https://photos.app.goo.gl/zEj24vtkRpoSWNhU9" },
  { title: "אימון הסבה", type: "אימון", startDate: "2017-02-20", location: "בסיס שיזפון", lat: 30.1287404, lng: 34.9390372, description: "אימון הסבה מסימני 2 לסימני 4", albumUrl: "https://goo.gl/photos/t5YtGsqiFH8cDi4D6" },
  { title: "אימון הקמה", type: "אימון", startDate: "2017-10-18", location: "אימון הקמה", lat: 31.1737783, lng: 34.5676636, description: "אימון הקמת הפלוגה כפלוגת סימני 4", albumUrl: "https://photos.app.goo.gl/cTvRXeXUkLdtBeKYA" },
  { title: 'קו חי"ר תרקומיא', type: "קו", startDate: "2018-02-25", location: "תרקומיא", lat: 31.5921194, lng: 34.9578945, description: 'קו חי"ר באזור תרקומיא', albumUrl: "https://photos.app.goo.gl/f32L4BJYfpnN0qJp2" },
  { title: "אימון שגרתי", type: "אימון", startDate: "2021-06-06", location: 'אימון אליקים רמה"ג', lat: 33.0464, lng: 35.7254668, description: "אימון טנקים שמתחיל באליקים וממשיך ברמת הגולן", albumUrl: "https://photos.app.goo.gl/3n8EHN73u4QGTvuU8" },
  { title: "אימון כשירות", type: "אימון", startDate: "2022-10-19", location: "בסיס עליקה", lat: 33.0489667, lng: 35.7061834, description: 'אימון טנקים להחזרת כשירות לקראת אימון שת"פ עם חטיבת כפיר', albumUrl: "https://photos.app.goo.gl/9Diwj6Rj3DNtzkU2A" },
  { title: 'שת"פ כפיר', type: "אימון", startDate: "2022-11-06", location: "אימון בקעה", lat: 32.19499, lng: 35.468835, description: 'אימון פלוגתי במסגרת תרגיל מבצוע חטיבת כפיר ובנוכחות הרמטכ"ל', albumUrl: "https://photos.app.goo.gl/zo75Estou1esFX7T9" },
  { title: "חרבות ברזל", type: "לחימה", startDate: "2023-10-07", location: "צאלים", lat: 31.175747, lng: 34.557411, description: "הקפצת הפלוגה ללחימה בעוטף עזה ובהמשך בעזה", albumUrl: "https://photos.app.goo.gl/DHQ9Lgw9ehwtwg9K8" },
  { title: "לחימה בעוטף עזה", type: "לחימה", startDate: "2023-10-08", location: "עוטף עזה", lat: 31.3557317, lng: 34.4978202, description: "הקפצת הפלוגה ללחימה בעוטף עזה ובהמשך בעזה", albumUrl: "https://photos.app.goo.gl/t5rSGC869cdVrVyE8" },
  { title: "לחימה בעזה", type: "לחימה", startDate: "2023-10-31", location: "עזה", lat: 31.5016946, lng: 34.4668445, description: "הפלוגה במשך כחודש ימים בלחימה אינטנסיבית בתוך רצועת עזה", albumUrl: "https://photos.app.goo.gl/ozJjAVJr7qUroE1K6" },
  { title: "ערב פלוגה", type: "על אזרחי", startDate: "2023-12-28", location: "רמת גן", lat: 32.0670972, lng: 34.8373611, description: "ערב פלוגה אזרחי לאחר הלחימה בעזה", albumUrl: "https://photos.app.goo.gl/Xqz14W5PPmVc91xp6" },
  { title: "אירוע עיבוד לאחר לחימה בעזה", type: "על אזרחי", startDate: "2024-01-31", location: "מצדה", lat: 31.3101944, lng: 35.3612834, description: "מפגש של כל אנשי הפלוגה לאירוע עיבוד בחסות עמותת 188", albumUrl: "https://photos.app.goo.gl/EyRDknEUdEnzfv9DA" },
  { title: "ערב משפחות", type: "על אזרחי", startDate: "2024-04-05", location: "יקום", lat: 32.2499652, lng: 34.8309093, description: "ערב פלוגה בנוכחות משפחות", albumUrl: "https://photos.app.goo.gl/Akbij6oxhxCCoLrD8" },
  { title: 'קו רמה"ג', type: "קו", startDate: "2024-05-22", location: "רמת הגולן", lat: 32.8524612, lng: 35.7327626, description: "קו טנקים ברמת הגולן", albumUrl: "https://photos.app.goo.gl/bzAHSiUbZd4sbkMD9" },
  { title: "לחימה בצפון", type: "לחימה", startDate: "2024-10-10", location: "זרעית", lat: 33.1002685, lng: 35.2886345, description: "לחימה בלבנון", albumUrl: "https://photos.app.goo.gl/8DLgzzWYXMGGNvaz9" },
  { title: "לחימה בצפון", type: "לחימה", startDate: "2024-11-10", location: 'בית המח"ט בלבנון', lat: 33.098624, lng: 35.2671484, description: "לחימה בלבנון", albumUrl: "https://photos.app.goo.gl/pFZtfKMV1eEstvBNA" },
  { title: "לחימה בעזה", type: "לחימה", startDate: "2025-05-18", location: "עזה", lat: 31.3363088, lng: 34.3462497, description: "הפעלה שנייה באזור חאן-יונס", albumUrl: "https://photos.app.goo.gl/3eZ3dJzrHiJvhQLA8" },
  { title: "אירוע עיבוד לאחר לחימה בעזה", type: "על אזרחי", startDate: "2026-01-07", location: "זכרון יעקב", lat: 32.562768, lng: 34.956971, description: "מפגש אזרחי במלון עדן אין בזכרון יעקב", albumUrl: "https://photos.app.goo.gl/nFSChz6QvV8nVnbEA" },
];

async function migrate() {
  console.log(`Migrating ${events.length} events to ${BASE_URL}...`);

  for (const ev of events) {
    const mapped = typeMap[ev.type] || "social";
    const body = {
      title: ev.title,
      type: mapped,
      startDate: ev.startDate,
      location: ev.location,
      coordinates: { lat: ev.lat, lng: ev.lng },
      description: ev.description,
      albumUrl: ev.albumUrl,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/admin/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": COOKIE,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        console.log(`✅ ${ev.title} (${ev.startDate})`);
      } else {
        const data = await res.json().catch(() => ({}));
        console.log(`❌ ${ev.title}: ${res.status} ${data.error || ""}`);
      }
    } catch (err) {
      console.log(`❌ ${ev.title}: ${err.message}`);
    }
  }
  console.log("Done!");
}

migrate();
