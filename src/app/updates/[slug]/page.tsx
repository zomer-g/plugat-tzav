import { notFound } from "next/navigation";
import Link from "next/link";
import { getUpdateBySlug as getMdUpdate, getUpdateSlugs } from "@/lib/markdown";
import { getUpdateBySlug as getDbUpdate, getUpdates } from "@/lib/db";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import type { Update } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  const mdSlugs = getUpdateSlugs().map((slug) => ({ slug }));
  const dbSlugs = getUpdates().map((u) => ({ slug: u.slug }));
  return [...mdSlugs, ...dbSlugs];
}

async function resolveUpdate(slug: string): Promise<Update | null> {
  // Try markdown first
  try {
    return await getMdUpdate(slug);
  } catch {
    // noop
  }
  // Try DB
  const dbUpdate = getDbUpdate(slug);
  if (dbUpdate) {
    const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: true }).process(dbUpdate.content || "");
    return {
      slug: dbUpdate.slug,
      title: dbUpdate.title,
      date: dbUpdate.date,
      excerpt: dbUpdate.excerpt,
      coverImage: dbUpdate.coverImage,
      tags: dbUpdate.tags,
      htmlContent: processed.toString(),
    };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const update = await resolveUpdate(slug);
  if (!update) return { title: "לא נמצא | פלוגת צב" };
  return {
    title: `${update.title} | פלוגת צב`,
    description: update.excerpt,
  };
}

export default async function UpdatePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const update = await resolveUpdate(slug);
  if (!update) notFound();

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
