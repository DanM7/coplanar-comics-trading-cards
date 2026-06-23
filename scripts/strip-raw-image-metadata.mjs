/**
 * Strips EXIF/XMP/ICC and other embedded metadata from raw card art.
 * iPhone photos often include Make, Model, Software, GPS, lens info, etc.
 *
 * Usage:
 *   npm run strip-raw-metadata
 *   node scripts/strip-raw-image-metadata.mjs --dry-run
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DEFAULT_DIRS = [
  path.join(root, "assets", "raw_front"),
  path.join(root, "assets", "raw_back"),
];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dirs = args.filter((arg) => !arg.startsWith("--"));

function hasEmbeddedMetadata(meta) {
  return Boolean(
    meta.exif?.length || meta.icc?.length || meta.iptc?.length || meta.xmp?.length
  );
}

async function listImages(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .map((name) => path.join(dir, name))
    .sort();
}

function encodePipeline(inputPath, meta) {
  const ext = path.extname(inputPath).toLowerCase();
  let pipeline = sharp(inputPath).rotate();

  if (ext === ".jpg" || ext === ".jpeg") {
    return pipeline.jpeg({
      quality: meta.quality ?? 100,
      mozjpeg: true,
      chromaSubsampling: "4:4:4",
    });
  }

  if (ext === ".png") {
    return pipeline.png({
      compressionLevel: meta.compressionLevel ?? 6,
      adaptiveFiltering: true,
    });
  }

  if (ext === ".webp") {
    return pipeline.webp({ quality: 100 });
  }

  return null;
}

async function stripMetadata(filePath) {
  const before = await sharp(filePath).metadata();
  const hadMetadata = hasEmbeddedMetadata(before);

  if (dryRun) {
    return {
      filePath,
      hadMetadata,
      changed: hadMetadata,
      dryRun: true,
    };
  }

  const pipeline = encodePipeline(filePath, before);
  if (!pipeline) {
    return { filePath, skipped: true, reason: "unsupported format" };
  }

  const tmpPath = `${filePath}.metadata-stripped.tmp`;
  await pipeline.toFile(tmpPath);
  await fs.rename(tmpPath, filePath);

  const after = await sharp(filePath).metadata();
  return {
    filePath,
    hadMetadata,
    changed: hadMetadata || hasEmbeddedMetadata(after) === false,
    stillHasMetadata: hasEmbeddedMetadata(after),
  };
}

async function main() {
  const targets = dirs.length > 0 ? dirs : DEFAULT_DIRS;
  const results = [];

  for (const dir of targets) {
    const files = await listImages(dir);
    for (const filePath of files) {
      try {
        results.push(await stripMetadata(filePath));
      } catch (error) {
        results.push({
          filePath,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const withMetadata = results.filter((r) => r.hadMetadata);
  const changed = results.filter((r) => r.changed && !r.error);
  const errors = results.filter((r) => r.error);
  const remaining = results.filter((r) => r.stillHasMetadata);

  console.log(
    dryRun ? "Dry run — no files modified." : "Metadata strip complete."
  );
  console.log(`Scanned: ${results.length}`);
  console.log(`Had embedded metadata: ${withMetadata.length}`);
  console.log(`${dryRun ? "Would update" : "Updated"}: ${changed.length}`);
  if (errors.length > 0) {
    console.log(`Errors: ${errors.length}`);
    for (const item of errors) {
      console.log(`  ${path.relative(root, item.filePath)} — ${item.error}`);
    }
  }
  if (!dryRun && remaining.length > 0) {
    console.log(`Still contain metadata: ${remaining.length}`);
    for (const item of remaining) {
      console.log(`  ${path.relative(root, item.filePath)}`);
    }
  }
}

await main();
