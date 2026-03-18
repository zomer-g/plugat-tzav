import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getPrivacyPolicy, createPolicyVersion } from "@/lib/db";

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
  return NextResponse.json(getPrivacyPolicy());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { text } = body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Policy text is required" }, { status: 400 });
  }

  if (text.length > 50000) {
    return NextResponse.json({ error: "Policy text too long (max 50000 chars)" }, { status: 400 });
  }

  const version = createPolicyVersion(text.trim(), admin.id);
  return NextResponse.json(version, { status: 201 });
}
