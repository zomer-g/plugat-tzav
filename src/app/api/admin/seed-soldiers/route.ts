import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getSoldiers, createSoldier } from "@/lib/db";

function convertDate(ddmmyyyy: string): string {
  if (!ddmmyyyy || !ddmmyyyy.trim()) return "";
  const parts = ddmmyyyy.trim().split("/");
  if (parts.length !== 3) return "";
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

// DELETE: Clear all soldiers
export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const fs = await import("fs");
    const path = await import("path");
    const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
    const filePath = path.join(DATA_DIR, "soldiers.json");
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
    }
    return NextResponse.json({ message: "All soldiers deleted." });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST: Import soldiers from CSV data sent in request body
// Body: { rows: [["name","personalId","role","phone","email","region","city","address","birthDate","serviceEndDate","unitJoinDate"], ...] }
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { rows } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data provided. Send { rows: [[...], ...] }" }, { status: 400 });
    }

    const existing = getSoldiers();
    const seen = new Set<string>(existing.map((s) => s.personalId));
    let count = 0;

    for (const row of rows) {
      if (!Array.isArray(row) || row.length < 3) continue;
      const [name, personalId, role, phone, email, region, city, address, birthDate, serviceEndDate, unitJoinDate] = row.map((v: unknown) => String(v || "").trim());

      if (!name || !personalId || seen.has(personalId)) continue;
      seen.add(personalId);

      createSoldier({
        name: name.slice(0, 100),
        personalId: personalId.slice(0, 20),
        role: (role || "").slice(0, 50),
        phone: (phone || "").slice(0, 20) || undefined,
        email: (email || "").toLowerCase().slice(0, 200) || undefined,
        region: (region || "").slice(0, 100) || undefined,
        city: (city || "").slice(0, 100) || undefined,
        address: (address || "").slice(0, 200) || undefined,
        birthDate: convertDate(birthDate || "") || undefined,
        serviceEndDate: convertDate(serviceEndDate || "") || undefined,
        unitJoinDate: convertDate(unitJoinDate || "") || undefined,
      });
      count++;
    }

    return NextResponse.json({ message: `Imported ${count} soldiers successfully.` }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
