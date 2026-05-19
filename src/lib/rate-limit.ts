const buckets = new Map<string, { count: number; resetAt: number }>();

export function assertRateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new Error("Trop de générations IA. Réessayez dans une minute.");
  }

  current.count += 1;
}
