import { getPageAccess, getGroups } from "@/lib/db";
import PageAccessManagement from "./PageAccessManagement";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const pages = getPageAccess();
  const groups = getGroups();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sand">הרשאות דפים</h1>
        <p className="mt-1 text-gray-400">
          הגדירו לכל דף את רמת הגישה — פתוח לכולם, לחברי הפלוגה בלבד, או לקבוצות
          ספציפיות
        </p>
      </div>
      <PageAccessManagement initialPages={pages} groups={groups} />
    </div>
  );
}
