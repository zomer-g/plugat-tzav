import { getUsers, getGroups, getPrivacyPolicy } from "@/lib/db";
import UserManagement from "./UserManagement";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = getUsers();
  const groups = getGroups();
  const policy = getPrivacyPolicy();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sand">ניהול משתמשים</h1>
        <p className="mt-1 text-gray-400">
          ניהול משתמשים, תפקידים ושיוך לקבוצות
        </p>
      </div>
      <UserManagement
        initialUsers={users}
        groups={groups}
        currentPolicyVersion={policy.currentVersion}
      />
    </div>
  );
}
