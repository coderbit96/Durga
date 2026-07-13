import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .preprocess(emptyToUndefined, z.url().optional())
    .default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_PUJA_YEAR: z.coerce.number().int().min(2024).default(2026),
  NEXT_PUBLIC_MAPS_BROWSER_KEY: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
  NEXT_PUBLIC_MAX_PLAN_STOPS: z.coerce.number().int().min(1).max(25).default(8),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEFAULT_PUJA_YEAR: process.env.NEXT_PUBLIC_DEFAULT_PUJA_YEAR,
  NEXT_PUBLIC_MAPS_BROWSER_KEY: process.env.NEXT_PUBLIC_MAPS_BROWSER_KEY,
  NEXT_PUBLIC_MAX_PLAN_STOPS: process.env.NEXT_PUBLIC_MAX_PLAN_STOPS,
});

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid public environment configuration:\n${message}`);
}

export const publicEnv = parsed.data;
