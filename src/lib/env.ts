import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const stringDefault = (fallback: string) => (value: unknown) =>
  value === "" || value === undefined ? fallback : value;
const numberDefault = (fallback: number) => (value: unknown) =>
  value === "" || value === undefined ? fallback : value;

const envSchema = z.object({
  MAP_PROVIDER: z.preprocess(
    stringDefault("mock"),
    z.enum(["none", "mock", "osm", "google", "mapbox"]),
  ),
  MAPS_SERVER_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  MONGODB_URI: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_APP_URL: z.preprocess(
    stringDefault("http://localhost:3000"),
    z.url(),
  ),
  NEXT_PUBLIC_DEFAULT_PUJA_YEAR: z.preprocess(
    numberDefault(2026),
    z.coerce.number().int().min(2024),
  ),
  NEXT_PUBLIC_MAPS_BROWSER_KEY: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
  NEXT_PUBLIC_MAX_PLAN_STOPS: z.preprocess(
    numberDefault(8),
    z.coerce.number().int().min(1).max(25),
  ),
  SHARED_PLAN_TTL_HOURS: z.preprocess(
    numberDefault(72),
    z.coerce.number().int().min(1).max(720),
  ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${message}`);
}

export const env = parsed.data;

export type AppEnv = typeof env;
