import { describe, expect, it } from "vitest";
import {
  apiParamsFromFilters,
  defaultPujaFilters,
  parsePujaFilters,
  serializePujaFilters,
} from "./filters";

describe("puja filter serialization", () => {
  it("round-trips URL filter state", () => {
    const params = serializePujaFilters({
      ...defaultPujaFilters,
      page: 3,
      search: "bagbazar",
      sort: "recently-updated",
      view: "map",
    });

    expect(parsePujaFilters(params)).toMatchObject({
      page: 3,
      search: "bagbazar",
      sort: "recently-updated",
      view: "map",
    });
  });

  it("enforces zone and location params for API requests", () => {
    const params = apiParamsFromFilters(
      { ...defaultPujaFilters, sort: "nearest" },
      "north-kolkata",
      { latitude: 22.6, longitude: 88.36 },
    );

    expect(params.get("zone")).toBe("north-kolkata");
    expect(params.get("nearLat")).toBe("22.6");
    expect(params.get("nearLng")).toBe("88.36");
  });

  it("keeps valid zero coordinates for nearest sorting", () => {
    const params = apiParamsFromFilters(
      { ...defaultPujaFilters, sort: "nearest" },
      "south-kolkata",
      { latitude: 0, longitude: 0 },
    );

    expect(params.get("sort")).toBe("nearest");
    expect(params.get("nearLat")).toBe("0");
    expect(params.get("nearLng")).toBe("0");
  });
});
