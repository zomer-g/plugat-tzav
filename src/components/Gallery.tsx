import { getAllUpdates } from "@/lib/markdown";
import UpdateCard from "./UpdateCard";
import type { SiteContent } from "@/lib/db";

export default function Gallery({ content }: { content: SiteContent["gallery"] }) {
  const updates = getAllUpdates();

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          id="gallery-heading"
          className="mb-4 text-center text-3xl font-bold text-sand md:text-4xl"
        >
          {content.title}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-gray-200">
          {content.subtitle}
        </p>

        {updates.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {updates.map((update) => (
              <UpdateCard key={update.slug} update={update} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-300">
            עדכונים חדשים בקרוב...
          </p>
        )}
      </div>
    </section>
  );
}
