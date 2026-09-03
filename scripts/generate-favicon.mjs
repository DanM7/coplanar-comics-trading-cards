/**
 * Builds app/icon.png and app/apple-icon.png from the publisher logo.
 * Run: npm run favicon:generate
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "assets", "logos", "Coplanar_Comics-Logo-2.PNG");
const appDir = path.join(root, "app");

async function writeIcon(size, filename) {
  await sharp(logoPath)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(appDir, filename));
}

async function main() {
  await fs.access(logoPath);
  await fs.mkdir(appDir, { recursive: true });
  await writeIcon(96, "icon.png");
  await writeIcon(180, "apple-icon.png");
  console.log("Generated app/icon.png (96px) and app/apple-icon.png (180px)");
}

await main();
