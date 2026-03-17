import { auth } from "@/lib/auth";
import { canUserAccessPage, getUserByEmail } from "@/lib/db";
import { redirect } from "next/navigation";
import MembersNav from "@/components/MembersNav";
import Navbar from "@/components/Navbar";
import EventsDisplay from "./EventsDisplay";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "אירועים | פלוגת צב",
  description: "אירועי הפלוגה — מפה וציר זמן",
};

export default async function EventsPage() {
  const session = await auth();
  const email = session?.user?.email || null;

  // Check page access
  if (!canUserAccessPage(email, "events")) {
    redirect(email ? "/auth/denied" : "/auth/signin");
  }

  const user = email ? getUserByEmail(email) : null;

  return (
    <div className="min-h-screen bg-dark-bg">
      {user ? (
        <MembersNav
          userName={user.name}
          userImage={user.image}
          userRole={user.role}
          userEmail={user.email}
        />
      ) : (
        <Navbar />
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sand">📅 אירועי הפלוגה</h1>
          <p className="mt-2 text-gray-400">
            כל האירועים, האימונים והפעילויות של פלוגת צב — על מפה ועל ציר זמן
          </p>
        </div>
        <EventsDisplay />
      </main>
    </div>
  );
}
