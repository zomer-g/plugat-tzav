import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const eventsFile = path.join(dataDir, "events.json");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Read CSV
const csvPath = "C:\\Users\\zomer\\Downloads\\פלוגה א כרונולוגיה - Sheet3.csv";
const csvContent = fs.readFileSync(csvPath, "utf-8");
const lines = csvContent.split("\n").filter((l) => l.trim());

// Parse header
const header = lines[0];
console.log("Header:", header);

// Map Hebrew event types to system types
const typeMap = {
  "אימון": "training",
  "לחימה": "operational",
  "קו": "operational",
  "על אזרחי": "social",
  "מדים": "uniform",
};

// Parse CSV rows (handling quoted fields with commas)
function parseCSVRow(row) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

const events = [];
for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVRow(lines[i]);
  if (fields.length < 8) continue;

  const [location, startDateStr, albumUrl, description, title, typeHeb, lat, lng] = fields;

  // Parse date: M/D/YYYY → YYYY-MM-DD
  const parts = startDateStr.split("/");
  const startDate = `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;

  const eventType = typeMap[typeHeb] || "training";

  const event = {
    id: `evt-${Date.now()}-${i}`,
    title: title || location,
    type: eventType,
    startDate,
    location,
    coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
    description: description || undefined,
    albumUrl: albumUrl || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  events.push(event);
  console.log(`✅ ${event.startDate} | ${typeHeb} → ${eventType} | ${event.title} @ ${event.location}`);
}

// Load existing events (if any) and merge
let existing = [];
if (fs.existsSync(eventsFile)) {
  existing = JSON.parse(fs.readFileSync(eventsFile, "utf-8"));
}

// Avoid duplicates by title+date
const existingKeys = new Set(existing.map((e) => `${e.title}|${e.startDate}`));
const newEvents = events.filter((e) => !existingKeys.has(`${e.title}|${e.startDate}`));

const merged = [...existing, ...newEvents];
fs.writeFileSync(eventsFile, JSON.stringify(merged, null, 2), "utf-8");

console.log(`\n📊 Imported ${newEvents.length} new events (${existing.length} existing, ${merged.length} total)`);
