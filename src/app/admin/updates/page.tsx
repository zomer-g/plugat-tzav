import { getUpdates } from "@/lib/db";
import { getAllUpdates as getMdUpdates } from "@/lib/markdown";
import UpdatesManagement from "./UpdatesManagement";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const updates = getUpdates();
  const mdUpdates = getMdUpdates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sand">📰 ניהול עדכונים</h1>
        <p className="mt-1 text-gray-400">
          יצירה, עריכה ומחיקה של כרטיסי עדכונים ואירועים
        </p>
      </div>
      <UpdatesManagement initialUpdates={updates} markdownUpdates={mdUpdates} />
    </div>
  );
}
