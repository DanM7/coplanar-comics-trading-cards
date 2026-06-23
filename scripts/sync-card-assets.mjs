/**
 * Mirrors finished card PNGs from assets/cards/ to public/assets/cards/
 * so Next.js can serve them at /assets/cards/*.png
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourceDir = path.join(root, "assets", "cards");
const publicDir = path.join(root, "public", "assets", "cards");

async function main() {
  await fs.mkdir(publicDir, { recursive: true });

  let entries;
  try {
    entries = await fs.readdir(sourceDir);
  } catch {
    console.log("No assets/cards directory found — skipping sync.");
    return;
  }

  const pngs = entries.filter((name) => name.toLowerCase().endsWith(".png"));
  let copied = 0;

  for (const filename of pngs) {
    await fs.copyFile(path.join(sourceDir, filename), path.join(publicDir, filename));
    copied += 1;
  }

  console.log(`Synced ${copied} card PNG(s) to public/assets/cards/`);
}

await main();
