import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { singleRouteRequestSchema } from "@/domain";
import { getMapProvider } from "@/lib/maps/provider";
import { isRateLimited } from "@/server/api/rate-limit";

const routeCache = new Map<string, { expiresAt: number; value: unknown }>();
const routeCacheTtlMs = 30_000;

function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ error: { code, details, message } }, { status });
}

function providerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("quota")) {
    return { code: "PROVIDER_QUOTA", message: "Routing quota is temporarily exhausted." };
  }

  if (normalized.includes("coordinate")) {
    return { code: "INVALID_COORDINATES", message: "The supplied coordinates are invalid." };
  }

  return { code: "ROUTE_PROVIDER_FAILED", message: "In-app routing failed." };
}

export async function POST(request: Request) {
  if (isRateLimited(request, { limit: 30, namespace: "route", windowMs: 60_000 })) {
    return errorResponse(429, "RATE_LIMITED", "Too many route requests. Try again soon.");
  }
  const size = Number(request.headers.get("content-length") ?? "0");
  if (size > 25_000) {
    return errorResponse(413, "REQUEST_TOO_LARGE", "Route request payload is too large.");
  }

  try {
    const body = singleRouteRequestSchema.parse(await request.json());
    const cacheKey = JSON.stringify(body);
    const cached = routeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.value);
    }

    const provider = getMapProvider();
    const externalNavigationUrl = provider.externalNavigationUrl({
      destination: body.destination,
      origin: body.origin,
      travelMode: body.mode,
    });

    try {
      const route = await provider.route({
        mode: body.mode,
        origin: body.origin,
        stops: [...body.waypoints, body.destination],
      });

      const value = {
        externalNavigationUrl,
        fallback: false,
        provider: provider.id,
        route,
      };
      routeCache.set(cacheKey, { expiresAt: Date.now() + routeCacheTtlMs, value });
      return NextResponse.json(value);
    } catch (error) {
      const normalized = providerError(error);
      return NextResponse.json(
        {
          error: normalized,
          externalNavigationUrl,
          fallback: true,
          provider: provider.id,
        },
        { status: normalized.code === "INVALID_COORDINATES" ? 400 : 503 },
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid route request.", error.issues);
    }

    return errorResponse(500, "INTERNAL_ERROR", "Unable to calculate route.");
  }
}
