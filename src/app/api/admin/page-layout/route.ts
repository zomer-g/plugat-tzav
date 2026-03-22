import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getPageLayout, updatePageLayout } from "@/lib/db";
import type { PageSection } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId") || "main";
  return NextResponse.json(getPageLayout(pageId));
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { pageId, sections } = body;

  if (!pageId || typeof pageId !== "string") {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  if (!Array.isArray(sections)) {
    return NextResponse.json({ error: "sections must be an array" }, { status: 400 });
  }

  // Validate each section
  for (const s of sections) {
    if (!s.id || !s.type || typeof s.enabled !== "boolean" || typeof s.order !== "number") {
      return NextResponse.json({ error: "Invalid section format" }, { status: 400 });
    }
  }

  const layout = updatePageLayout(pageId, sections as PageSection[]);
  return NextResponse.json(layout);
}
