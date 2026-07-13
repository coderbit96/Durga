import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const envSchema = z.object({
  MAP_PROVIDER: z
    .preprocess(
      emptyToUndefined,
      z.enum(["none", "mock", "osm", "google", "mapbox"]).optional(),
    )
    .default("mock"),
  MAPS_SERVER_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  MONGODB_URI: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_APP_URL: z
    .preprocess(emptyToUndefined, z.url().optional())
    .default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_PUJA_YEAR: z.coerce.number().int().min(2024).default(2026),
  NEXT_PUBLIC_MAPS_BROWSER_KEY: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
  NEXT_PUBLIC_MAX_PLAN_STOPS: z.coerce.number().int().min(1).max(25).default(8),
  SHARED_PLAN_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(72),
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
