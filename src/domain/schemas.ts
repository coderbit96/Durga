import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const isoDateString = z.iso.datetime({ offset: true });
const safeUrlSchema = z
  .url()
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "Only http and https URLs are allowed.",
  });
const commaList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value;
};
const queryBooleanSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

export const localizedTextSchema = z.object({
  bn: nonEmptyString,
  en: nonEmptyString,
});

export const pujaZoneSchema = z.enum([
  "north-kolkata",
  "south-kolkata",
  "central-kolkata",
  "east-kolkata",
  "west-kolkata",
]);

export const pujaCategorySchema = z.enum([
  "barowari",
  "bonedi-bari",
  "community",
  "family-friendly",
  "heritage",
  "theme",
  "traditional",
  "award-winning",
]);

const longitudeSchema = z.number().min(-180).max(180);
const latitudeSchema = z.number().min(-90).max(90);

export const geoPointSchema = z.object({
  coordinates: z
    .tuple([longitudeSchema, latitudeSchema])
    .describe("GeoJSON position stored as [longitude, latitude]."),
  type: z.literal("Point"),
});

export const pujaImageSchema = z.object({
  alt: localizedTextSchema,
  credit: optionalText,
  height: z.number().int().positive().optional(),
  url: safeUrlSchema,
  width: z.number().int().positive().optional(),
});

export const officialLinksSchema = z.object({
  facebook: safeUrlSchema.optional(),
  instagram: safeUrlSchema.optional(),
  maps: safeUrlSchema.optional(),
  website: safeUrlSchema.optional(),
});

export const accessibilitySchema = z.object({
  crowdLevel: z.enum(["low", "medium", "high", "very-high"]),
  notes: localizedTextSchema.optional(),
  seniorFriendly: z.boolean(),
  wheelchairAccess: z.boolean(),
});

export const pujaSchema = z.object({
  accessibility: accessibilitySchema,
  address: localizedTextSchema,
  bestVisitTime: localizedTextSchema,
  categories: z.array(pujaCategorySchema).min(1),
  committeeName: localizedTextSchema.optional(),
  createdAt: isoDateString,
  exitRecommendation: localizedTextSchema,
  featured: z.boolean(),
  images: z.array(pujaImageSchema),
  lastVerifiedAt: isoDateString,
  locality: nonEmptyString,
  location: geoPointSchema,
  name: localizedTextSchema,
  nearbyLandmark: localizedTextSchema,
  nearestMetro: optionalText,
  nearestRailwayStation: optionalText,
  officialLinks: officialLinksSchema,
  popularityScore: z.number().min(0).max(100),
  recommendedEntry: localizedTextSchema,
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a URL-safe slug."),
  sourceNote: localizedTextSchema,
  tags: z.array(nonEmptyString).default([]),
  themeDescription: localizedTextSchema,
  themeTitle: localizedTextSchema,
  updatedAt: isoDateString,
  verified: z.boolean(),
  year: z.number().int().min(2024).max(2100),
  zone: pujaZoneSchema,
});

export const routeStopSchema = z.object({
  arrivalWindow: optionalText,
  dwellMinutes: z.number().int().min(0).max(240).default(20),
  location: geoPointSchema.optional(),
  notes: localizedTextSchema.optional(),
  pujaSlug: nonEmptyString,
  sequence: z.number().int().min(1),
});

export const travelModeSchema = z.enum([
  "walking",
  "driving",
  "transit",
  "metro",
  "rail",
  "mixed",
]);

export const suggestedRouteSchema = z.object({
  createdAt: isoDateString,
  description: localizedTextSchema,
  distanceMeters: z.number().int().nonnegative().optional(),
  durationMinutes: z.number().int().positive(),
  featured: z.boolean().default(false),
  name: localizedTextSchema,
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a URL-safe slug."),
  stops: z.array(routeStopSchema).min(2),
  summary: localizedTextSchema,
  tags: z.array(nonEmptyString).default([]),
  travelMode: travelModeSchema,
  updatedAt: isoDateString,
  year: z.number().int().min(2024).max(2100),
  zone: pujaZoneSchema.optional(),
});

export const sharedPlanSchema = z.object({
  createdAt: isoDateString,
  expiresAt: isoDateString,
  id: nonEmptyString,
  name: localizedTextSchema.optional(),
  routeInput: z.lazy(() => routeInputSchema),
  shareSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a URL-safe slug."),
  updatedAt: isoDateString,
});

export const routeInputSchema = z.object({
  avoidCrowds: z.boolean().default(false),
  endAt: geoPointSchema.optional(),
  maxStops: z.number().int().min(1).max(25),
  preferredModes: z.array(travelModeSchema).min(1),
  startAt: geoPointSchema.optional(),
  stops: z.array(routeStopSchema).min(1),
  year: z.number().int().min(2024).max(2100),
});

export const routeLegSchema = z.object({
  distanceMeters: z.number().int().nonnegative(),
  durationMinutes: z.number().int().nonnegative(),
  fromStopSequence: z.number().int().min(1),
  instructions: z.array(nonEmptyString).default([]),
  mode: travelModeSchema,
  toStopSequence: z.number().int().min(1),
});

export const routeResultSchema = z.object({
  generatedAt: isoDateString,
  input: routeInputSchema,
  legs: z.array(routeLegSchema),
  totalDistanceMeters: z.number().int().nonnegative(),
  totalDurationMinutes: z.number().int().nonnegative(),
});

export const distanceMatrixInputSchema = z.object({
  destinations: z.array(geoPointSchema).min(1).max(25),
  mode: travelModeSchema.default("driving"),
  origins: z.array(geoPointSchema).min(1).max(25),
});

export const distanceMatrixCellSchema = z.object({
  distanceMeters: z.number().int().nonnegative().nullable(),
  durationMinutes: z.number().int().nonnegative().nullable(),
  status: z.enum(["ok", "not-found", "unreachable", "provider-error"]),
});

export const distanceMatrixResultSchema = z.object({
  cells: z.array(z.array(distanceMatrixCellSchema)),
  generatedAt: isoDateString,
  provider: nonEmptyString,
});

export const pujaSeedRecordSchema = pujaSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const suggestedRouteSeedRecordSchema = suggestedRouteSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const apiListQuerySchema = z.object({
  accessible: queryBooleanSchema.optional(),
  category: pujaCategorySchema.optional(),
  categories: z.preprocess(commaList, z.array(pujaCategorySchema).optional()),
  featured: queryBooleanSchema.optional(),
  famous: queryBooleanSchema.optional(),
  hiddenGem: queryBooleanSchema.optional(),
  includeUnverified: queryBooleanSchema.default(false),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  nearLat: z.coerce.number().min(-90).max(90).optional(),
  nearLng: z.coerce.number().min(-180).max(180).optional(),
  page: z.coerce.number().int().min(1).default(1),
  q: z.string().trim().max(120).optional(),
  radiusKm: z.coerce.number().positive().max(25).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z
    .enum(["popularity", "name", "recently-updated", "nearest"])
    .default("popularity"),
  tag: z.string().trim().min(1).max(60).optional(),
  tags: z.preprocess(commaList, z.array(nonEmptyString).optional()),
  nearMetro: queryBooleanSchema.optional(),
  verified: queryBooleanSchema.optional(),
  year: z.coerce.number().int().min(2024).max(2100).optional(),
  zone: pujaZoneSchema.optional(),
}).superRefine((query, context) => {
  const hasNearLat = typeof query.nearLat === "number";
  const hasNearLng = typeof query.nearLng === "number";

  if (hasNearLat !== hasNearLng) {
    context.addIssue({
      code: "custom",
      message: "nearLat and nearLng must be supplied together.",
      path: hasNearLat ? ["nearLng"] : ["nearLat"],
    });
  }

  if (query.sort === "nearest" && (!hasNearLat || !hasNearLng)) {
    context.addIssue({
      code: "custom",
      message: "nearest sorting requires nearLat and nearLng.",
      path: ["sort"],
    });
  }
});

export const apiDetailQuerySchema = z.object({
  includeUnverified: queryBooleanSchema.default(false),
  year: z.coerce.number().int().min(2024).max(2100).optional(),
});

export const apiRoutesListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).default(1),
  year: z.coerce.number().int().min(2024).max(2100).optional(),
  zone: pujaZoneSchema.optional(),
});

export const apiRouteDetailQuerySchema = z.object({
  year: z.coerce.number().int().min(2024).max(2100).optional(),
});

export const routeMatrixRequestSchema = distanceMatrixInputSchema.extend({
  provider: z.enum(["google", "mapbox", "mock"]).default("mock"),
});

export const appTravelModeSchema = z.enum(["walking", "driving", "transit"]);

export const singleRouteRequestSchema = z.object({
  destination: geoPointSchema,
  mode: appTravelModeSchema.default("walking"),
  origin: geoPointSchema,
  waypoints: z.array(geoPointSchema).max(25).default([]),
});

export const sharedPlanRequestSchema = z.object({
  includeOrigin: z.boolean().default(false),
  expiresInHours: z.coerce.number().int().min(1).max(720).default(72),
  name: localizedTextSchema.optional(),
  routeInput: routeInputSchema,
});

export const sharedPlanCreateRequestSchema = z.object({
  expiresInHours: z.coerce.number().int().min(1).max(720).default(72),
  includeOrigin: z.boolean().default(false),
  title: z.string().trim().min(1).max(120).default("PujoPath shared plan"),
  routeInput: routeInputSchema.extend({
    startAt: geoPointSchema.optional(),
  }),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type PujaZone = z.infer<typeof pujaZoneSchema>;
export type PujaCategory = z.infer<typeof pujaCategorySchema>;
export type GeoPoint = z.infer<typeof geoPointSchema>;
export type Puja = z.infer<typeof pujaSchema>;
export type RouteStop = z.infer<typeof routeStopSchema>;
export type TravelMode = z.infer<typeof travelModeSchema>;
export type SuggestedRoute = z.infer<typeof suggestedRouteSchema>;
export type SharedPlan = z.infer<typeof sharedPlanSchema>;
export type RouteInput = z.infer<typeof routeInputSchema>;
export type RouteResult = z.infer<typeof routeResultSchema>;
export type DistanceMatrixInput = z.infer<typeof distanceMatrixInputSchema>;
export type DistanceMatrixResult = z.infer<typeof distanceMatrixResultSchema>;
export type ApiListQuery = z.infer<typeof apiListQuerySchema>;
export type SharedPlanRequest = z.infer<typeof sharedPlanRequestSchema>;
export type AppTravelMode = z.infer<typeof appTravelModeSchema>;
