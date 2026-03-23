import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserByEmail,
  getSoldiers,
  createSoldier,
  updateSoldier,
  deleteSoldier,
} from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(getSoldiers());
  } catch (error) {
    console.error("GET soldiers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, personalId, role, phone, email, region, city, address, birthDate, serviceEndDate, unitJoinDate, coordinates } = body;

    if (!name || !personalId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const soldier = createSoldier({
      name: String(name).slice(0, 200),
      personalId: String(personalId).slice(0, 20),
      role: String(role).slice(0, 100),
      phone: phone ? String(phone).slice(0, 20) : undefined,
      email: email ? String(email).toLowerCase().slice(0, 200) : undefined,
      region: region ? String(region).slice(0, 100) : undefined,
      city: city ? String(city).slice(0, 100) : undefined,
      address: address ? String(address).slice(0, 300) : undefined,
      birthDate: birthDate ? String(birthDate) : undefined,
      serviceEndDate: serviceEndDate ? String(serviceEndDate) : undefined,
      unitJoinDate: unitJoinDate ? String(unitJoinDate) : undefined,
      coordinates: coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number"
        ? { lat: coordinates.lat, lng: coordinates.lng }
        : undefined,
    });

    return NextResponse.json(soldier, { status: 201 });
  } catch (error) {
    console.error("POST soldier error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing soldier id" }, { status: 400 });

    // Sanitize
    if (updates.name) updates.name = String(updates.name).slice(0, 200);
    if (updates.personalId) updates.personalId = String(updates.personalId).slice(0, 20);
    if (updates.role) updates.role = String(updates.role).slice(0, 100);
    if (updates.phone) updates.phone = String(updates.phone).slice(0, 20);
    if (updates.email) updates.email = String(updates.email).toLowerCase().slice(0, 200);
    if (updates.region) updates.region = String(updates.region).slice(0, 100);
    if (updates.city) updates.city = String(updates.city).slice(0, 100);
    if (updates.address) updates.address = String(updates.address).slice(0, 300);

    const soldier = updateSoldier(id, updates);
    if (!soldier) return NextResponse.json({ error: "Soldier not found" }, { status: 404 });

    return NextResponse.json(soldier);
  } catch (error) {
    console.error("PATCH soldier error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing soldier id" }, { status: 400 });

    const ok = deleteSoldier(id);
    if (!ok) return NextResponse.json({ error: "Soldier not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE soldier error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
