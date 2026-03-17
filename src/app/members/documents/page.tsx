import { auth } from "@/lib/auth";
import { canUserAccessPage } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DocumentsPage() {
  const session = await auth();
  const canAccess = canUserAccessPage(session?.user?.email, "members/documents");
  if (!canAccess) redirect("/auth/denied");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sand">מסמכים</h1>
      <div className="rounded-2xl bg-dark-card p-8 text-center">
        <p className="text-xl text-gray-400">📄</p>
        <p className="mt-2 text-gray-400">
          כאן יופיעו מסמכים פנימיים של הפלוגה.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          ניתן להוסיף מסמכים דרך מערכת ניהול התוכן
        </p>
      </div>
    </div>
  );
}
