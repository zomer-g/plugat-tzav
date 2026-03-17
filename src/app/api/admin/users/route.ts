import { auth } from "@/lib/auth";
import { getUserByEmail, getUsers, updateUser, deleteUser } from "@/lib/db";
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

  return NextResponse.json(getUsers());
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

  // Prevent removing own admin role
  if (id === admin.id && updates.role && updates.role !== "admin") {
    return NextResponse.json(
      { error: "לא ניתן להסיר את תפקיד המנהל מעצמך" },
      { status: 400 }
    );
  }

  // Validate groups is an array of strings
  if (updates.groups && !Array.isArray(updates.groups)) {
    return NextResponse.json({ error: "Invalid groups format" }, { status: 400 });
  }

  const updated = updateUser(id, updates);
  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

  // Prevent self-deletion
  if (id === admin.id) {
    return NextResponse.json(
      { error: "לא ניתן למחוק את עצמך" },
      { status: 400 }
    );
  }

  const deleted = deleteUser(id);
  if (!deleted) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
