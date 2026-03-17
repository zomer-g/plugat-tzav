import type { TimelineEntry } from "@/lib/types";

const entries: TimelineEntry[] = [
  {
    date: "2024",
    title: "אימון קיץ מרכזי",
    description:
      "אימון מרוכז בן שבוע עם כל לוחמי הפלוגה, כולל תרגילי שטח ופעילויות גיבוש.",
  },
  {
    date: "2023",
    title: "מבצע חרבות ברזל",
    description:
      "הפלוגה גויסה במלואה ופעלה במסירות. לוחמינו הוכיחו מקצועיות ואחווה.",
  },
  {
    date: "2022",
    title: "כנס שנתי ומשפחות",
    description:
      "כנס מרגש שהפגיש לוחמים ומשפחות, עם הרצאות, פעילויות והוקרה.",
  },
  {
    date: "2021",
    title: "שדרוג ציוד הפלוגה",
    description:
      "בזכות תרומות נדיבות, שדרגנו את ציוד הפלוגה ושיפרנו את תנאי השירות.",
  },
];

export default function Timeline() {
  return (
    <section id="timeline" aria-labelledby="timeline-heading" className="bg-dark-surface py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2
          id="timeline-heading"
          className="mb-4 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          ציר הזמן
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-gray-200">
          אבני דרך בסיפור הפלוגה שלנו.
        </p>

        <div className="relative">
          <div
            className="absolute top-0 bottom-0 right-1/2 w-0.5 -translate-x-1/2 bg-olive/30"
            aria-hidden="true"
          />

          {entries.map((entry, i) => (
            <div
              key={i}
              className={`relative mb-12 flex items-start gap-8 ${
                i % 2 === 0
                  ? "flex-row md:pe-[50%]"
                  : "flex-row md:flex-row-reverse md:ps-[50%]"
              }`}
            >
              <div
                className="absolute right-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-olive bg-dark-bg"
                aria-hidden="true"
              />

              <div className="ms-8 rounded-xl border border-olive/20 bg-dark-card p-6 md:ms-0">
                <span className="text-sm font-bold text-olive-light">
                  {entry.date}
                </span>
                <h3 className="mt-1 text-lg font-bold text-white">
                  {entry.title}
                </h3>
                <p className="mt-2 text-sm text-gray-200">
                  {entry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
