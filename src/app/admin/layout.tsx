import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/lib/db";
import MembersNav from "@/components/MembersNav";

export const metadata = {
  title: "ניהול | פלוגת צב",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/signin");

  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") {
    redirect("/auth/denied");
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <MembersNav
        userName={user.name}
        userImage={user.image}
        userRole={user.role}
        userEmail={user.email}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 pt-24">{children}</main>
    </div>
  );
}
