import { notFound } from "next/navigation";
import Link from "next/link";
import { getUpdateBySlug, getUpdateSlugs } from "@/lib/markdown";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getUpdateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const update = await getUpdateBySlug(slug);
    return {
      title: `${update.title} | פלוגת צב`,
      description: update.excerpt,
    };
  } catch {
    return { title: "לא נמצא | פלוגת צב" };
  }
}

export default async function UpdatePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  let update;
  try {
    update = await getUpdateBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="border-b border-slate-mil/20 bg-dark-surface">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-4">
          <Link
            href="/#gallery"
            className="text-sm text-sand transition-colors hover:text-sand-light"
            aria-label="חזרה לעמוד הראשי"
          >
            <span aria-hidden="true">← </span>
            חזרה לעמוד הראשי
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-12">
        {update.coverImage && (
          <div className="mb-8 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={update.coverImage}
              alt={update.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <time className="text-sm text-gray-300">
          {new Date(update.date).toLocaleDateString("he-IL")}
        </time>
        <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
          {update.title}
        </h1>

        {update.tags && (
          <div className="mt-4 flex flex-wrap gap-2">
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

        <div
          className="prose-rtl prose prose-invert mt-8 max-w-none prose-headings:text-sand prose-a:text-olive-light prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: update.htmlContent }}
        />
      </article>
    </div>
  );
}
