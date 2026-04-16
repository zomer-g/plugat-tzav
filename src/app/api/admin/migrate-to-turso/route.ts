import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { writeToTurso, isTursoEnabled, listTursoKeys } from "@/lib/turso";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

/**
 * GET — returns status: is Turso configured? How many files in Turso vs filesystem?
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
  const fsFiles = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))
    : [];

  if (!isTursoEnabled()) {
    return NextResponse.json({
      tursoEnabled: false,
      filesystemFiles: fsFiles,
      message: "Turso is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.",
    });
  }

  const tursoKeys = await listTursoKeys();
  return NextResponse.json({
    tursoEnabled: true,
    filesystemFiles: fsFiles,
    tursoKeys,
    inFsButNotTurso: fsFiles.filter((f) => !tursoKeys.includes(f)),
    inTursoButNotFs: tursoKeys.filter((k) => !fsFiles.includes(k)),
  });
}

/**
 * POST — migrates all JSON files from filesystem to Turso.
 * This is the one-time migration step. Overwrites any existing Turso data.
 */
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isTursoEnabled()) {
    return NextResponse.json(
      {
        error:
          "Turso is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars in Render.",
      },
      { status: 400 }
    );
  }

  try {
    const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
    if (!fs.existsSync(DATA_DIR)) {
      return NextResponse.json(
        { error: "Data directory does not exist", path: DATA_DIR },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
    const results: { file: string; size: number; status: "ok" | "error"; error?: string }[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(DATA_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");
        await writeToTurso(file, content);
        results.push({ file, size: content.length, status: "ok" });
      } catch (err) {
        results.push({
          file,
          size: 0,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const okCount = results.filter((r) => r.status === "ok").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      success: true,
      migrated: okCount,
      failed: errorCount,
      totalSize: results.reduce((sum, r) => sum + r.size, 0),
      results,
    });
  } catch (err) {
    console.error("[migrate-to-turso] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
