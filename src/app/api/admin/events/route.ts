import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserByEmail,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/db";
import type { EventType } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

const VALID_TYPES: EventType[] = ["training", "operational", "social", "uniform"];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getEvents());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, type, startDate, endDate, location, coordinates, description, albumUrl } = body;

  if (!title || !type || !startDate || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const event = createEvent({
    title: String(title).slice(0, 200),
    type,
    startDate: String(startDate),
    endDate: endDate ? String(endDate) : undefined,
    location: String(location).slice(0, 200),
    coordinates: coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number"
      ? { lat: coordinates.lat, lng: coordinates.lng }
      : undefined,
    description: description ? String(description).slice(0, 2000) : undefined,
    albumUrl: albumUrl ? String(albumUrl).slice(0, 500) : undefined,
  });

  return NextResponse.json(event, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing event id" }, { status: 400 });

  if (updates.type && !VALID_TYPES.includes(updates.type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  // Sanitize
  if (updates.title) updates.title = String(updates.title).slice(0, 200);
  if (updates.location) updates.location = String(updates.location).slice(0, 200);
  if (updates.description) updates.description = String(updates.description).slice(0, 2000);
  if (updates.albumUrl) updates.albumUrl = String(updates.albumUrl).slice(0, 500);

  const event = updateEvent(id, updates);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing event id" }, { status: 400 });

  const ok = deleteEvent(id);
  if (!ok) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
