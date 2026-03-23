import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getUpdates, createUpdate, updateUpdate, deleteUpdate } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(getUpdates());
  } catch (err) {
    console.error("GET /api/admin/updates error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, date, excerpt, content, coverImage, tags } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const update = createUpdate({
      title: title.trim().slice(0, 200),
      date,
      excerpt: (excerpt || "").trim().slice(0, 500),
      content: (content || "").trim().slice(0, 50000),
      coverImage: coverImage ? String(coverImage).trim().slice(0, 500) : undefined,
      tags: Array.isArray(tags) ? tags.map((t: unknown) => String(t).trim().slice(0, 50)).slice(0, 20) : [],
    });

    return NextResponse.json(update, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/updates error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Missing update ID" }, { status: 400 });

    if (updates.title) updates.title = String(updates.title).trim().slice(0, 200);
    if (updates.excerpt) updates.excerpt = String(updates.excerpt).trim().slice(0, 500);
    if (updates.content) updates.content = String(updates.content).trim().slice(0, 50000);
    if (updates.coverImage) updates.coverImage = String(updates.coverImage).trim().slice(0, 500);
    if (updates.tags) updates.tags = (updates.tags as unknown[]).map((t: unknown) => String(t).trim().slice(0, 50)).slice(0, 20);

    const updated = updateUpdate(id, updates);
    if (!updated) return NextResponse.json({ error: "Update not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/admin/updates error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Missing update ID" }, { status: 400 });

    const deleted = deleteUpdate(id);
    if (!deleted) return NextResponse.json({ error: "Update not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/updates error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
