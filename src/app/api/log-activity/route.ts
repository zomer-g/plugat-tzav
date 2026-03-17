import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, logActivity } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: true }); // silently skip for non-logged-in users
  }

  const user = getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ ok: true });

  const { page } = await req.json();
  if (!page || typeof page !== "string") {
    return NextResponse.json({ error: "Missing page" }, { status: 400 });
  }

  logActivity({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    page: String(page).slice(0, 500),
  });

  return NextResponse.json({ ok: true });
}
