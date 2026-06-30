/**
 * Adds smoke, laserBolts, and flames overlay effects to nameRules in character_moves.json.
 * Run: node scripts/patch-comic-attack-effects.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "..", "data", "character_moves.json");
const file = JSON.parse(fs.readFileSync(filePath, "utf8"));

const SMOKE_KEYWORDS = new Set([
  "smoke",
  "mist",
  "stink",
  "gas",
  "toxic",
  "poison",
  "fume",
  "haze",
  "veil",
  "ooze",
  "cloud",
  "spray",
  "leak",
  "spew",
]);

const LASER_KEYWORDS = new Set([
  "laser",
  "bolt",
  "beam",
  "ray",
  "rayfire",
  "voltage",
  "spark",
]);

const FLAME_KEYWORDS = new Set([
  "fire",
  "flame",
  "pyro",
  "lava",
  "burn",
  "inferno",
  "blaze",
  "scorch",
  "kindle",
  "ember",
]);

function addEffect(effects, effect) {
  if (!effects.includes(effect)) {
    effects.push(effect);
  }
}

for (const rule of file.animations.nameRules) {
  const key = rule.contains.trim().toLowerCase();
  if (SMOKE_KEYWORDS.has(key)) {
    addEffect(rule.effects, "smoke");
  }
  if (LASER_KEYWORDS.has(key)) {
    addEffect(rule.effects, "laserBolts");
  }
  if (FLAME_KEYWORDS.has(key)) {
    addEffect(rule.effects, "flames");
  }
}

const existing = new Set(
  file.animations.nameRules.map((rule) => rule.contains.trim().toLowerCase())
);

const newRules = [
  { contains: "laser", effects: ["flash", "laserBolts"] },
  { contains: "fire", effects: ["flash", "flames"] },
  { contains: "flame", effects: ["flash", "flames"] },
  { contains: "burn", effects: ["flash", "flames"] },
  { contains: "inferno", effects: ["shake", "flames"] },
  { contains: "blaze", effects: ["flash", "flames"] },
  { contains: "scorch", effects: ["flash", "flames"] },
];

for (const rule of newRules) {
  if (!existing.has(rule.contains)) {
    file.animations.nameRules.push(rule);
  }
}

fs.writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
console.log("Patched comic attack effects in character_moves.json");
