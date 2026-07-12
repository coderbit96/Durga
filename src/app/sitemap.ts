import type { MetadataRoute } from "next";
import { pujaSeedRecordSchema, suggestedRouteSeedRecordSchema } from "@/domain";
import { publicEnv } from "@/lib/public-env";
import pujaData from "../../data/pujas-2026.json";
import routeData from "../../data/routes-2026.json";

const sampleTimestamp = new Date("2026-01-01T00:00:00.000+05:30");

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = publicEnv.NEXT_PUBLIC_APP_URL;
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/pujas/north-kolkata",
    "/pujas/south-kolkata",
    "/plan",
    "/favorites",
    "/routes",
    "/about",
  ].map((path) => ({
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
    url: `${baseUrl}${path}`,
  }));

  const pujaRoutes = pujaData
    .map((record) => pujaSeedRecordSchema.parse(record))
    .filter((puja) => puja.year === publicEnv.NEXT_PUBLIC_DEFAULT_PUJA_YEAR)
    .filter((puja) => process.env.NODE_ENV !== "production" || puja.verified)
    .map((puja) => ({
      lastModified: sampleTimestamp,
      priority: puja.featured ? 0.85 : 0.65,
      url: `${baseUrl}/puja/${puja.slug}`,
    }));

  const suggestedRoutes = routeData
    .map((record) => suggestedRouteSeedRecordSchema.parse(record))
    .filter((route) => route.year === publicEnv.NEXT_PUBLIC_DEFAULT_PUJA_YEAR)
    .map((route) => ({
    lastModified: sampleTimestamp,
    priority: route.featured ? 0.8 : 0.6,
    url: `${baseUrl}/routes/${route.slug}`,
  }));

  return [...staticRoutes, ...pujaRoutes, ...suggestedRoutes];
}
