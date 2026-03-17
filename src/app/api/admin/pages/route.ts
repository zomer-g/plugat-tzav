import { auth } from "@/lib/auth";
import {
  getUserByEmail,
  getPageAccess,
  setPageAccess,
  removePageAccess,
  type PageAccessLevel,
} from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  return NextResponse.json(getPageAccess());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { pageId, label, level, allowedGroups } = body;

  if (!pageId || !label) {
    return NextResponse.json({ error: "pageId and label are required" }, { status: 400 });
  }

  const validLevels: PageAccessLevel[] = ["public", "members", "groups"];
  if (!validLevels.includes(level)) {
    return NextResponse.json({ error: "Invalid access level" }, { status: 400 });
  }

  setPageAccess({
    pageId,
    label,
    level,
    allowedGroups: level === "groups" ? (allowedGroups || []) : [],
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) return NextResponse.json({ error: "Missing pageId" }, { status: 400 });

  const deleted = removePageAccess(pageId);
  if (!deleted) return NextResponse.json({ error: "Page access not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
