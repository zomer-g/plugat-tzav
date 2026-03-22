import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

async function removeBg(inputFile, outputFile) {
  const image = sharp(path.join(publicDir, inputFile));
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 240; // pixels with R,G,B all > 240 are considered "white"

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Make white/near-white pixels transparent
    if (r > threshold && g > threshold && b > threshold) {
      data[i + 3] = 0; // Set alpha to 0
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(path.join(publicDir, outputFile));

  console.log(`✅ ${inputFile} → ${outputFile} (${info.width}x${info.height})`);
}

await removeBg("logo.png", "logo.png");
await removeBg("logo-small.png", "logo-small.png");
console.log("Done!");
