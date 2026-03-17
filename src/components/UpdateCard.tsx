import Link from "next/link";
import type { UpdateMeta } from "@/lib/types";

export default function UpdateCard({ update }: { update: UpdateMeta }) {
  return (
    <Link
      href={`/updates/${update.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-mil/20 bg-dark-card transition-all hover:border-olive hover:shadow-lg hover:shadow-olive/10"
    >
      {update.coverImage && (
        <div className="aspect-video overflow-hidden bg-dark-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={update.coverImage}
            alt={update.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <time className="text-sm text-gray-300">
          {new Date(update.date).toLocaleDateString("he-IL")}
        </time>
        <h3 className="mt-2 text-lg font-bold text-white group-hover:text-sand">
          {update.title}
        </h3>
        <p className="mt-2 text-sm text-gray-200">
          {update.excerpt}
        </p>
        {update.tags && (
          <div className="mt-3 flex flex-wrap gap-2">
            {update.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-olive/20 px-3 py-1 text-xs text-olive-light"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
