import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pujaSeedRecordSchema, type PujaCategory, type PujaZone } from "../src/domain";
import { toSlug } from "../src/lib/utils";

type CsvRow = Record<string, string>;

function parseCsv(content: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function rowsToObjects(rows: string[][]) {
  const [headers, ...records] = rows;
  if (!headers) {
    return [];
  }

  return records.map((record) =>
    Object.fromEntries(
      headers.map((header, index) => [header.trim(), record[index]?.trim() ?? ""]),
    ),
  );
}

function splitList(value: string) {
  return value
    .split(/[|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function required(row: CsvRow, key: string, rowNumber: number) {
  const value = row[key]?.trim();
  if (!value) {
    throw new Error(`Row ${rowNumber}: missing ${key}`);
  }

  return value;
}

function toRecord(row: CsvRow, rowNumber: number) {
  const nameEn = required(row, "name_en", rowNumber);
  const zone = required(row, "zone", rowNumber) as PujaZone;
  const latitude = Number(required(row, "latitude", rowNumber));
  const longitude = Number(required(row, "longitude", rowNumber));
  const year = Number(row.year || "2026");
  const categories = splitList(row.categories || "community") as PujaCategory[];

  return {
    accessibility: {
      crowdLevel: row.crowdLevel || "medium",
      notes: row.accessibility_notes_en
        ? {
            bn: row.accessibility_notes_bn || row.accessibility_notes_en,
            en: row.accessibility_notes_en,
          }
        : undefined,
      seniorFriendly: row.seniorFriendly === "true",
      wheelchairAccess: row.wheelchairAccess === "true",
    },
    address: {
      bn: required(row, "address_bn", rowNumber),
      en: required(row, "address_en", rowNumber),
    },
    bestVisitTime: {
      bn: row.bestVisitTime_bn || "নমুনা সময়; যাচাই করুন",
      en: row.bestVisitTime_en || "Sample time; verify before publishing",
    },
    categories,
    committeeName: row.committeeName_en
      ? {
          bn: row.committeeName_bn || row.committeeName_en,
          en: row.committeeName_en,
        }
      : undefined,
    exitRecommendation: {
      bn: row.exitRecommendation_bn || "নমুনা প্রস্থান; যাচাই করুন",
      en: row.exitRecommendation_en || "Sample exit; verify before publishing",
    },
    featured: row.featured === "true",
    images: [],
    lastVerifiedAt: row.lastVerifiedAt || "2026-01-01T00:00:00.000+05:30",
    locality: required(row, "locality", rowNumber),
    location: {
      coordinates: [longitude, latitude] as [number, number],
      type: "Point" as const,
    },
    name: {
      bn: row.name_bn || nameEn,
      en: nameEn,
    },
    nearbyLandmark: {
      bn: row.nearbyLandmark_bn || row.nearbyLandmark_en || "নমুনা ল্যান্ডমার্ক",
      en: row.nearbyLandmark_en || "Sample landmark",
    },
    nearestMetro: row.nearestMetro || undefined,
    nearestRailwayStation: row.nearestRailwayStation || undefined,
    officialLinks: {},
    popularityScore: Number(row.popularityScore || "0"),
    recommendedEntry: {
      bn: row.recommendedEntry_bn || "নমুনা প্রবেশ; যাচাই করুন",
      en: row.recommendedEntry_en || "Sample entry; verify before publishing",
    },
    slug: row.slug || toSlug(nameEn),
    sourceNote: {
      bn:
        row.sourceNote_bn ||
        "CSV আমদানি করা নমুনা/ড্রাফট রেকর্ড। প্রকাশের আগে যাচাই করুন।",
      en:
        row.sourceNote_en ||
        "CSV imported sample/draft record. Verify before publishing.",
    },
    tags: splitList(row.tags || "sample"),
    themeDescription: {
      bn: row.themeDescription_bn || "CSV আমদানি করা ড্রাফট বিবরণ।",
      en: row.themeDescription_en || "CSV imported draft description.",
    },
    themeTitle: {
      bn: row.themeTitle_bn || "CSV আমদানি করা ড্রাফট থিম",
      en: row.themeTitle_en || "CSV imported draft theme",
    },
    verified: row.verified === "true",
    year,
    zone,
  };
}

async function main() {
  const input = process.argv[2];
  const output = process.argv[3] ?? path.join(process.cwd(), "data", "pujas-import.json");

  if (!input) {
    throw new Error(
      "Usage: npm run data:import-csv -- path/to/pujas.csv [data/pujas-import.json]",
    );
  }

  const rows = rowsToObjects(parseCsv(await readFile(input, "utf8")));
  const validRecords: unknown[] = [];
  const invalidRows: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    try {
      const result = pujaSeedRecordSchema.safeParse(toRecord(row, rowNumber));
      if (!result.success) {
        invalidRows.push(
          `Row ${rowNumber}: ${result.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ")}`,
        );
        return;
      }
      validRecords.push(result.data);
    } catch (error) {
      invalidRows.push(error instanceof Error ? error.message : String(error));
    }
  });

  await writeFile(output, `${JSON.stringify(validRecords, null, 2)}\n`);

  console.log(`Wrote ${validRecords.length} valid records to ${output}.`);
  if (invalidRows.length > 0) {
    console.error(`${invalidRows.length} invalid rows:`);
    invalidRows.forEach((message) => console.error(`- ${message}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
