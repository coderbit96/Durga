import { readFile } from "node:fs/promises";
import path from "node:path";
import { suggestedRouteSeedRecordSchema, pujaSeedRecordSchema } from "../src/domain";

type ValidationIssue = {
  file: string;
  index: number;
  message: string;
};

async function readJsonArray(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON array.`);
  }

  return parsed;
}

function formatIssues(file: string, index: number, issues: { message: string; path: PropertyKey[] }[]) {
  return issues.map((issue) => ({
    file,
    index,
    message: `${issue.path.join(".") || "record"}: ${issue.message}`,
  }));
}

export async function validateDataFiles({
  pujasPath = path.join(process.cwd(), "data", "pujas-2026.json"),
  routesPath = path.join(process.cwd(), "data", "routes-2026.json"),
} = {}) {
  const issues: ValidationIssue[] = [];
  const pujas = await readJsonArray(pujasPath);
  const routes = await readJsonArray(routesPath);

  pujas.forEach((record, index) => {
    const result = pujaSeedRecordSchema.safeParse(record);
    if (!result.success) {
      issues.push(...formatIssues(pujasPath, index, result.error.issues));
    }
  });

  routes.forEach((record, index) => {
    const result = suggestedRouteSeedRecordSchema.safeParse(record);
    if (!result.success) {
      issues.push(...formatIssues(routesPath, index, result.error.issues));
    }
  });

  return {
    issues,
    pujaCount: pujas.length,
    routeCount: routes.length,
  };
}

async function main() {
  const result = await validateDataFiles();

  if (result.issues.length > 0) {
    console.error("Data validation failed:");
    for (const issue of result.issues) {
      console.error(`- ${issue.file} [${issue.index}]: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Data validation passed: ${result.pujaCount} pujas and ${result.routeCount} routes.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
