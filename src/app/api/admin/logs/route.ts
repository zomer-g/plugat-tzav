import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getActivityLogs, clearActivityLogs } from "@/lib/db";

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
  const logs = getActivityLogs();
  // Return newest first
  return NextResponse.json(logs.reverse());
}

export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  clearActivityLogs();
  return NextResponse.json({ success: true });
}
