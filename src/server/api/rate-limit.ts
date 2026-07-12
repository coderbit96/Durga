const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(
  request: Request,
  options: { limit: number; windowMs: number; namespace: string },
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const key = `${options.namespace}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > options.limit;
}
