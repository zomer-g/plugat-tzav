import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

// Generate favicon PNGs from the logo
const logo = sharp(path.join(publicDir, "logo-small.png"));

// Get metadata to find the logo bounds
const meta = await logo.metadata();
console.log(`Source: ${meta.width}x${meta.height}`);

// Trim whitespace/transparency, then resize for favicon
await sharp(path.join(publicDir, "logo-small.png"))
  .trim()
  .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(publicDir, "favicon-32.png"));

await sharp(path.join(publicDir, "logo-small.png"))
  .trim()
  .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(publicDir, "favicon-16.png"));

await sharp(path.join(publicDir, "logo-small.png"))
  .trim()
  .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(publicDir, "apple-touch-icon.png"));

// Also create a proper ICO-compatible favicon
await sharp(path.join(publicDir, "logo-small.png"))
  .trim()
  .resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(publicDir, "favicon.png"));

console.log("✅ favicon-16.png (16x16)");
console.log("✅ favicon-32.png (32x32)");
console.log("✅ favicon.png (48x48)");
console.log("✅ apple-touch-icon.png (180x180)");
