export default function BattlesHero() {
  return (
    <section className="relative flex min-h-[100vh] flex-col items-center justify-center overflow-hidden text-center -mx-4 -mt-8 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg" />
      <div className="absolute inset-0 bg-gradient-to-br from-olive/10 via-transparent to-olive-dark/10" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl space-y-6 px-4">
        <h1 className="text-5xl font-black leading-tight text-sand sm:text-6xl md:text-7xl">
          קרבות בלימה
        </h1>
        <p className="text-lg font-bold text-gray-400 sm:text-xl">
          פלוגה א&apos; | גדוד 53 | גדוד 275 | 7-10 באוקטובר 2023
        </p>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
          הסיפור של צוותי הטנקים של פלוגה א&apos; שיצאו להגן על ישובי עוטף עזה
          בשעות הראשונות של ה-7 באוקטובר. שמונה צוותי טנקים, ארבעה ימי לחימה,
          סיפור אחד של גבורה ואחווה.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-sand/60"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
