import { describe, expect, it } from "vitest";
import pujas from "../../data/pujas-2026.json";

describe("project purpose seed coverage", () => {
  const northSouthPujas = pujas.filter(
    (puja) => puja.zone === "north-kolkata" || puja.zone === "south-kolkata",
  );

  it("covers North and South Kolkata discovery with famous and hidden-gem records", () => {
    expect(northSouthPujas.length).toBeGreaterThanOrEqual(30);
    expect(northSouthPujas.some((puja) => puja.zone === "north-kolkata")).toBe(true);
    expect(northSouthPujas.some((puja) => puja.zone === "south-kolkata")).toBe(true);
    expect(northSouthPujas.some((puja) => puja.tags.includes("famous"))).toBe(true);
    expect(northSouthPujas.some((puja) => puja.tags.includes("hidden-gem"))).toBe(true);
  });

  it("keeps required discovery details populated", () => {
    for (const puja of northSouthPujas) {
      expect(puja.themeTitle.en).toBeTruthy();
      expect(puja.themeDescription.en).toBeTruthy();
      expect(puja.address.en).toBeTruthy();
      expect(puja.nearbyLandmark.en).toBeTruthy();
      expect(puja.nearestMetro).toBeTruthy();
      expect(puja.location.coordinates).toHaveLength(2);
    }
  });
});
