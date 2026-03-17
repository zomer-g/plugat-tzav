import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";
import type { Update, UpdateMeta } from "./types";

const updatesDir = path.join(process.cwd(), "content", "updates");

function validateSlug(slug: string): void {
  if (slug !== path.basename(slug) || slug.includes("..")) {
    throw new Error("Invalid slug");
  }
  const resolved = path.resolve(path.join(updatesDir, `${slug}.md`));
  if (!resolved.startsWith(path.resolve(updatesDir))) {
    throw new Error("Invalid slug");
  }
}

function validateCoverImage(coverImage: unknown): string | undefined {
  if (typeof coverImage !== "string") return undefined;
  if (!coverImage.startsWith("/")) return undefined;
  if (coverImage.includes("..")) return undefined;
  return coverImage;
}

export function getUpdateSlugs(): string[] {
  if (!fs.existsSync(updatesDir)) return [];
  return fs
    .readdirSync(updatesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getUpdateMetaBySlug(slug: string): UpdateMeta {
  validateSlug(slug);
  const filePath = path.join(updatesDir, `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(fileContent);

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    excerpt: data.excerpt || "",
    coverImage: validateCoverImage(data.coverImage),
    tags: data.tags,
  };
}

export async function getUpdateBySlug(slug: string): Promise<Update> {
  validateSlug(slug);
  const filePath = path.join(updatesDir, `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const result = await remark()
    .use(gfm)
    .use(html, { sanitize: true })
    .process(content);

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    excerpt: data.excerpt || "",
    coverImage: validateCoverImage(data.coverImage),
    tags: data.tags,
    htmlContent: result.toString(),
  };
}

export function getAllUpdates(): UpdateMeta[] {
  const slugs = getUpdateSlugs();
  return slugs
    .map((slug) => getUpdateMetaBySlug(slug))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}
