import { describe, expect, it } from "vitest";
import {
  calculateRouteDistance,
  haversineDistance,
  nearestNeighbourRoute,
  twoOptImproveRoute,
  type RouteStopPoint,
} from "./algorithms";

const origin = { coordinates: [88.36, 22.57], type: "Point" as const };

function point(id: string, lng: number, lat: number): RouteStopPoint {
  return { id, point: { coordinates: [lng, lat], type: "Point" } };
}

describe("route algorithms", () => {
  it("calculates zero distance for equal points and empty routes", () => {
    expect(haversineDistance(origin, origin)).toBe(0);
    expect(calculateRouteDistance(origin, [])).toBe(0);
  });

  it("orders by nearest neighbour without dropping or duplicating stops", () => {
    const stops = [
      point("c", 88.5, 22.7),
      point("a", 88.361, 22.571),
      point("b", 88.37, 22.58),
    ];
    const ordered = nearestNeighbourRoute(origin, stops);

    expect(ordered.map((stop) => stop.id)).toEqual(["a", "b", "c"]);
    expect(new Set(ordered.map((stop) => stop.id)).size).toBe(stops.length);
  });

  it("is stable for equal distances", () => {
    const stops = [point("b", 88.37, 22.57), point("a", 88.35, 22.57)];
    expect(nearestNeighbourRoute(origin, stops).map((stop) => stop.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("supports one-stop routes", () => {
    const stops = [point("only", 88.37, 22.58)];
    expect(twoOptImproveRoute(origin, stops)).toEqual(stops);
  });

  it("does not make a route worse with 2-opt", () => {
    const stops = [
      point("a", 88.4, 22.62),
      point("b", 88.34, 22.62),
      point("c", 88.41, 22.52),
      point("d", 88.35, 22.52),
    ];
    const before = calculateRouteDistance(origin, stops);
    const improved = twoOptImproveRoute(origin, stops);

    expect(calculateRouteDistance(origin, improved)).toBeLessThanOrEqual(before);
    expect(improved.map((stop) => stop.id).sort()).toEqual(["a", "b", "c", "d"]);
  });
});
