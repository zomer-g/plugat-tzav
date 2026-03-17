import { auth } from "@/lib/auth";
import {
  getUserByEmail,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
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

  return NextResponse.json(getGroups());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { name, description, color } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "שם הקבוצה הוא שדה חובה" }, { status: 400 });
  }

  const group = createGroup({
    name: name.trim(),
    description: description?.trim() || "",
    color: color || "#556B2F",
  });

  return NextResponse.json(group, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Missing group ID" }, { status: 400 });

  const updated = updateGroup(id, updates);
  if (!updated) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing group ID" }, { status: 400 });

  const deleted = deleteGroup(id);
  if (!deleted) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
