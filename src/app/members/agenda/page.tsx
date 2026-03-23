import { getEvents, getSoldiers } from "@/lib/db";
import AgendaList from "./AgendaList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "אג'נדה | פלוגת צב",
  description: "ימי הולדת, אירועים קרובים ותאריכים חשובים",
};

interface AgendaItem {
  date: string;
  type: "event" | "birthday" | "anniversary";
  title: string;
  description: string;
  icon: string;
}

function getNextOccurrence(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // This year's occurrence
  const thisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (thisYear >= today) return thisYear;

  // Next year's occurrence
  return new Date(today.getFullYear() + 1, d.getMonth(), d.getDate());
}

export default function AgendaPage() {
  const events = getEvents();
  const soldiers = getSoldiers();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const items: AgendaItem[] = [];

  // Future events
  for (const event of events) {
    const eventDate = new Date(event.startDate);
    if (eventDate >= now) {
      items.push({
        date: event.startDate,
        type: "event",
        title: event.title,
        description: event.location || "",
        icon: "📅",
      });
    }
  }

  // Upcoming birthdays
  for (const soldier of soldiers) {
    if (!soldier.birthDate) continue;
    const next = getNextOccurrence(soldier.birthDate);
    if (!next) continue;

    const birthYear = new Date(soldier.birthDate).getFullYear();
    const age = next.getFullYear() - birthYear;

    items.push({
      date: next.toISOString().split("T")[0],
      type: "birthday",
      title: `יום הולדת ${age} ל${soldier.name}`,
      description: soldier.role || "",
      icon: "🎂",
    });
  }

  // Service anniversaries (from serviceEndDate)
  for (const soldier of soldiers) {
    if (!soldier.serviceEndDate) continue;
    const next = getNextOccurrence(soldier.serviceEndDate);
    if (!next) continue;

    const serviceYear = new Date(soldier.serviceEndDate).getFullYear();
    const years = next.getFullYear() - serviceYear;
    if (years <= 0) continue;

    items.push({
      date: next.toISOString().split("T")[0],
      type: "anniversary",
      title: `${years} שנים לתום שירות של ${soldier.name}`,
      description: soldier.role || "",
      icon: "🎖️",
    });
  }

  // Sort by date
  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sand">📆 אג&apos;נדה</h1>
        <p className="mt-2 text-gray-400">
          אירועים קרובים, ימי הולדת ותאריכים חשובים
        </p>
      </div>
      <AgendaList items={items} />
    </div>
  );
}
