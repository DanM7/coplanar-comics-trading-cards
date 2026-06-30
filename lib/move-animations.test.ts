import { describe, expect, it } from "vitest";
import {
  effectsFromMoveName,
  resolveEnergyAttackColor,
  resolveMoveAnimation,
  weaponColorFromMoveName,
} from "@/lib/move-animations";
import type { MoveAnimationsConfig } from "@/types/character-moves";

const testConfig: MoveAnimationsConfig = {
  nameRules: [
    { contains: "slam", effects: ["shake"] },
    { contains: "spin", effects: ["spin"] },
    { contains: "flash", effects: ["flash"] },
  ],
  energyDefaults: { colorSource: "character" },
  weaponColorRules: [{ contains: "toxic", color: "#5cff4a" }],
};

describe("effectsFromMoveName", () => {
  it("matches slam moves with shake", () => {
    expect(effectsFromMoveName("Skyfall Slam", testConfig)).toEqual(["shake"]);
  });

  it("dedupes multiple matching rules", () => {
    expect(
      effectsFromMoveName("Spin Slam Flash", {
        ...testConfig,
        nameRules: [
          { contains: "slam", effects: ["shake"] },
          { contains: "spin", effects: ["spin"] },
          { contains: "flash", effects: ["flash"] },
        ],
      })
    ).toEqual(["shake", "spin", "flash"]);
  });

  it("matches comic overlay keywords", () => {
    expect(
      effectsFromMoveName("Toxic Smoke Cloud", {
        ...testConfig,
        nameRules: [{ contains: "smoke", effects: ["spray", "smoke"] }],
      })
    ).toEqual(["spray", "smoke"]);

    expect(
      effectsFromMoveName("Laser Bolt Beam", {
        ...testConfig,
        nameRules: [{ contains: "bolt", effects: ["flash", "laserBolts"] }],
      })
    ).toEqual(["flash", "laserBolts"]);

    expect(
      effectsFromMoveName("Pyro Flame Burst", {
        ...testConfig,
        nameRules: [{ contains: "flame", effects: ["flash", "flames"] }],
      })
    ).toEqual(["flash", "flames"]);
  });
});

describe("resolveMoveAnimation", () => {
  it("uses override effects when provided", () => {
    expect(
      resolveMoveAnimation({
        moveName: "Plain Punch",
        attackType: "physical",
        overrides: { effects: ["shake"] },
        config: testConfig,
      }).effects
    ).toEqual(["shake"]);
  });

  it("keeps energy color override", () => {
    expect(
      resolveMoveAnimation({
        moveName: "Poison Cloud",
        attackType: "energy",
        overrides: { energyColor: "#5cff4a" },
        config: testConfig,
      }).energyColor
    ).toBe("#5cff4a");
  });
});

describe("resolveEnergyAttackColor", () => {
  it("prefers explicit override color", () => {
    expect(
      resolveEnergyAttackColor({
        moveName: "Poison Cloud",
        animation: {
          effects: ["spray"],
          energyColor: "#123456",
          energyColorSource: "character",
        },
        alignment: "Evil",
      })
    ).toBe("#123456");
  });

  it("uses weapon keyword color when source is weapon", () => {
    expect(
      resolveEnergyAttackColor({
        moveName: "Toxic Leak",
        animation: {
          effects: ["spray"],
          energyColorSource: "weapon",
        },
        alignment: "Good",
        config: testConfig,
      })
    ).toBe("#5cff4a");
  });

  it("uses sampled character color when available", () => {
    expect(
      resolveEnergyAttackColor({
        moveName: "Atmos Aura",
        animation: {
          effects: ["pulse"],
          energyColorSource: "character",
        },
        characterColor: "#2244aa",
        alignment: "Good",
      })
    ).toBe("#2244aa");
  });

  it("uses attack-type fallback effects when no name rule matches", () => {
    expect(
      resolveMoveAnimation({
        moveName: "Mystery Move",
        attackType: "physical",
        config: testConfig,
      }).effects
    ).toEqual(["lunge"]);

    expect(
      resolveMoveAnimation({
        moveName: "Mystery Move",
        attackType: "energy",
        config: {
          ...testConfig,
          fallbacks: { physical: ["lunge"], energy: ["pulse", "flash"] },
        },
      }).effects
    ).toEqual(["pulse", "flash"]);
  });
});

describe("weaponColorFromMoveName", () => {
  it("matches weapon color keywords", () => {
    expect(weaponColorFromMoveName("Toxic Leak", testConfig)).toBe("#5cff4a");
  });
});
