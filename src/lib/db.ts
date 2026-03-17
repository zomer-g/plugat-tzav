import fs from "fs";
import path from "path";

// Simple JSON file-based database — no external DB needed
// Data stored in data/users.json and data/groups.json and data/page-access.json

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  email: string;
  name: string;
  image: string;
  role: "admin" | "member";
  groups: string[];
  active: boolean;
  createdAt: string;
}

export interface DbGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export type PageAccessLevel = "public" | "members" | "groups";

export interface PageAccess {
  pageId: string; // e.g. "members", "updates/summer-training-2024"
  label: string;
  level: PageAccessLevel;
  allowedGroups: string[]; // group IDs (only relevant when level === "groups")
}

// ─── File helpers ────────────────────────────────────────────────────────

function readJson<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJson(filename, fallback);
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Default data ────────────────────────────────────────────────────────

const DEFAULT_GROUPS: DbGroup[] = [
  {
    id: "commanders",
    name: "מפקדים",
    description: "מפקדי הפלוגה",
    color: "#556B2F",
    createdAt: new Date().toISOString(),
  },
  {
    id: "soldiers",
    name: "לוחמים",
    description: "חיילי הפלוגה",
    color: "#708090",
    createdAt: new Date().toISOString(),
  },
  {
    id: "families",
    name: "משפחות",
    description: "בני משפחה",
    color: "#D4C89A",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_PAGE_ACCESS: PageAccess[] = [
  {
    pageId: "members",
    label: "אזור אישי — דף ראשי",
    level: "members",
    allowedGroups: [],
  },
  {
    pageId: "members/documents",
    label: "מסמכים",
    level: "members",
    allowedGroups: [],
  },
  {
    pageId: "members/gallery",
    label: "גלריה פנימית",
    level: "members",
    allowedGroups: [],
  },
];

// ─── Users ───────────────────────────────────────────────────────────────

export function getUsers(): DbUser[] {
  return readJson<DbUser[]>("users.json", []);
}

export function getUserByEmail(email: string): DbUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): DbUser | undefined {
  return getUsers().find((u) => u.id === id);
}

export function createUser(data: {
  email: string;
  name: string;
  image: string;
}): DbUser {
  const users = getUsers();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const isFirstUser = users.length === 0;
  const isAdmin =
    isFirstUser || data.email.toLowerCase() === adminEmail;

  const user: DbUser = {
    id: crypto.randomUUID(),
    email: data.email,
    name: data.name,
    image: data.image,
    role: isAdmin ? "admin" : "member",
    groups: [],
    active: true,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeJson("users.json", users);
  return user;
}

export function updateUser(
  id: string,
  updates: Partial<Pick<DbUser, "role" | "groups" | "active" | "name">>
): DbUser | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  writeJson("users.json", users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  writeJson("users.json", filtered);
  return true;
}

// ─── Groups ──────────────────────────────────────────────────────────────

export function getGroups(): DbGroup[] {
  return readJson<DbGroup[]>("groups.json", DEFAULT_GROUPS);
}

export function getGroupById(id: string): DbGroup | undefined {
  return getGroups().find((g) => g.id === id);
}

export function createGroup(data: {
  name: string;
  description: string;
  color: string;
}): DbGroup {
  const groups = getGroups();
  const group: DbGroup = {
    id: data.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF]/g, "-")
      .replace(/-+/g, "-"),
    name: data.name,
    description: data.description,
    color: data.color,
    createdAt: new Date().toISOString(),
  };
  groups.push(group);
  writeJson("groups.json", groups);
  return group;
}

export function updateGroup(
  id: string,
  updates: Partial<Pick<DbGroup, "name" | "description" | "color">>
): DbGroup | null {
  const groups = getGroups();
  const idx = groups.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  groups[idx] = { ...groups[idx], ...updates };
  writeJson("groups.json", groups);
  return groups[idx];
}

export function deleteGroup(id: string): boolean {
  const groups = getGroups();
  const filtered = groups.filter((g) => g.id !== id);
  if (filtered.length === groups.length) return false;
  writeJson("groups.json", filtered);

  // Remove group from all users
  const users = getUsers();
  let changed = false;
  for (const user of users) {
    if (user.groups.includes(id)) {
      user.groups = user.groups.filter((g) => g !== id);
      changed = true;
    }
  }
  if (changed) writeJson("users.json", users);

  // Remove group from page access
  const pages = getPageAccess();
  let pagesChanged = false;
  for (const page of pages) {
    if (page.allowedGroups.includes(id)) {
      page.allowedGroups = page.allowedGroups.filter((g) => g !== id);
      pagesChanged = true;
    }
  }
  if (pagesChanged) writeJson("page-access.json", pages);

  return true;
}

// ─── Page Access ─────────────────────────────────────────────────────────

export function getPageAccess(): PageAccess[] {
  return readJson<PageAccess[]>("page-access.json", DEFAULT_PAGE_ACCESS);
}

export function getPageAccessByPageId(pageId: string): PageAccess | undefined {
  return getPageAccess().find((p) => p.pageId === pageId);
}

export function setPageAccess(pageAccess: PageAccess): void {
  const all = getPageAccess();
  const idx = all.findIndex((p) => p.pageId === pageAccess.pageId);
  if (idx === -1) {
    all.push(pageAccess);
  } else {
    all[idx] = pageAccess;
  }
  writeJson("page-access.json", all);
}

export function removePageAccess(pageId: string): boolean {
  const all = getPageAccess();
  const filtered = all.filter((p) => p.pageId !== pageId);
  if (filtered.length === all.length) return false;
  writeJson("page-access.json", filtered);
  return true;
}

// ─── Access Check ────────────────────────────────────────────────────────

export function canUserAccessPage(
  userEmail: string | null | undefined,
  pageId: string
): boolean {
  const access = getPageAccessByPageId(pageId);

  // If no access rule defined, page is public
  if (!access) return true;

  // Public pages are always accessible
  if (access.level === "public") return true;

  // From here, user must be logged in
  if (!userEmail) return false;

  const user = getUserByEmail(userEmail);
  if (!user || !user.active) return false;

  // Admins always have access
  if (user.role === "admin") return true;

  // "members" level — any active member
  if (access.level === "members") return true;

  // "groups" level — user must be in one of the allowed groups
  if (access.level === "groups") {
    return access.allowedGroups.some((g) => user.groups.includes(g));
  }

  return false;
}
