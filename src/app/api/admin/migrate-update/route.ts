import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, createUpdate } from "@/lib/db";
import { getRawMarkdownUpdate, deleteMarkdownUpdate } from "@/lib/markdown";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

// POST: Migrate a markdown update to DB (and optionally delete the file)
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug, deleteFile } = body;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const { meta, content } = getRawMarkdownUpdate(slug);

    // Create in DB
    const dbUpdate = createUpdate({
      title: meta.title,
      date: meta.date,
      excerpt: meta.excerpt,
      content,
      coverImage: meta.coverImage,
      tags: meta.tags,
    });

    // Optionally delete the markdown file
    if (deleteFile) {
      deleteMarkdownUpdate(slug);
    }

    return NextResponse.json({ dbUpdate, deleted: !!deleteFile });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 400 }
    );
  }
}

// DELETE: Just delete a markdown file without migrating
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug } = body;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const deleted = deleteMarkdownUpdate(slug);
    if (!deleted) return NextResponse.json({ error: "File not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 400 }
    );
  }
}
