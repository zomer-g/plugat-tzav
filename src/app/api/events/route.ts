import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEvents, canUserAccessPage } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email || null;

  // Check if user can access events page
  if (!canUserAccessPage(email, "events")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = getEvents();
  // Sort by start date descending
  events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  return NextResponse.json(events);
}
