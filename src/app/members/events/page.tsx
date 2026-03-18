import EventsDisplay from "./EventsDisplay";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "אירועים | פלוגת צב",
  description: "אירועי הפלוגה — מפה וציר זמן",
};

export default function MembersEventsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sand">📅 אירועי הפלוגה</h1>
        <p className="mt-2 text-gray-400">
          כל האירועים, האימונים והפעילויות של פלוגת צב — על מפה ועל ציר זמן
        </p>
      </div>
      <EventsDisplay />
    </div>
  );
}
