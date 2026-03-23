import { getCurrentPolicyVersion, getPrivacyPolicy } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "מדיניות פרטיות ונגישות | פלוגת צב",
};

export default function PrivacyPage() {
  const content = getSiteContent();
  const policy = getPrivacyPolicy();
  const currentPolicy = getCurrentPolicyVersion();

  return (
    <>
      <Navbar content={content.navbar} />
      <main className="mx-auto max-w-3xl px-4 py-24" dir="rtl">
        <h1 className="mb-8 text-center text-3xl font-bold text-sand">
          מדיניות פרטיות ונגישות
        </h1>

        {currentPolicy ? (
          <div className="rounded-xl border border-dark-border bg-dark-card p-8">
            <div className="mb-4 text-sm text-gray-500">
              גרסה {currentPolicy.version} | עודכן:{" "}
              {new Date(currentPolicy.createdAt).toLocaleDateString("he-IL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {currentPolicy.text}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center">
            <p className="text-gray-400">
              מדיניות הפרטיות טרם פורסמה.
            </p>
          </div>
        )}

        {/* Accessibility statement */}
        <div className="mt-8 rounded-xl border border-dark-border bg-dark-card p-8">
          <h2 className="mb-4 text-xl font-bold text-sand">הצהרת נגישות</h2>
          <div className="space-y-3 text-gray-300 leading-relaxed">
            <p>
              אתר פלוגת צב מחויב לנגישות דיגיטלית ועומד בתקן WCAG 2.1 ברמה AAA.
            </p>
            <p>
              האתר נבנה תוך הקפדה על עקרונות נגישות, כולל:
            </p>
            <ul className="mr-6 list-disc space-y-1">
              <li>תמיכה מלאה בקוראי מסך</li>
              <li>ניווט מלא באמצעות מקלדת</li>
              <li>ניגודיות צבעים גבוהה</li>
              <li>תמיכה ב-RTL (כתיבה מימין לשמאל)</li>
              <li>תגיות ARIA לכל האלמנטים האינטראקטיביים</li>
              <li>כפתור &quot;דלג לתוכן הראשי&quot;</li>
            </ul>
            <p>
              אם נתקלתם בבעיית נגישות, אנא פנו אלינו בכתובת:{" "}
              <a href={`mailto:${content.contact.email}`} className="text-sand hover:underline">
                {content.contact.email}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sand hover:underline">
            חזרה לעמוד הראשי
          </Link>
        </div>
      </main>
      <Footer content={content.footer} />
    </>
  );
}
