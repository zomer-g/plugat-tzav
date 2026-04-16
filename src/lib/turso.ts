import { createClient, type Client } from "@libsql/client";

// Turso client — mirrors JSON file storage
// The filesystem remains the primary read source (synchronous, fast).
// Turso is a persistent backup that survives ephemeral filesystems (Render Free).
// On app boot, instrumentation.ts restores filesystem from Turso.
// On every write, we mirror to Turso asynchronously (fire-and-forget).

let _client: Client | null = null;
let _schemaReady = false;

export function isTursoEnabled(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

export function getTursoClient(): Client | null {
  if (!isTursoEnabled()) return null;
  if (_client) return _client;

  try {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    return _client;
  } catch (err) {
    console.error("[Turso] Client init error:", err);
    return null;
  }
}

export async function ensureSchema(): Promise<void> {
  if (_schemaReady) return;
  const client = getTursoClient();
  if (!client) return;
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS json_storage (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    _schemaReady = true;
  } catch (err) {
    console.error("[Turso] Schema init error:", err);
  }
}

/**
 * Read a JSON blob from Turso by filename. Returns null if not found or error.
 */
export async function readFromTurso(filename: string): Promise<string | null> {
  const client = getTursoClient();
  if (!client) return null;

  try {
    await ensureSchema();
    const result = await client.execute({
      sql: "SELECT value FROM json_storage WHERE key = ?",
      args: [filename],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0].value as string;
  } catch (err) {
    console.error(`[Turso] Read error for ${filename}:`, err);
    return null;
  }
}

/**
 * Write a JSON blob to Turso (upsert). Fire-and-forget — errors are logged but not thrown.
 */
export async function writeToTurso(filename: string, value: string): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await ensureSchema();
    await client.execute({
      sql: `INSERT INTO json_storage (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              updated_at = excluded.updated_at`,
      args: [filename, value, new Date().toISOString()],
    });
  } catch (err) {
    console.error(`[Turso] Write error for ${filename}:`, err);
  }
}

/**
 * List all keys (filenames) stored in Turso.
 */
export async function listTursoKeys(): Promise<string[]> {
  const client = getTursoClient();
  if (!client) return [];

  try {
    await ensureSchema();
    const result = await client.execute("SELECT key FROM json_storage");
    return result.rows.map((r) => r.key as string);
  } catch (err) {
    console.error("[Turso] List keys error:", err);
    return [];
  }
}
