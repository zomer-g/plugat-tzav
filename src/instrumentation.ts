// Next.js instrumentation — runs once when the server starts.
// If Turso is configured, this restores all JSON files from Turso to the
// local filesystem. This makes the app work on ephemeral filesystems
// (like Render Free tier) while keeping all reads synchronous and fast.

export async function register() {
  // Only run on Node.js runtime (not edge)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.log("[instrumentation] Turso not configured, skipping restore");
    return;
  }

  try {
    const fs = await import("fs");
    const path = await import("path");
    const { createClient } = await import("@libsql/client");

    const DATA_DIR =
      process.env.DATA_DIR || path.join(process.cwd(), "data");

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const client = createClient({ url: tursoUrl, authToken: tursoToken });

    // Ensure schema exists
    await client.execute(`
      CREATE TABLE IF NOT EXISTS json_storage (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Restore all keys to filesystem
    const result = await client.execute(
      "SELECT key, value FROM json_storage"
    );
    let restored = 0;
    for (const row of result.rows) {
      const key = row.key as string;
      const value = row.value as string;
      // Only restore simple filenames (prevent path traversal)
      if (!/^[a-zA-Z0-9_-]+\.json$/.test(key)) continue;
      const filePath = path.join(DATA_DIR, key);
      fs.writeFileSync(filePath, value, "utf-8");
      restored++;
    }
    console.log(`[instrumentation] Restored ${restored} JSON files from Turso`);
  } catch (err) {
    console.error("[instrumentation] Turso restore failed:", err);
  }
}
