import fs from "fs";
import path from "path";
import { writeToTurso, isTursoEnabled } from "./turso";

// JSON file-based database with optional Turso cloud mirror
// Filesystem is the primary source (synchronous reads, fast).
// If Turso is configured, every write is also mirrored to Turso (fire-and-forget).
// On app boot, instrumentation.ts restores filesystem from Turso if available.
// This allows running on Render Free tier (ephemeral filesystem) with persistence via Turso.

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

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

export interface DbUpdate {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string; // markdown content
  coverImage?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
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

export interface DbSoldier {
  id: string;
  name: string;
  personalId: string;
  role: string;
  phone?: string;
  email?: string;
  region?: string;
  city?: string;
  address?: string;
  birthDate?: string;
  serviceEndDate?: string;
  unitJoinDate?: string;
  coordinates?: { lat: number; lng: number };
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

export interface DbCampaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
  goal: number;
  raised: number;
  currency: string;
  startDate: string;
  endDate?: string;
  paymentLinks: { label: string; url: string; icon: string }[];
  active: boolean;
  shareText?: string;
  createdAt: string;
  updatedAt: string;
}

export type PageAccessLevel = "public" | "members" | "groups";

export interface PageAccess {
  pageId: string; // e.g. "members", "updates/summer-training-2024"
  label: string;
  level: PageAccessLevel;
  allowedGroups: string[]; // group IDs (only relevant when level === "groups")
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    donateButtonText: string;
    learnMoreButtonText: string;
  };
  about: {
    title: string;
    text: string;
    values: { name: string; icon: string; description: string }[];
  };
  impact: {
    title: string;
    subtitle: string;
    stats: { label: string; value: string; icon: string }[];
  };
  donation: {
    title: string;
    text: string;
    buttonText: string;
    secondaryButtonText: string;
    taxNote: string;
    paymentLinks: { label: string; url: string; icon: string }[];
  };
  contact: {
    title: string;
    text: string;
    email: string;
    phoneText: string;
    locationText: string;
  };
  navbar: {
    links: { href: string; label: string }[];
    donateText: string;
    loginText: string;
    membersText: string;
  };
  footer: {
    copyright: string;
    links: { href: string; label: string }[];
  };
  timeline: {
    title: string;
    subtitle: string;
    entries: { date: string; title: string; description: string }[];
  };
  gallery: {
    title: string;
    subtitle: string;
  };
  impactDashboard: {
    title: string;
    subtitle: string;
    totalGoal: number;
    totalRaised: number;
    currency: string;
    categories: { name: string; amount: number; color: string; icon: string }[];
    recentDonations: { name: string; amount: number; date: string; message?: string }[];
    stats: { label: string; value: string; icon: string }[];
  };
}

export interface PageSection {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
}

export interface PageLayout {
  pageId: string;
  sections: PageSection[];
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
  const serialized = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, serialized, "utf-8");

  // Mirror to Turso asynchronously (fire-and-forget)
  // Errors are logged inside writeToTurso but not thrown here.
  if (isTursoEnabled()) {
    writeToTurso(filename, serialized).catch((err) => {
      console.error(`[db] Failed to mirror ${filename} to Turso:`, err);
    });
  }
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
    pageId: "members/battles",
    label: "קרבות בלימה",
    level: "members",
    allowedGroups: [],
  },
  {
    pageId: "members/brigade",
    label: "חטיבה 188",
    level: "members",
    allowedGroups: [],
  },
  {
    pageId: "members/tools",
    label: "כלים שימושיים",
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
  {
    pageId: "members/agenda",
    label: "אג'נדה",
    level: "members",
    allowedGroups: [],
  },
  {
    pageId: "members/soldiers-map",
    label: "מפת חיילים",
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
  const stored = readJson<PageAccess[]>("page-access.json", DEFAULT_PAGE_ACCESS);
  // Auto-merge any new default pages that don't exist in stored data
  let changed = false;
  for (const defaultPage of DEFAULT_PAGE_ACCESS) {
    if (!stored.some((p) => p.pageId === defaultPage.pageId)) {
      stored.push(defaultPage);
      changed = true;
    }
  }
  if (changed) {
    writeJson("page-access.json", stored);
  }
  return stored;
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

// ─── City Coordinates ─────────────────────────────────────────────────────

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "תל אביב-יפו": { lat: 32.0853, lng: 34.7818 },
  "תל אביב": { lat: 32.0853, lng: 34.7818 },
  "ירושלים": { lat: 31.7683, lng: 35.2137 },
  "חיפה": { lat: 32.7940, lng: 34.9896 },
  "באר שבע": { lat: 31.2530, lng: 34.7915 },
  "ראשון לציון": { lat: 31.9730, lng: 34.7925 },
  "פתח תקווה": { lat: 32.0841, lng: 34.8878 },
  "אשדוד": { lat: 31.8014, lng: 34.6435 },
  "נתניה": { lat: 32.3215, lng: 34.8532 },
  "חולון": { lat: 32.0114, lng: 34.7748 },
  "בני ברק": { lat: 32.0834, lng: 34.8340 },
  "רמת גן": { lat: 32.0680, lng: 34.8241 },
  "אשקלון": { lat: 31.6688, lng: 34.5743 },
  "בת ים": { lat: 32.0171, lng: 34.7513 },
  "הרצליה": { lat: 32.1629, lng: 34.8446 },
  "כפר סבא": { lat: 32.1750, lng: 34.9066 },
  "רעננה": { lat: 32.1836, lng: 34.8710 },
  "הוד השרון": { lat: 32.1526, lng: 34.8932 },
  "מודיעין-מכבים-רעות": { lat: 31.8969, lng: 35.0104 },
  "מודיעין": { lat: 31.8969, lng: 35.0104 },
  "רחובות": { lat: 31.8928, lng: 34.8113 },
  "נס ציונה": { lat: 31.9292, lng: 34.7953 },
  "לוד": { lat: 31.9514, lng: 34.8957 },
  "רמלה": { lat: 31.9275, lng: 34.8625 },
  "עפולה": { lat: 32.6087, lng: 35.2917 },
  "נצרת": { lat: 32.6996, lng: 35.3035 },
  "טבריה": { lat: 32.7922, lng: 35.5312 },
  "עכו": { lat: 32.9272, lng: 35.0764 },
  "נהריה": { lat: 33.0064, lng: 35.0982 },
  "קריית שמונה": { lat: 33.2070, lng: 35.5710 },
  "אילת": { lat: 29.5577, lng: 34.9519 },
  "דימונה": { lat: 31.0662, lng: 35.0334 },
  "ערד": { lat: 31.2555, lng: 35.2128 },
  "קריית גת": { lat: 31.6061, lng: 34.7648 },
  "קריית ביאליק": { lat: 32.8328, lng: 35.0839 },
  "קריית מוצקין": { lat: 32.8389, lng: 35.0720 },
  "קריית אתא": { lat: 32.8090, lng: 35.1070 },
  "קריית ים": { lat: 32.8456, lng: 35.0687 },
  "יבנה": { lat: 31.8787, lng: 34.7389 },
  "אור יהודה": { lat: 32.0286, lng: 34.8520 },
  "גבעתיים": { lat: 32.0719, lng: 34.8108 },
  "כפר יונה": { lat: 32.3169, lng: 34.9361 },
  "רמת השרון": { lat: 32.1461, lng: 34.8393 },
  "צפת": { lat: 32.9646, lng: 35.4960 },
  "שדרות": { lat: 31.5250, lng: 34.5956 },
  "נתיבות": { lat: 31.4216, lng: 34.5881 },
  "אופקים": { lat: 31.3137, lng: 34.6183 },
  "יהוד-מונוסון": { lat: 32.0327, lng: 34.8813 },
  "יהוד": { lat: 32.0327, lng: 34.8813 },
  "גבעת שמואל": { lat: 32.0767, lng: 34.8494 },
  "פרדס חנה-כרכור": { lat: 32.4726, lng: 34.9712 },
  "טירת כרמל": { lat: 32.7600, lng: 34.9700 },
  "זכרון יעקב": { lat: 32.5716, lng: 34.9533 },
  "כרמיאל": { lat: 32.9126, lng: 35.3013 },
  "מגדל העמק": { lat: 32.6764, lng: 35.2419 },
  "אור עקיבא": { lat: 32.5045, lng: 34.9200 },
  "קיסריה": { lat: 32.4996, lng: 34.8956 },
  "גדרה": { lat: 31.8123, lng: 34.7788 },
  "בית שמש": { lat: 31.7470, lng: 34.9871 },
  "מעלה אדומים": { lat: 31.7756, lng: 35.3070 },
};

export function getCityCoordinates(city: string): { lat: number; lng: number } | undefined {
  if (!city) return undefined;
  const trimmed = city.trim();
  return CITY_COORDINATES[trimmed];
}

// ─── Soldiers ─────────────────────────────────────────────────────────────

export function getSoldiers(): DbSoldier[] {
  return readJson<DbSoldier[]>("soldiers.json", []);
}

export function getSoldierById(id: string): DbSoldier | undefined {
  return getSoldiers().find((s) => s.id === id);
}

export function getSoldierByEmail(email: string): DbSoldier | undefined {
  return getSoldiers().find((s) => s.email?.toLowerCase() === email.toLowerCase());
}

export function createSoldier(data: Omit<DbSoldier, "id" | "createdAt" | "updatedAt">): DbSoldier {
  const soldiers = getSoldiers();
  const coords = data.coordinates || (data.city ? getCityCoordinates(data.city) : undefined);
  const soldier: DbSoldier = {
    ...data,
    coordinates: coords,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  soldiers.push(soldier);
  writeJson("soldiers.json", soldiers);
  return soldier;
}

export function updateSoldier(
  id: string,
  updates: Partial<Omit<DbSoldier, "id" | "createdAt">>
): DbSoldier | null {
  const soldiers = getSoldiers();
  const idx = soldiers.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  // Auto-resolve coordinates from city if city changed and no explicit coordinates given
  if (updates.city && !updates.coordinates) {
    const coords = getCityCoordinates(updates.city);
    if (coords) updates.coordinates = coords;
  }
  soldiers[idx] = { ...soldiers[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJson("soldiers.json", soldiers);
  return soldiers[idx];
}

export function deleteSoldier(id: string): boolean {
  const soldiers = getSoldiers();
  const filtered = soldiers.filter((s) => s.id !== id);
  if (filtered.length === soldiers.length) return false;
  writeJson("soldiers.json", filtered);
  return true;
}

// ─── Updates (Blog Posts) ────────────────────────────────────────────────

export function getUpdates(): DbUpdate[] {
  return readJson<DbUpdate[]>("updates.json", []);
}

export function getUpdateBySlug(slug: string): DbUpdate | undefined {
  return getUpdates().find((u) => u.slug === slug);
}

export function getUpdateById(id: string): DbUpdate | undefined {
  return getUpdates().find((u) => u.id === id);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function createUpdate(data: {
  title: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags?: string[];
}): DbUpdate {
  const updates = getUpdates();
  let slug = slugify(data.title);
  // Ensure unique slug
  if (updates.some((u) => u.slug === slug)) {
    slug = slug + "-" + Date.now().toString(36);
  }
  const update: DbUpdate = {
    id: crypto.randomUUID(),
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage,
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  updates.push(update);
  writeJson("updates.json", updates);
  return update;
}

export function updateUpdate(
  id: string,
  updates: Partial<Omit<DbUpdate, "id" | "createdAt">>
): DbUpdate | null {
  const all = getUpdates();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJson("updates.json", all);
  return all[idx];
}

export function deleteUpdate(id: string): boolean {
  const updates = getUpdates();
  const filtered = updates.filter((u) => u.id !== id);
  if (filtered.length === updates.length) return false;
  writeJson("updates.json", filtered);
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

// ─── Site Content ────────────────────────────────────────────────────────

const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    title: "פלוגת צב",
    subtitle: "ביחד, תמיד מוכנים",
    description: "אנחנו חיילי מילואים, חברים, משפחה. יחד אנחנו שומרים על הבית ובונים קהילה חזקה.",
    donateButtonText: "תרמו עכשיו",
    learnMoreButtonText: "למדו עוד",
  },
  about: {
    title: "אודות הפלוגה",
    text: "פלוגת צב היא יחידת מילואים שמפגישה לוחמים מכל רחבי הארץ. מאז הקמתה, הפלוגה מייצגת את הערכים של אחווה, מקצועיות ומחויבות למטרה.\n\nאנחנו לא רק חיילים — אנחנו חברים, שותפים, ומשפחה. כל אימון, כל פעילות, כל רגע יחד מחזק את הקשר שלנו ואת המוכנות שלנו.\n\nהתרומות שלכם מאפשרות לנו לשדרג ציוד, לארגן פעילויות גיבוש, ולתמוך בלוחמים ובמשפחותיהם.",
    values: [
      { name: "מקצועיות", icon: "🛡️", description: "רמה גבוהה של הכשרה ומוכנות" },
      { name: "אחווה", icon: "🤝", description: "קשרים חזקים בין הלוחמים" },
      { name: "מחויבות", icon: "🎯", description: "מסירות למשימה ולמדינה" },
      { name: "חוסן", icon: "💪", description: "עמידות וכוח פנימי" },
    ],
  },
  impact: {
    title: "השפעתנו",
    subtitle: "המספרים מדברים בעד עצמם. הפלוגה גדלה ומתחזקת בזכותכם.",
    stats: [
      { label: "לוחמים פעילים", value: "120+", icon: "🛡️" },
      { label: "אימונים בשנה", value: "50+", icon: "🎯" },
      { label: "שנות פעילות", value: "15", icon: "📅" },
      { label: "אחוז מחויבות", value: "100%", icon: "💪" },
    ],
  },
  donation: {
    title: "עזרו לנו להמשיך",
    text: "כל תרומה עוזרת לנו לשדרג ציוד, לארגן פעילויות גיבוש, ולתמוך בלוחמים ובמשפחותיהם. ביחד אנחנו חזקים יותר.",
    buttonText: "תרמו עכשיו",
    secondaryButtonText: "צרו קשר לפרטים",
    taxNote: "התרומות מוכרות לצורכי מס. תודה על התמיכה!",
    paymentLinks: [],
  },
  contact: {
    title: "צור קשר",
    text: "רוצים לדעת עוד? לתרום? להצטרף? אנחנו כאן בשבילכם.",
    email: "contact@plugat-tzav.org",
    phoneText: "ניתן ליצור קשר דרך האימייל",
    locationText: "ישראל",
  },
  navbar: {
    links: [
      { href: "#about", label: "אודות" },
      { href: "#impact", label: "השפעתנו" },
      { href: "#gallery", label: "עדכונים" },
      { href: "#timeline", label: "ציר הזמן" },
      { href: "/members/events", label: "אירועים" },
      { href: "#contact", label: "צור קשר" },
    ],
    donateText: "תרמו עכשיו",
    loginText: "התחברות",
    membersText: "אזור אישי",
  },
  footer: {
    copyright: "פלוגת צב. כל הזכויות שמורות.",
    links: [
      { href: "#about", label: "אודות" },
      { href: "#impact", label: "השפעתנו" },
      { href: "#gallery", label: "עדכונים" },
      { href: "#contact", label: "צור קשר" },
    ],
  },
  timeline: {
    title: "ציר הזמן",
    subtitle: "אבני דרך בסיפור הפלוגה שלנו.",
    entries: [
      { date: "2024", title: "אימון קיץ מרכזי", description: "אימון מרוכז בן שבוע עם כל לוחמי הפלוגה, כולל תרגילי שטח ופעילויות גיבוש." },
      { date: "2023", title: "מבצע חרבות ברזל", description: "הפלוגה גויסה במלואה ופעלה במסירות. לוחמינו הוכיחו מקצועיות ואחווה." },
      { date: "2022", title: "כנס שנתי ומשפחות", description: "כנס מרגש שהפגיש לוחמים ומשפחות, עם הרצאות, פעילויות והוקרה." },
      { date: "2021", title: "שדרוג ציוד הפלוגה", description: "בזכות תרומות נדיבות, שדרגנו את ציוד הפלוגה ושיפרנו את תנאי השירות." },
    ],
  },
  gallery: {
    title: "עדכונים ואירועים",
    subtitle: "מה קורה בפלוגה? עדכונים, סיפורים ותמונות מהשטח.",
  },
  impactDashboard: {
    title: "ההשפעה שלנו",
    subtitle: "שקיפות מלאה — כך התרומות שלכם עושות שינוי אמיתי",
    totalGoal: 100000,
    totalRaised: 67500,
    currency: "₪",
    categories: [
      { name: "ציוד לחימה", amount: 30000, color: "#556B2F", icon: "🛡️" },
      { name: "רווחת הלוחם", amount: 20000, color: "#D4C89A", icon: "🏠" },
      { name: "תמיכה במשפחות", amount: 10000, color: "#708090", icon: "👨‍👩‍👧‍👦" },
      { name: "אירועי גיבוש", amount: 7500, color: "#8B7355", icon: "🤝" },
    ],
    recentDonations: [
      { name: "אנונימי", amount: 500, date: "2024-12-15", message: "בהצלחה לוחמים!" },
      { name: "משפחת כהן", amount: 1000, date: "2024-12-10" },
      { name: "אנונימי", amount: 250, date: "2024-12-08", message: "גאים בכם" },
    ],
    stats: [
      { label: "לוחמים שנתמכו", value: "65", icon: "🪖" },
      { label: "אירועים שמומנו", value: "12", icon: "📅" },
      { label: "משפחות שנעזרו", value: "30", icon: "👨‍👩‍👧" },
      { label: "תורמים", value: "180", icon: "❤️" },
    ],
  },
};

const DEFAULT_PAGE_LAYOUTS: PageLayout[] = [
  {
    pageId: "main",
    sections: [
      { id: "hero", type: "hero", enabled: true, order: 0 },
      { id: "about", type: "about", enabled: true, order: 1 },
      { id: "impact", type: "impact", enabled: true, order: 2 },
      { id: "gallery", type: "gallery", enabled: true, order: 3 },
      { id: "timeline", type: "timeline", enabled: true, order: 4 },
      { id: "impactDashboard", type: "impactDashboard", enabled: true, order: 5 },
      { id: "donation", type: "donation", enabled: true, order: 6 },
      { id: "contact", type: "contact", enabled: true, order: 7 },
    ],
  },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function deepMerge(target: any, source: any): any {
  if (!source) return target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object" && !Array.isArray(tv)) {
      result[key] = deepMerge(tv, sv);
    } else if (sv !== undefined) {
      result[key] = sv;
    }
  }
  return result;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function getSiteContent(): SiteContent {
  const stored = readJson<Record<string, unknown>>("site-content.json", {});
  return deepMerge(DEFAULT_SITE_CONTENT, stored) as SiteContent;
}

export function updateSiteContent(updates: Partial<SiteContent>): SiteContent {
  const current = getSiteContent();
  const merged = deepMerge(current, updates);
  writeJson("site-content.json", merged);
  return merged;
}

// ─── Page Layouts ────────────────────────────────────────────────────────

export function getPageLayout(pageId: string): PageLayout {
  const layouts = readJson<PageLayout[]>("page-layouts.json", DEFAULT_PAGE_LAYOUTS);
  const layout = layouts.find((l) => l.pageId === pageId);
  const defaultLayout = DEFAULT_PAGE_LAYOUTS.find((l) => l.pageId === pageId);

  if (!layout) return defaultLayout || { pageId, sections: [] };

  // Auto-merge: add new default sections that don't exist in stored layout
  if (defaultLayout) {
    const existingTypes = new Set(layout.sections.map((s) => s.type));
    const maxOrder = Math.max(0, ...layout.sections.map((s) => s.order));
    let newOrder = maxOrder + 1;
    let changed = false;
    for (const defSection of defaultLayout.sections) {
      if (!existingTypes.has(defSection.type)) {
        layout.sections.push({ ...defSection, order: newOrder++, enabled: true });
        changed = true;
      }
    }
    if (changed) {
      const idx = layouts.findIndex((l) => l.pageId === pageId);
      if (idx !== -1) layouts[idx] = layout;
      writeJson("page-layouts.json", layouts);
    }
  }

  return layout;
}

export function updatePageLayout(pageId: string, sections: PageSection[]): PageLayout {
  const layouts = readJson<PageLayout[]>("page-layouts.json", DEFAULT_PAGE_LAYOUTS);
  const idx = layouts.findIndex((l) => l.pageId === pageId);
  const layout: PageLayout = { pageId, sections };
  if (idx === -1) {
    layouts.push(layout);
  } else {
    layouts[idx] = layout;
  }
  writeJson("page-layouts.json", layouts);
  return layout;
}

// ─── Campaigns ────────────────────────────────────────────────────────

export function getCampaigns(): DbCampaign[] {
  return readJson<DbCampaign[]>("campaigns.json", []);
}

export function getCampaignBySlug(slug: string): DbCampaign | undefined {
  return getCampaigns().find((c) => c.slug === slug);
}

export function getCampaignById(id: string): DbCampaign | undefined {
  return getCampaigns().find((c) => c.id === id);
}

export function createCampaign(data: Omit<DbCampaign, "id" | "createdAt" | "updatedAt">): DbCampaign {
  const campaigns = getCampaigns();
  const campaign: DbCampaign = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  campaigns.push(campaign);
  writeJson("campaigns.json", campaigns);
  return campaign;
}

export function updateCampaign(
  id: string,
  updates: Partial<Omit<DbCampaign, "id" | "createdAt">>
): DbCampaign | null {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  campaigns[idx] = { ...campaigns[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJson("campaigns.json", campaigns);
  return campaigns[idx];
}

export function deleteCampaign(id: string): boolean {
  const campaigns = getCampaigns();
  const filtered = campaigns.filter((c) => c.id !== id);
  if (filtered.length === campaigns.length) return false;
  writeJson("campaigns.json", filtered);
  return true;
}
