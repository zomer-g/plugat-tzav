import { getSiteContent } from "@/lib/db";

const VALUE_ICONS: Record<string, { icon: string; desc: string }> = {
  "מקצועיות": { icon: "🛡️", desc: "רמה גבוהה של הכשרה ומוכנות" },
  "אחווה": { icon: "🤝", desc: "קשרים חזקים בין הלוחמים" },
  "מחויבות": { icon: "🎯", desc: "מסירות למשימה ולמדינה" },
  "חוסן": { icon: "💪", desc: "עמידות וכוח פנימי" },
};

const DEFAULT_ICON = { icon: "⭐", desc: "" };

export default function About() {
  const content = getSiteContent();
  const paragraphs = content.about.text.split("\n\n").filter(Boolean);

  return (
    <section id="about" aria-labelledby="about-heading" className="bg-dark-surface py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          id="about-heading"
          className="mb-12 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          {content.about.title}
        </h2>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6">
            {paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-lg leading-relaxed text-gray-200">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {content.about.values.map((valueName) => {
              const info = VALUE_ICONS[valueName] || DEFAULT_ICON;
              return (
                <div
                  key={valueName}
                  className="rounded-xl border border-olive/30 bg-dark-card p-6 text-center transition-colors hover:border-olive"
                >
                  <span className="mb-3 block text-3xl" role="img" aria-hidden="true">
                    {info.icon}
                  </span>
                  <h3 className="mb-2 font-bold text-sand">{valueName}</h3>
                  {info.desc && <p className="text-sm text-gray-200">{info.desc}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
