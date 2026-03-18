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
  // Onboarding profile (optional, filled during onboarding)
  phone?: string;
  relationToPlugah?: string;
  agreeToMailings?: boolean;
  // Privacy policy consent
  consentVersion?: number;
  consentDate?: string;
  // Admin-only internal category (invisible to user)
  internalCategory?: string;
}

export interface PrivacyPolicyVersion {
  version: number;
  text: string;
  createdAt: string;
  createdBy: string; // admin user ID
}

export interface PrivacyPolicyData {
  currentVersion: number;
  versions: PrivacyPolicyVersion[];
}

export interface DbGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export type EventType = "training" | "operational" | "social" | "uniform";

export interface DbEvent {
  id: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  description?: string;
  albumUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  page: string;
  timestamp: string;
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
  {
    pageId: "events",
    label: "אירועי הפלוגה — תצוגה",
    level: "public",
    allowedGroups: [],
  },
  {
    pageId: "admin/events",
    label: "ניהול אירועים",
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
  updates: Partial<Pick<DbUser, "role" | "groups" | "active" | "name" | "phone" | "relationToPlugah" | "agreeToMailings" | "consentVersion" | "consentDate" | "internalCategory">>
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

// ─── Events ──────────────────────────────────────────────────────────────

export function getEvents(): DbEvent[] {
  return readJson<DbEvent[]>("events.json", []);
}

export function getEventById(id: string): DbEvent | undefined {
  return getEvents().find((e) => e.id === id);
}

export function createEvent(data: Omit<DbEvent, "id" | "createdAt" | "updatedAt">): DbEvent {
  const events = getEvents();
  const event: DbEvent = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.push(event);
  writeJson("events.json", events);
  return event;
}

export function updateEvent(
  id: string,
  updates: Partial<Omit<DbEvent, "id" | "createdAt">>
): DbEvent | null {
  const events = getEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJson("events.json", events);
  return events[idx];
}

export function deleteEvent(id: string): boolean {
  const events = getEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return false;
  writeJson("events.json", filtered);
  return true;
}

// ─── Activity Log ────────────────────────────────────────────────────────

export function getActivityLogs(): ActivityLog[] {
  return readJson<ActivityLog[]>("activity-log.json", []);
}

export function logActivity(data: { userId: string; userEmail: string; userName: string; page: string }): void {
  const logs = getActivityLogs();
  logs.push({
    id: crypto.randomUUID(),
    ...data,
    timestamp: new Date().toISOString(),
  });
  // Keep last 10000 entries to prevent unlimited growth
  const trimmed = logs.slice(-10000);
  writeJson("activity-log.json", trimmed);
}

export function getActivityLogsByUser(userId: string): ActivityLog[] {
  return getActivityLogs().filter((l) => l.userId === userId);
}

export function clearActivityLogs(): void {
  writeJson("activity-log.json", []);
}

// ─── Privacy Policy ─────────────────────────────────────────────────────

export function getPrivacyPolicy(): PrivacyPolicyData {
  return readJson<PrivacyPolicyData>("privacy-policy.json", {
    currentVersion: 0,
    versions: [],
  });
}

export function getCurrentPolicyVersion(): PrivacyPolicyVersion | null {
  const policy = getPrivacyPolicy();
  if (policy.currentVersion === 0) return null;
  return policy.versions.find((v) => v.version === policy.currentVersion) || null;
}

export function createPolicyVersion(text: string, adminId: string): PrivacyPolicyVersion {
  const policy = getPrivacyPolicy();
  const newVersion: PrivacyPolicyVersion = {
    version: policy.currentVersion + 1,
    text,
    createdAt: new Date().toISOString(),
    createdBy: adminId,
  };
  policy.versions.push(newVersion);
  policy.currentVersion = newVersion.version;
  writeJson("privacy-policy.json", policy);
  return newVersion;
}

export function hasUserConsented(userId: string): boolean {
  const user = getUserById(userId);
  if (!user) return false;
  const policy = getPrivacyPolicy();
  if (policy.currentVersion === 0) return true; // No policy = no consent needed
  return user.consentVersion === policy.currentVersion;
}

export function recordConsent(
  userId: string,
  version: number,
  profileData: {
    name?: string;
    phone?: string;
    relationToPlugah?: string;
    agreeToMailings?: boolean;
  }
): DbUser | null {
  return updateUser(userId, {
    consentVersion: version,
    consentDate: new Date().toISOString(),
    name: profileData.name || undefined,
    phone: profileData.phone || undefined,
    relationToPlugah: profileData.relationToPlugah || undefined,
    agreeToMailings: profileData.agreeToMailings ?? false,
  });
}
