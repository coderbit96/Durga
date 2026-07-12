import { describe, expect, it } from "vitest";
import { createFavoritesTestStore } from "./favorites";
import { createPlanTestStore } from "./plan";

describe("favorites store", () => {
  it("adds, toggles, removes, and clears favorites", () => {
    const store = createFavoritesTestStore();
    expect(store.add("a")).toEqual(["a"]);
    expect(store.add("a")).toEqual(["a"]);
    expect(store.toggle("a")).toEqual([]);
    expect(store.toggle("b")).toEqual(["b"]);
    expect(store.remove("b")).toEqual([]);
    expect(store.clear()).toEqual([]);
  });
});

describe("plan store", () => {
  it("prevents duplicate stops and enforces maximum count", () => {
    const store = createPlanTestStore(2);
    expect(store.addStop("a")).toBe(true);
    expect(store.addStop("a")).toBe(false);
    expect(store.addStop("b")).toBe(true);
    expect(store.addStop("c")).toBe(false);
    expect(store.snapshot().stops).toEqual(["a", "b"]);
  });

  it("reorders, removes, and sets travel context", () => {
    const store = createPlanTestStore();
    store.addStop("a");
    store.addStop("b");
    store.reorderStops(["b", "a", "b"]);
    store.removeStop("a");
    store.setTravelMode("transit");
    store.setStartLocation({
      latitude: 22.57,
      longitude: 88.36,
      source: "manual",
    });

    expect(store.snapshot()).toMatchObject({
      stops: ["b"],
      travelMode: "transit",
    });
  });
});
