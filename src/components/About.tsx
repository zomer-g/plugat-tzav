export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-dark-surface py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          id="about-heading"
          className="mb-12 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          אודות הפלוגה
        </h2>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6">
            <p className="text-lg leading-relaxed text-gray-200">
              פלוגת צב היא יחידת מילואים שמפגישה לוחמים מכל רחבי הארץ. מאז
              הקמתה, הפלוגה מייצגת את הערכים של אחווה, מקצועיות ומחויבות
              למטרה.
            </p>
            <p className="text-lg leading-relaxed text-gray-200">
              אנחנו לא רק חיילים — אנחנו חברים, שותפים, ומשפחה. כל אימון, כל
              פעילות, כל רגע יחד מחזק את הקשר שלנו ואת המוכנות שלנו.
            </p>
            <p className="text-lg leading-relaxed text-gray-200">
              התרומות שלכם מאפשרות לנו לשדרג ציוד, לארגן פעילויות גיבוש,
              ולתמוך בלוחמים ובמשפחותיהם.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🛡️", title: "מקצועיות", desc: "רמה גבוהה של הכשרה ומוכנות" },
              { icon: "🤝", title: "אחווה", desc: "קשרים חזקים בין הלוחמים" },
              { icon: "🎯", title: "מחויבות", desc: "מסירות למשימה ולמדינה" },
              { icon: "💪", title: "חוסן", desc: "עמידות וכוח פנימי" },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-olive/30 bg-dark-card p-6 text-center transition-colors hover:border-olive"
              >
                <span className="mb-3 block text-3xl" role="img" aria-hidden="true">
                  {value.icon}
                </span>
                <h3 className="mb-2 font-bold text-sand">{value.title}</h3>
                <p className="text-sm text-gray-200">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
