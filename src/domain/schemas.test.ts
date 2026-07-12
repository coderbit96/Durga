import { describe, expect, it } from "vitest";
import {
  apiListQuerySchema,
  distanceMatrixResultSchema,
  pujaSeedRecordSchema,
  routeMatrixRequestSchema,
  sharedPlanRequestSchema,
  type GeoPoint,
} from "./schemas";

const point: GeoPoint = {
  coordinates: [88.3662, 22.5726],
  type: "Point",
};

const localized = {
  bn: "বাগবাজার সার্বজনীন",
  en: "Bagbazar Sarbojanin",
};

describe("domain schemas", () => {
  it("accepts GeoJSON points only in longitude, latitude order", () => {
    expect(point.coordinates[0]).toBe(88.3662);
    expect(routeMatrixRequestSchema.safeParse({
      destinations: [point],
      origins: [point],
    }).success).toBe(true);

    expect(
      routeMatrixRequestSchema.safeParse({
        destinations: [{ coordinates: [22.5726, 188.3662], type: "Point" }],
        origins: [point],
      }).success,
    ).toBe(false);
  });

  it("validates puja seed records without persistence timestamps", () => {
    const result = pujaSeedRecordSchema.safeParse({
      accessibility: {
        crowdLevel: "high",
        seniorFriendly: true,
        wheelchairAccess: false,
      },
      address: localized,
      bestVisitTime: { bn: "সন্ধ্যা", en: "Evening" },
      categories: ["heritage", "traditional"],
      committeeName: localized,
      exitRecommendation: { bn: "উত্তর গেট", en: "North gate" },
      featured: true,
      images: [
        {
          alt: localized,
          url: "https://example.com/bagbazar.jpg",
        },
      ],
      lastVerifiedAt: "2026-07-12T00:00:00.000+05:30",
      locality: "Bagbazar",
      location: point,
      name: localized,
      nearbyLandmark: { bn: "ঘাট", en: "Bagbazar Ghat" },
      nearestMetro: "Shyambazar",
      nearestRailwayStation: "Bagbazar",
      officialLinks: {
        website: "https://example.com",
      },
      popularityScore: 92,
      recommendedEntry: { bn: "মূল প্রবেশ", en: "Main entrance" },
      slug: "bagbazar-sarbojanin",
      sourceNote: { bn: "কমিটির প্রকাশিত তথ্য", en: "Committee-published information" },
      tags: ["classic", "north"],
      themeDescription: localized,
      themeTitle: localized,
      verified: true,
      year: 2026,
      zone: "north-kolkata",
    });

    expect(result.success).toBe(true);
  });

  it("coerces and bounds API list query values", () => {
    const query = apiListQuerySchema.parse({
      featured: "true",
      limit: "12",
      page: "2",
      zone: "south-kolkata",
    });

    expect(query).toMatchObject({
      featured: true,
      limit: 12,
      page: 2,
      sort: "popularity",
    });

    expect(apiListQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
  });

  it("validates shared plan requests", () => {
    const result = sharedPlanRequestSchema.parse({
      routeInput: {
        maxStops: 4,
        preferredModes: ["metro", "walking"],
        stops: [
          {
            pujaSlug: "bagbazar-sarbojanin",
            sequence: 1,
          },
        ],
        year: 2026,
      },
    });

    expect(result.expiresInHours).toBe(72);
    expect(result.routeInput.avoidCrowds).toBe(false);
  });

  it("validates distance matrix result cells", () => {
    expect(
      distanceMatrixResultSchema.safeParse({
        cells: [
          [
            {
              distanceMeters: 1200,
              durationMinutes: 18,
              status: "ok",
            },
          ],
        ],
        generatedAt: "2026-07-12T00:00:00.000+05:30",
        provider: "mock",
      }).success,
    ).toBe(true);
  });
});
