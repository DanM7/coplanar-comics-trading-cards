import { describe, expect, it } from "vitest";
import {
  formatPlayTeamQuery,
  invalidPlayTeamQueryMessage,
  parsePlayTeamQuery,
  playPathWithTeam,
} from "@/lib/play-team-query";

describe("parsePlayTeamQuery", () => {
  it("accepts three comma-separated 3-digit ids", () => {
    expect(parsePlayTeamQuery("004,038,050")).toEqual(["004", "038", "050"]);
    expect(parsePlayTeamQuery("004, 038, 050")).toEqual(["004", "038", "050"]);
  });

  it("rejects wrong counts", () => {
    expect(parsePlayTeamQuery("004,038")).toBeNull();
    expect(parsePlayTeamQuery("004,038,050,051")).toBeNull();
    expect(parsePlayTeamQuery("")).toBeNull();
    expect(parsePlayTeamQuery(null)).toBeNull();
  });

  it("rejects non-3-digit segments", () => {
    expect(parsePlayTeamQuery("4,038,050")).toBeNull();
    expect(parsePlayTeamQuery("004,38,050")).toBeNull();
    expect(parsePlayTeamQuery("004,0380,050")).toBeNull();
    expect(parsePlayTeamQuery("004,,050")).toBeNull();
  });

  it("rejects duplicate ids", () => {
    expect(parsePlayTeamQuery("004,004,050")).toBeNull();
  });
});

describe("formatPlayTeamQuery", () => {
  it("formats ids as 3-digit comma-separated string", () => {
    expect(formatPlayTeamQuery(["4", "38", "50"])).toBe("004,038,050");
    expect(playPathWithTeam(["4", "38", "50"])).toBe(
      "/play?team=004%2C038%2C050"
    );
  });
});

describe("invalidPlayTeamQueryMessage", () => {
  it("returns null for valid or absent values", () => {
    expect(invalidPlayTeamQueryMessage(null)).toBeNull();
    expect(invalidPlayTeamQueryMessage("")).toBeNull();
    expect(invalidPlayTeamQueryMessage("004,038,050")).toBeNull();
  });

  it("returns a message for invalid values", () => {
    expect(invalidPlayTeamQueryMessage("004,038")).toMatch(/Invalid \?team=/);
  });
});
