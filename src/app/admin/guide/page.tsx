export const dynamic = "force-dynamic";

export const metadata = {
  title: "מדריך למנהל | פלוגת צב",
};

export default function GuidePage() {
  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-sand">📖 מדריך למנהל האתר</h1>
        <p className="mt-1 text-gray-400">כל מה שצריך לדעת כדי לנהל את האתר של פלוגת צב</p>
      </div>

      {/* Table of Contents */}
      <nav className="rounded-xl bg-dark-card p-6">
        <h2 className="mb-3 text-lg font-bold text-sand">תוכן עניינים</h2>
        <ol className="space-y-1 text-sm">
          {[
            { id: "overview", label: "סקירה כללית" },
            { id: "content", label: "עריכת תוכן העמוד הראשי" },
            { id: "users", label: "ניהול משתמשים וקבוצות" },
            { id: "permissions", label: "הרשאות דפים" },
            { id: "events", label: "ניהול אירועים" },
            { id: "soldiers", label: "ניהול חיילים" },
            { id: "updates", label: "ניהול עדכונים" },
            { id: "campaigns", label: "קמפיינים וגיוס תרומות" },
            { id: "impact", label: "דשבורד השפעה" },
            { id: "privacy", label: "מדיניות פרטיות" },
            { id: "battles", label: "עמוד קרבות בלימה" },
            { id: "logs", label: "יומן פעילות" },
            { id: "domain", label: "דומיין והגדרות טכניות" },
          ].map((item, i) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-sand hover:underline">
                {i + 1}. {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 1. Overview */}
      <Section id="overview" title="1. סקירה כללית" icon="🏠">
        <P>האתר של פלוגת צב בנוי על Next.js ומאוחסן ב-Render.com. הדומיין הוא <Code>pluga.org.il</Code>.</P>
        <P>המערכת כוללת:</P>
        <Ul>
          <Li><B>עמוד ראשי</B> — עמוד שיווקי עם סקשנים ניתנים לעריכה (Hero, אודות, השפעתנו, תרומות ועוד)</Li>
          <Li><B>אזור אישי</B> — דורש הרשמה עם Google SSO. מכיל אירועים, גלריה, מסמכים, קרבות בלימה ועוד</Li>
          <Li><B>ניהול (Admin)</B> — לוח בקרה למנהלים בלבד עם גישה לכל הכלים</Li>
          <Li><B>קמפיינים</B> — עמודים ציבוריים לגיוס תרומות</Li>
        </Ul>
        <P>כל שינוי שתבצע בפנל הניהול יופיע באתר <B>מיידית</B> (אין צורך ב-redeploy).</P>
      </Section>

      {/* 2. Content */}
      <Section id="content" title="2. עריכת תוכן העמוד הראשי" icon="✏️">
        <P>נווט ל: <Code>/admin/content</Code></P>
        <P>בצד ימין תראה את רשימת הסקשנים בעמוד הראשי. לחץ על כל סקשן כדי לערוך אותו.</P>

        <H3>סידור סקשנים</H3>
        <Ul>
          <Li><B>▲ / ▼</B> — הזז סקשן למעלה או למטה</Li>
          <Li><B>👁️</B> — הסתר/הצג סקשן (לא מוחק, רק מסתיר)</Li>
          <Li><B>✕</B> — הסר סקשן</Li>
        </Ul>

        <H3>סקשנים זמינים</H3>
        <Ul>
          <Li><B>🏠 חלק ראשי (Hero)</B> — כותרת, תת-כותרת, תיאור וכפתורים</Li>
          <Li><B>📖 אודות</B> — טקסט אודות הפלוגה וערכים</Li>
          <Li><B>📊 השפעתנו</B> — מספרים ונתונים סטטיסטיים</Li>
          <Li><B>🖼️ עדכונים וגלריה</B> — כרטיסי עדכונים (מנוהלים ב&quot;ניהול עדכונים&quot;)</Li>
          <Li><B>📅 ציר הזמן</B> — אירועי מפתח בהיסטוריה של הפלוגה</Li>
          <Li><B>💰 תרומות</B> — כותרת, טקסט, אמצעי תשלום (PayBox וכו׳)</Li>
          <Li><B>📧 צור קשר</B> — פרטי יצירת קשר</Li>
          <Li><B>📊 דשבורד השפעה</B> — תצוגת התקדמות תרומות (ראה סעיף 9)</Li>
        </Ul>

        <H3>אמצעי תשלום (בסקשן תרומות)</H3>
        <P>לחץ <Code>+ הוסף אמצעי תשלום</Code> כדי להוסיף קישור תשלום. לכל אמצעי יש:</P>
        <Ul>
          <Li><B>אייקון</B> — אמוג&apos;י (למשל 💳)</Li>
          <Li><B>שם</B> — למשל &quot;PayBox&quot;</Li>
          <Li><B>קישור</B> — URL מלא לעמוד התשלום</Li>
        </Ul>
        <P>האמצעי הראשון ברשימה מוצג ככפתור ראשי בולט. השאר כמשניים.</P>
      </Section>

      {/* 3. Users */}
      <Section id="users" title="3. ניהול משתמשים וקבוצות" icon="👥">
        <P>נווט ל: <Code>/admin/users</Code></P>

        <H3>משתמשים</H3>
        <P>משתמשים נוצרים אוטומטית בהתחברות הראשונה עם Google. לכל משתמש:</P>
        <Ul>
          <Li><B>תפקיד</B> — &quot;חבר/ת פלוגה&quot; או &quot;מנהל&quot;</Li>
          <Li><B>סטטוס</B> — פעיל/מושבת (מושבת = לא יכול להיכנס לאזור אישי)</Li>
          <Li><B>קבוצות</B> — לחיצה על שם קבוצה מוסיפה/מסירה את המשתמש</Li>
          <Li><B>קטגוריה פנימית</B> — תווית פנימית (רק מנהלים רואים, למשל &quot;לוחם ותיק&quot;)</Li>
        </Ul>

        <H3>קבוצות</H3>
        <P>נווט ל: <Code>/admin/groups</Code></P>
        <P>קבוצות משמשות להרשאות גישה לדפים. ברירת מחדל: מפקדים, לוחמים, משפחות.</P>

        <H3>שיוך אוטומטי</H3>
        <P>כשחייל מהרשימה (ניהול חיילים) נרשם עם אותו אימייל, הוא משויך אוטומטית לקבוצת &quot;לוחמים&quot;.</P>
      </Section>

      {/* 4. Permissions */}
      <Section id="permissions" title="4. הרשאות דפים" icon="🔒">
        <P>נווט ל: <Code>/admin/pages</Code></P>
        <P>לכל דף ניתן להגדיר רמת גישה:</P>
        <Ul>
          <Li><B>🌐 פתוח</B> — נגיש לכולם ללא התחברות</Li>
          <Li><B>🔒 חברים</B> — כל חברי הפלוגה המחוברים</Li>
          <Li><B>🏷️ קבוצות</B> — רק קבוצות ספציפיות שתבחר</Li>
        </Ul>
        <P>דפים חדשים שנוצרים (כמו חטיבה 188, כלים שימושיים) נוספים אוטומטית לרשימה.</P>
        <P><B>שים לב:</B> מנהלים תמיד רואים את כל הדפים, ללא קשר להרשאות.</P>
      </Section>

      {/* 5. Events */}
      <Section id="events" title="5. ניהול אירועים" icon="📅">
        <P>נווט ל: <Code>/admin/events</Code></P>
        <P>אירועים מוצגים על מפה וציר זמן בעמוד &quot;אירועי הפלוגה&quot;.</P>

        <H3>שדות לכל אירוע</H3>
        <Ul>
          <Li><B>כותרת</B> — שם האירוע</Li>
          <Li><B>סוג</B> — אימון / פעילות מבצעית / פעילות חברתית / מדים</Li>
          <Li><B>תאריך התחלה</B> (חובה) ו<B>תאריך סיום</B> (אופציונלי)</Li>
          <Li><B>מיקום</B> — שם המקום (טקסט)</Li>
          <Li><B>קורדינטות</B> — lat/lng לתצוגה על המפה</Li>
          <Li><B>תיאור</B> — טקסט חופשי</Li>
          <Li><B>קישור לאלבום</B> — URL לאלבום תמונות</Li>
        </Ul>

        <H3>תצוגת מפה עם Play</H3>
        <P>באירועים יש כפתור Play שמציג את האירועים בציר זמן אנימטיבי על המפה. הטנק מסתובב בין האירועים לפי תאריך.</P>
      </Section>

      {/* 6. Soldiers */}
      <Section id="soldiers" title="6. ניהול חיילים" icon="🪖">
        <P>נווט ל: <Code>/admin/soldiers</Code></P>
        <P>רשימת חיילי הפלוגה — בעבר ובהווה. הנתונים משמשים ל:</P>
        <Ul>
          <Li><B>אג&apos;נדה</B> — ימי הולדת ויובלי שחרור</Li>
          <Li><B>מפת חיילים</B> — תצוגה גיאוגרפית</Li>
          <Li><B>שיוך אוטומטי</B> — משתמש שנרשם עם מייל תואם משויך אוטומטית</Li>
        </Ul>

        <H3>ייבוא נתונים</H3>
        <P>בפעם הראשונה, לחץ על <Code>📥 טען נתוני חיילים</Code> לייבוא מקובץ CSV.</P>

        <H3>קורדינטות</H3>
        <P>המערכת מנסה לזהות עיר ולשייך קורדינטות אוטומטית. אם לא נמצא — הזן ידנית בשדות lat/lng.</P>
      </Section>

      {/* 7. Updates */}
      <Section id="updates" title="7. ניהול עדכונים" icon="📰">
        <P>נווט ל: <Code>/admin/updates</Code></P>
        <P>כרטיסי עדכונים מוצגים בסקשן &quot;עדכונים וגלריה&quot; בעמוד הראשי.</P>
        <Ul>
          <Li><B>כותרת</B> ו<B>תאריך</B> — חובה</Li>
          <Li><B>תקציר</B> — טקסט קצר שמופיע בכרטיס</Li>
          <Li><B>תוכן</B> — תוכן מלא (תומך Markdown)</Li>
          <Li><B>תגיות</B> — מופרדות בפסיק</Li>
          <Li><B>תמונת כיסוי</B> — URL לתמונה</Li>
        </Ul>
        <P>עדכונים ישנים מקבצי Markdown מופיעים כ&quot;עדכונים מהארכיון&quot; עם אפשרות להעביר למערכת.</P>
      </Section>

      {/* 8. Campaigns */}
      <Section id="campaigns" title="8. קמפיינים וגיוס תרומות" icon="🎯">
        <P>נווט ל: <Code>/admin/campaigns</Code></P>
        <P>צור קמפיינים ייעודיים לגיוס תרומות — כל קמפיין מקבל עמוד ציבורי עם URL ייחודי.</P>

        <H3>יצירת קמפיין</H3>
        <Ul>
          <Li><B>כותרת</B> — שם הקמפיין (הslug נוצר אוטומטית)</Li>
          <Li><B>תיאור</B> — טקסט מפורט (תומך Markdown)</Li>
          <Li><B>יעד</B> — סכום המטרה</Li>
          <Li><B>גויס</B> — עדכן ידנית כשמתקבלות תרומות</Li>
          <Li><B>אמצעי תשלום</B> — קישורים לתשלום (PayBox, ביט וכו׳)</Li>
          <Li><B>תאריכי התחלה/סיום</B> — אופציונלי, מוצג ספירה לאחור</Li>
          <Li><B>טקסט שיתוף</B> — הודעה מותאמת לשיתוף בוואטסאפ</Li>
        </Ul>

        <H3>שיתוף</H3>
        <P>כל עמוד קמפיין כולל כפתורי שיתוף:</P>
        <Ul>
          <Li><B>WhatsApp</B> — שיתוף עם טקסט מותאם</Li>
          <Li><B>העתק קישור</B> — להדבקה בכל מקום</Li>
        </Ul>
        <P>URL לדוגמה: <Code>pluga.org.il/campaigns/equipment-drive-2024</Code></P>

        <H3>ניהול</H3>
        <P>לחץ <B>פעיל/לא פעיל</B> כדי לשלוט מה מוצג. קמפיינים לא פעילים עדיין נגישים ב-URL ישיר אך לא מופיעים ברשימה.</P>
      </Section>

      {/* 9. Impact */}
      <Section id="impact" title="9. דשבורד השפעה" icon="📊">
        <P>נווט ל: <Code>/admin/content</Code> → בחר <Code>📊 דשבורד השפעה</Code></P>
        <P>סקשן ויזואלי בעמוד הראשי שמציג שקיפות בתרומות:</P>

        <H3>שדות</H3>
        <Ul>
          <Li><B>יעד כולל</B> — סכום המטרה (למשל 100,000)</Li>
          <Li><B>סה&quot;כ גויס</B> — סכום שגויס עד כה</Li>
          <Li><B>קטגוריות</B> — לאן הכסף הולך (ציוד, רווחה, משפחות) — כל אחד עם שם, סכום, צבע ואייקון</Li>
          <Li><B>תרומות אחרונות</B> — שם (או &quot;אנונימי&quot;), סכום, תאריך</Li>
          <Li><B>סטטיסטיקות</B> — מספרים מרכזיים (חיילים שנתמכו, אירועים שמומנו)</Li>
        </Ul>
        <P>כל הנתונים מוזנים ידנית — אין חיבור אוטומטי לשער תשלום.</P>
      </Section>

      {/* 10. Privacy */}
      <Section id="privacy" title="10. מדיניות פרטיות" icon="📋">
        <P>נווט ל: <Code>/admin/privacy-policy</Code></P>
        <P>כתוב/ערוך את טקסט מדיניות הפרטיות. כל שמירה יוצרת <B>גרסה חדשה</B>.</P>

        <H3>איך זה עובד</H3>
        <Ul>
          <Li>כשאין מדיניות — משתמשים נכנסים לאזור אישי בחופשיות</Li>
          <Li>ברגע שפרסמת מדיניות — כל משתמש חייב לאשר אותה לפני גישה</Li>
          <Li>כשעורכים ושומרים — <B>כל המשתמשים</B> צריכים לאשר מחדש</Li>
        </Ul>

        <H3>מעקב</H3>
        <P>בניהול משתמשים (<Code>/admin/users</Code>) → לחץ &quot;פרטים&quot; כדי לראות:</P>
        <Ul>
          <Li>גרסה שאישר</Li>
          <Li>תאריך אישור</Li>
          <Li>פרטי פרופיל שמילא (טלפון, קשר לפלוגה)</Li>
          <Li>הסכמה לדיוורים</Li>
        </Ul>
      </Section>

      {/* 11. Battles */}
      <Section id="battles" title="11. עמוד קרבות בלימה" icon="⚔️">
        <P>עמוד מיוחד בכתובת <Code>/members/battles</Code></P>
        <P>מציג את סיפור הקרבות של הפלוגה ב-7 באוקטובר 2023 עם:</P>
        <Ul>
          <Li><B>מפה אינטראקטיבית</B> — סימוני טנק על המפה</Li>
          <Li><B>ציר זמן</B> — Play/Pause להצגה כרונולוגית</Li>
          <Li><B>הודעות WhatsApp</B> — מוטבע בציר הזמן</Li>
        </Ul>
        <P>הגדרת הרשאות: <Code>/admin/pages</Code> → &quot;קרבות בלימה&quot;</P>
      </Section>

      {/* 12. Logs */}
      <Section id="logs" title="12. יומן פעילות" icon="📊">
        <P>נווט ל: <Code>/admin/logs</Code></P>
        <P>מעקב אחר כל הדפים שכל משתמש ביקר בהם. המערכת שומרת עד 10,000 רשומות אחרונות.</P>
        <Ul>
          <Li>סינון לפי משתמש</Li>
          <Li>צפייה בזמנים ודפים</Li>
          <Li>אפשרות לניקוי יומן</Li>
        </Ul>
      </Section>

      {/* 13. Technical */}
      <Section id="domain" title="13. דומיין והגדרות טכניות" icon="⚙️">
        <H3>הגדרות Render</H3>
        <Ul>
          <Li><B>תוכנית:</B> Starter ($7/חודש)</Li>
          <Li><B>דיסק:</B> 1GB ב-<Code>/opt/render/project/src/data</Code></Li>
          <Li><B>Start Command:</B> <Code>npx next start -p $PORT</Code></Li>
        </Ul>

        <H3>משתני סביבה (Environment Variables)</H3>
        <Ul>
          <Li><Code>ADMIN_EMAIL</Code> — אימייל שתמיד מקבל הרשאת מנהל</Li>
          <Li><Code>AUTH_SECRET</Code> — מפתח הצפנה לסשנים</Li>
          <Li><Code>AUTH_URL</Code> — <Code>https://pluga.org.il</Code></Li>
          <Li><Code>GOOGLE_CLIENT_ID</Code> / <Code>GOOGLE_CLIENT_SECRET</Code> — מ-Google Cloud Console</Li>
          <Li><Code>DATA_DIR</Code> — <Code>/opt/render/project/src/data</Code></Li>
          <Li><Code>NEXT_PUBLIC_SITE_URL</Code> — <Code>https://pluga.org.il</Code></Li>
        </Ul>

        <H3>Google Cloud Console</H3>
        <P>Authorized redirect URIs חייבים לכלול:</P>
        <Ul>
          <Li><Code>https://pluga.org.il/api/auth/callback/google</Code></Li>
          <Li><Code>https://www.pluga.org.il/api/auth/callback/google</Code></Li>
          <Li><Code>https://plugat-tzav.onrender.com/api/auth/callback/google</Code></Li>
          <Li><Code>http://localhost:3000/api/auth/callback/google</Code></Li>
        </Ul>

        <H3>גיבוי נתונים</H3>
        <P>כל הנתונים שמורים בקבצי JSON על הדיסק:</P>
        <Ul>
          <Li><Code>users.json</Code> — משתמשים</Li>
          <Li><Code>groups.json</Code> — קבוצות</Li>
          <Li><Code>events.json</Code> — אירועים</Li>
          <Li><Code>soldiers.json</Code> — חיילים</Li>
          <Li><Code>campaigns.json</Code> — קמפיינים</Li>
          <Li><Code>site-content.json</Code> — תוכן העמוד הראשי</Li>
          <Li><Code>privacy-policy.json</Code> — מדיניות פרטיות</Li>
          <Li><Code>page-access.json</Code> — הרשאות דפים</Li>
          <Li><Code>activity-log.json</Code> — יומן פעילות</Li>
        </Ul>
      </Section>
    </div>
  );
}

/* ── Helper components ── */
function Section({ id, title, icon, children }: { id: string; title: string; icon: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl bg-dark-card p-6 space-y-3">
      <h2 className="flex items-center gap-2 text-2xl font-bold text-sand">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-4 text-lg font-bold text-white">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-300 leading-relaxed">{children}</p>;
}

function B({ children }: { children: React.ReactNode }) {
  return <strong className="text-white">{children}</strong>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-dark-surface px-1.5 py-0.5 text-sm text-sand font-mono" dir="ltr">{children}</code>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="mr-4 space-y-1 list-disc list-inside marker:text-olive">{children}</ul>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-gray-300">{children}</li>;
}
