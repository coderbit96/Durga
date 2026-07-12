import { describe, expect, it } from "vitest";
import { cn, normalizeSlugSegment, parseSafeNumber, titleFromSlug, toSlug } from "./utils";

describe("utils", () => {
  it("merges Tailwind classes", () => {
    expect(cn("px-2", "px-4", false && "hidden")).toBe("px-4");
  });

  it("parses bounded numbers safely", () => {
    expect(parseSafeNumber("7", 3, { min: 1, max: 8 })).toBe(7);
    expect(parseSafeNumber("20", 3, { max: 8 })).toBe(3);
    expect(parseSafeNumber("not-a-number", 3)).toBe(3);
  });

  it("normalizes slug text", () => {
    expect(toSlug("Bagbazar Sarbojanin!")).toBe("bagbazar-sarbojanin");
    expect(normalizeSlugSegment("South%20Kolkata")).toBe("south-kolkata");
    expect(titleFromSlug("north-kolkata")).toBe("North Kolkata");
  });
});
