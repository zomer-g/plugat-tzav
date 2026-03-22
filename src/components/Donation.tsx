import type { SiteContent } from "@/lib/db";

export default function Donation({ content }: { content: SiteContent["donation"] }) {
  const links = content.paymentLinks?.filter((l) => l.url) || [];
  const fallbackUrl = process.env.NEXT_PUBLIC_DONATION_URL || "#";

  return (
    <section id="donate" aria-labelledby="donate-heading" className="py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div className="rounded-2xl bg-gradient-to-b from-olive-dark to-dark-surface p-12 md:p-16">
          <h2
            id="donate-heading"
            className="mb-6 text-3xl font-bold text-white md:text-4xl"
          >
            {content.title}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-200">
            {content.text}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
            {links.length > 0 ? (
              links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-full px-10 py-4 text-lg font-bold transition-all ${
                    idx === 0
                      ? "bg-sand text-dark-bg hover:bg-sand-light hover:shadow-lg hover:shadow-sand/20"
                      : "border-2 border-sand/40 text-sand hover:border-sand hover:bg-sand/10"
                  }`}
                  aria-label={`${link.label} (נפתח בחלון חדש)`}
                >
                  {link.icon && <span className="me-2">{link.icon}</span>}
                  {link.label}
                </a>
              ))
            ) : (
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-sand px-10 py-4 text-lg font-bold text-dark-bg transition-all hover:bg-sand-light hover:shadow-lg hover:shadow-sand/20"
                aria-label={`${content.buttonText} (נפתח בחלון חדש)`}
              >
                {content.buttonText}
              </a>
            )}
            <a
              href="#contact"
              className="rounded-full border-2 border-sand/40 px-10 py-4 text-lg font-bold text-sand transition-colors hover:border-sand hover:bg-sand/10"
            >
              {content.secondaryButtonText}
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-300">
            {content.taxNote}
          </p>
        </div>
      </div>
    </section>
  );
}
