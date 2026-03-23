import type { SiteContent } from "@/lib/db";

export default function Timeline({ content }: { content: SiteContent["timeline"] }) {
  return (
    <section id="timeline" aria-labelledby="timeline-heading" className="bg-dark-surface py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2
          id="timeline-heading"
          className="mb-4 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          {content.title}
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-gray-200">
          {content.subtitle}
        </p>

        {/* Mobile: simple vertical layout */}
        <div className="md:hidden space-y-6">
          {content.entries.map((entry, i) => (
            <div key={i} className="rounded-xl border border-olive/20 bg-dark-card p-6">
              <span className="text-sm font-bold text-olive-light">{entry.date}</span>
              <h3 className="mt-1 text-lg font-bold text-white">{entry.title}</h3>
              <p className="mt-2 text-sm text-gray-200">{entry.description}</p>
            </div>
          ))}
        </div>

        {/* Desktop: centered timeline */}
        <div className="relative hidden md:block">
          {/* Center line */}
          <div
            className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-olive/30"
            aria-hidden="true"
          />

          {content.entries.map((entry, i) => {
            const isRight = i % 2 === 0;
            return (
              <div key={i} className="relative mb-12 flex items-center">
                {/* Dot on center line */}
                <div
                  className="absolute left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-olive bg-dark-bg"
                  aria-hidden="true"
                />

                {isRight ? (
                  <>
                    {/* Left half: empty */}
                    <div className="w-1/2" />
                    {/* Right half: card touching the line */}
                    <div className="w-1/2 pr-8">
                      <div className="rounded-xl border border-olive/20 bg-dark-card p-6">
                        <span className="text-sm font-bold text-olive-light">{entry.date}</span>
                        <h3 className="mt-1 text-lg font-bold text-white">{entry.title}</h3>
                        <p className="mt-2 text-sm text-gray-200">{entry.description}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left half: card touching the line */}
                    <div className="w-1/2 pl-8">
                      <div className="rounded-xl border border-olive/20 bg-dark-card p-6">
                        <span className="text-sm font-bold text-olive-light">{entry.date}</span>
                        <h3 className="mt-1 text-lg font-bold text-white">{entry.title}</h3>
                        <p className="mt-2 text-sm text-gray-200">{entry.description}</p>
                      </div>
                    </div>
                    {/* Right half: empty */}
                    <div className="w-1/2" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
