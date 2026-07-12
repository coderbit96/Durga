import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const publicFestivalCacheHeaders = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
};

export function okJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...publicFestivalCacheHeaders,
      ...init?.headers,
    },
  });
}

export function errorJson(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: {
        code,
        details,
        message,
      },
    },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return errorJson(400, "VALIDATION_ERROR", "Invalid request parameters.", error.issues);
  }

  if (error instanceof Error && error.message === "NOT_FOUND") {
    return errorJson(404, "NOT_FOUND", "The requested resource was not found.");
  }

  return errorJson(
    500,
    "INTERNAL_ERROR",
    error instanceof Error ? error.message : "Unexpected server error.",
  );
}
