import { ZodError } from "zod";
import { createSharedPlan } from "@/server/repositories/shared-plans";
import { isRateLimited } from "@/server/api/rate-limit";

function json(status: number, body: unknown) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  if (isRateLimited(request, { limit: 12, namespace: "shared-plans", windowMs: 60_000 })) {
    return json(429, { error: { code: "RATE_LIMITED", message: "Try again soon." } });
  }
  const size = Number(request.headers.get("content-length") ?? "0");
  if (size > 20_000) {
    return json(413, { error: { code: "REQUEST_TOO_LARGE", message: "Shared plan payload is too large." } });
  }

  try {
    const plan = await createSharedPlan(await request.json());
    return json(201, { expiresAt: plan.expiresAt, shareCode: plan.shareSlug });
  } catch (error) {
    if (error instanceof ZodError) {
      return json(400, { error: { code: "VALIDATION_ERROR", details: error.issues, message: "Invalid shared plan." } });
    }
    console.error("shared-plan-create-failed", error instanceof Error ? error.message : "unknown");
    return json(500, { error: { code: "INTERNAL_ERROR", message: "Unable to create shared plan." } });
  }
}
