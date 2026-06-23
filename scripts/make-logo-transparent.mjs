/**
 * Removes flat backgrounds (checkerboard, white, green screen) from publisher logos.
 * Run: npm run logo:transparent
 * Or:  node scripts/make-logo-transparent.mjs Coplanar_Comics-Logo-2.PNG
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoName = process.argv[2] ?? "Coplanar_Comics-Logo-2.PNG";
const assetPath = path.join(root, "assets", "logos", logoName);
const publicPath = path.join(root, "public", "assets", "logos", logoName);

/** Chroma-style green (e.g. #00FF00 export backgrounds). */
function isGreenScreen(r, g, b) {
  if (g >= 150 && g >= r + 35 && g >= b + 35) return true;
  if (g >= 220 && r <= 90 && b <= 90) return true;
  return false;
}

/** Pixels reachable from image edges through background-like colors become transparent. */
function isBackgroundPixel(r, g, b) {
  if (isGreenScreen(r, g, b)) return true;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;

  if (spread <= 28 && max >= 200) return true;

  if (spread <= 8) {
    if (r >= 248 && g >= 248 && b >= 248) return true;
    if (r >= 188 && r <= 210 && g >= 188 && g <= 210 && b >= 188 && b <= 210)
      return true;
    if (r >= 118 && r <= 140 && g >= 118 && g <= 140 && b >= 118 && b <= 140)
      return true;
  }

  return false;
}

function floodFillBackground(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const pushIfBg = (x, y) => {
    const i = (y * width + x) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (!isBackgroundPixel(r, g, b)) return;
    const vi = y * width + x;
    if (visited[vi]) return;
    visited[vi] = 1;
    queue.push(x, y);
  };

  for (let x = 0; x < width; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfBg(0, y);
    pushIfBg(width - 1, y);
  }

  while (queue.length > 0) {
    const y = queue.pop();
    const x = queue.pop();
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      pushIfBg(nx, ny);
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!visited[y * width + x]) continue;
      const i = (y * width + x) * channels;
      data[i + 3] = 0;
    }
  }
}

function touchesTransparent(data, width, height, channels, x, y) {
  const alphaAt = (px, py) => data[(py * width + px) * channels + 3];
  for (const [nx, ny] of [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ]) {
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
    if (alphaAt(nx, ny) === 0) return true;
  }
  return false;
}

/** Removes fringe pixels at the transparency boundary (white or green spill). */
function cleanupEdgeFringe(data, width, height, channels) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (data[i + 3] === 0) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      const nearWhite = max >= 235 && max - min <= 24;
      const nearGreen = g >= 100 && g > r + 25 && g > b + 25;

      if (!nearWhite && !nearGreen) continue;
      if (!touchesTransparent(data, width, height, channels, x, y)) continue;

      data[i + 3] = 0;
    }
  }
}

async function processLogo(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  floodFillBackground(pixels, info.width, info.height, info.channels);
  cleanupEdgeFringe(pixels, info.width, info.height, info.channels);

  const out = await sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .toBuffer();

  fs.writeFileSync(filePath, out);
  console.log(`Wrote transparent PNG: ${filePath}`);
}

if (!fs.existsSync(assetPath)) {
  console.error(`Logo not found: ${assetPath}`);
  process.exit(1);
}

await processLogo(assetPath);
fs.mkdirSync(path.dirname(publicPath), { recursive: true });
fs.copyFileSync(assetPath, publicPath);
console.log(`Copied to: ${publicPath}`);
