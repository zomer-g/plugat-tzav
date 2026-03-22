import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getSiteContent, updateSiteContent } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getSiteContent());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Validate that body contains at least one valid section
  const validSections = ["hero", "about", "impact", "donation", "contact", "navbar", "footer", "timeline", "gallery"];
  const providedSections = Object.keys(body).filter((k) => validSections.includes(k));

  if (providedSections.length === 0) {
    return NextResponse.json({ error: "No valid sections provided" }, { status: 400 });
  }

  const updated = updateSiteContent(body);
  return NextResponse.json(updated);
}
