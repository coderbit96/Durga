import { describe, expect, it } from "vitest";
import { sharedPlanCreateRequestSchema } from "@/domain";
import { getSharedPlanExpiry } from "./shared-plans";

describe("shared plan repository helpers", () => {
  it("calculates TTL expiry from the requested hour window", () => {
    const now = new Date("2026-07-12T12:00:00.000Z");
    expect(getSharedPlanExpiry(72, now).toISOString()).toBe(
      "2026-07-15T12:00:00.000Z",
    );
  });

  it("validates shared plans without requiring personal identity fields", () => {
    const input = {
      includeOrigin: false,
      routeInput: {
        maxStops: 3,
        preferredModes: ["walking"],
        startAt: { coordinates: [88.3639, 22.5726], type: "Point" },
        stops: [
          {
            pujaSlug: "sample-puja",
            sequence: 1,
          },
        ],
        year: 2026,
      },
      title: "Evening plan",
    };

    expect(sharedPlanCreateRequestSchema.parse(input)).toMatchObject({
      includeOrigin: false,
      title: "Evening plan",
    });
  });
});
