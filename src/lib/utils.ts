import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseSafeNumber(
  value: unknown,
  fallback: number,
  options: { max?: number; min?: number } = {},
) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  if (typeof options.min === "number" && parsed < options.min) {
    return fallback;
  }

  if (typeof options.max === "number" && parsed > options.max) {
    return fallback;
  }

  return parsed;
}

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeSlugSegment(value: string) {
  return toSlug(decodeURIComponent(value));
}

export function titleFromSlug(slug: string) {
  return normalizeSlugSegment(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
