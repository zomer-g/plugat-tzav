import { getPrivacyPolicy, getUsers } from "@/lib/db";
import PrivacyPolicyManagement from "./PrivacyPolicyManagement";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const policy = getPrivacyPolicy();
  const users = getUsers();
  const consentedCount = users.filter(
    (u) => u.consentVersion === policy.currentVersion && policy.currentVersion > 0
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sand">📋 מדיניות פרטיות</h1>
        <p className="mt-1 text-gray-400">
          ניהול טקסט מדיניות הפרטיות ומעקב אחרי אישורי משתמשים
        </p>
      </div>

      {policy.currentVersion > 0 && (
        <div className="rounded-lg border border-dark-border bg-dark-surface p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">גרסה נוכחית:</span>
            <span className="font-bold text-sand">{policy.currentVersion}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-400">אישרו:</span>
            <span className="font-bold text-green-400">{consentedCount}</span>
            <span className="text-gray-400">מתוך</span>
            <span className="font-bold text-white">{users.length}</span>
          </div>
        </div>
      )}

      <PrivacyPolicyManagement initialPolicy={policy} />
    </div>
  );
}
