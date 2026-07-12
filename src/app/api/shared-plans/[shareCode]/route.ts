import { getSharedPlan } from "@/server/repositories/shared-plans";
import { isRateLimited } from "@/server/api/rate-limit";

const shareCodePattern = /^[A-Za-z0-9_-]{8,40}$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  if (isRateLimited(request, { limit: 60, namespace: "shared-plan-read", windowMs: 60_000 })) {
    return Response.json({ error: { code: "RATE_LIMITED", message: "Try again soon." } }, { status: 429 });
  }

  try {
    const { shareCode } = await params;
    if (!shareCodePattern.test(shareCode)) {
      return Response.json({ error: { code: "VALIDATION_ERROR", message: "Invalid share code." } }, { status: 400 });
    }
    const plan = await getSharedPlan(shareCode);
    return Response.json(plan);
  } catch (error) {
    if (error instanceof Error && error.message === "EXPIRED") {
      return Response.json({ error: { code: "EXPIRED", message: "This shared plan has expired." } }, { status: 410 });
    }
    return Response.json({ error: { code: "NOT_FOUND", message: "Shared plan not found." } }, { status: 404 });
  }
}
