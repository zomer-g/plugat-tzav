export default function Donation() {
  return (
    <section id="donate" aria-labelledby="donate-heading" className="py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div className="rounded-2xl bg-gradient-to-b from-olive-dark to-dark-surface p-12 md:p-16">
          <h2
            id="donate-heading"
            className="mb-6 text-3xl font-bold text-white md:text-4xl"
          >
            עזרו לנו להמשיך
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-200">
            כל תרומה עוזרת לנו לשדרג ציוד, לארגן פעילויות גיבוש, ולתמוך
            בלוחמים ובמשפחותיהם. ביחד אנחנו חזקים יותר.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={process.env.NEXT_PUBLIC_DONATION_URL || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-sand px-10 py-4 text-lg font-bold text-dark-bg transition-all hover:bg-sand-light hover:shadow-lg hover:shadow-sand/20"
              aria-label="תרמו עכשיו — דף תרומות (נפתח בחלון חדש)"
            >
              תרמו עכשיו
            </a>
            <a
              href="#contact"
              className="rounded-full border-2 border-sand/40 px-10 py-4 text-lg font-bold text-sand transition-colors hover:border-sand hover:bg-sand/10"
            >
              צרו קשר לפרטים
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-300">
            התרומות מוכרות לצורכי מס. תודה על התמיכה!
          </p>
        </div>
      </div>
    </section>
  );
}
