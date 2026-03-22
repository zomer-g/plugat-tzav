import type { SiteContent } from "@/lib/db";

export default function Timeline({ content }: { content: SiteContent["timeline"] }) {
  return (
    <section id="timeline" aria-labelledby="timeline-heading" className="bg-dark-surface py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2
          id="timeline-heading"
          className="mb-4 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          {content.title}
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-gray-200">
          {content.subtitle}
        </p>

        <div className="relative">
          <div
            className="absolute top-0 bottom-0 right-1/2 w-0.5 -translate-x-1/2 bg-olive/30"
            aria-hidden="true"
          />

          {content.entries.map((entry, i) => (
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
