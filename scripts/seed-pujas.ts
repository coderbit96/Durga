import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  suggestedRouteSeedRecordSchema,
  pujaSeedRecordSchema,
  type SuggestedRoute,
  type Puja,
} from "../src/domain";

loadEnvConfig(process.cwd());

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

async function readJsonArray(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON array.`);
  }

  return parsed;
}

function withTimestamps<T extends object>(record: T) {
  const now = new Date().toISOString();
  return {
    ...record,
    createdAt: now,
    updatedAt: now,
  };
}

async function main() {
  const { connectToDatabase, disconnectFromDatabase } = await import(
    "../src/server/db/mongoose"
  );
  const { PujaModel, SuggestedRouteModel } = await import("../src/server/models");
  const replace = hasFlag("--replace");
  const confirmReplace = hasFlag("--confirm-replace");

  if (replace && !confirmReplace) {
    throw new Error(
      "--replace is guarded. Re-run with --replace --confirm-replace after confirming the target database.",
    );
  }

  const pujasPath = path.join(process.cwd(), "data", "pujas-2026.json");
  const routesPath = path.join(process.cwd(), "data", "routes-2026.json");
  const pujaRecords = await readJsonArray(pujasPath);
  const routeRecords = await readJsonArray(routesPath);

  const pujas = pujaRecords.map((record, index) => {
    const result = pujaSeedRecordSchema.safeParse(record);
    if (!result.success) {
      throw new Error(
        `Invalid puja record ${index}: ${result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
    }
    return result.data;
  });

  const routes = routeRecords.map((record, index) => {
    const result = suggestedRouteSeedRecordSchema.safeParse(record);
    if (!result.success) {
      throw new Error(
        `Invalid route record ${index}: ${result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
    }
    return result.data;
  });

  try {
    await connectToDatabase();

    if (replace) {
      await PujaModel.deleteMany({
        $or: pujas.map((puja) => ({ slug: puja.slug, year: puja.year })),
      });
      await SuggestedRouteModel.deleteMany({
        $or: routes.map((route) => ({ slug: route.slug, year: route.year })),
      });
      console.log("Safely replaced only records present in the input files.");
    }

    for (const puja of pujas) {
      await PujaModel.updateOne(
        { slug: puja.slug, year: puja.year },
        { $set: withTimestamps(puja) satisfies Puja },
        { upsert: true },
      );
    }

    for (const route of routes) {
      await SuggestedRouteModel.updateOne(
        { slug: route.slug, year: route.year },
        { $set: withTimestamps(route) satisfies SuggestedRoute },
        { upsert: true },
      );
    }

    console.log(
      `Seeded ${pujas.length} pujas and ${routes.length} routes with upsert.`,
    );
  } finally {
    await disconnectFromDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
