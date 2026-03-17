import { getGroups } from "@/lib/db";
import GroupManagement from "./GroupManagement";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = getGroups();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sand">ניהול קבוצות</h1>
        <p className="mt-1 text-gray-400">
          יצירה ועריכה של קבוצות לניהול הרשאות גישה
        </p>
      </div>
      <GroupManagement initialGroups={groups} />
    </div>
  );
}
