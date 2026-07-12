import { describe, expect, it } from "vitest";
import { mockMapProvider } from "./mock-provider";

describe("mock map provider", () => {
  it("returns normalized matrix cells and navigation URLs", async () => {
    const origin = { coordinates: [88.3639, 22.5726], type: "Point" as const };
    const destination = { coordinates: [88.3656, 22.6039], type: "Point" as const };
    const matrix = await mockMapProvider.distanceMatrix({
      destinations: [destination],
      mode: "walking",
      origins: [origin],
    });

    expect(matrix.provider).toBe("mock");
    expect(matrix.cells[0][0].status).toBe("ok");
    expect(mockMapProvider.externalNavigationUrl({ destination, origin })).toContain(
      "google.com/maps/dir",
    );
  });
});
