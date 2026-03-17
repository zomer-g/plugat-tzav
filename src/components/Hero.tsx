import Image from "next/image";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg" />

      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-olive blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-sand blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative h-48 w-48 md:h-64 md:w-64">
          <Image
            src="/logo.png"
            alt="סמל פלוגת צב"
            fill
            className="object-contain drop-shadow-2xl mix-blend-lighten"
            priority
          />
        </div>

        <h1
          id="hero-heading"
          className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl"
        >
          פלוגת צב
          <span className="mt-2 block text-sand">ביחד, תמיד מוכנים</span>
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-gray-200 md:text-xl">
          אנחנו חיילי מילואים, חברים, משפחה. יחד אנחנו שומרים על הבית ובונים
          קהילה חזקה.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <a
            href={process.env.NEXT_PUBLIC_DONATION_URL || "#donate"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-olive px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-olive-light hover:shadow-olive/30 hover:shadow-xl"
            aria-label="תרמו עכשיו — כפתור ראשי (נפתח בחלון חדש)"
          >
            תרמו עכשיו
          </a>
          <a
            href="#about"
            className="rounded-full border-2 border-sand/50 px-10 py-4 text-lg font-bold text-sand transition-all hover:border-sand hover:bg-sand/10"
          >
            למדו עוד
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 animate-bounce" aria-hidden="true">
        <svg
          className="h-8 w-8 text-sand"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
