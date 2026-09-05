export interface RateLimitOptions {
  ip: string;
  action: string;
  limit: number;
  windowMs: number;
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

const requests = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 10_000;

function rateLimitKey(ip: string, action: string): string {
  return `${action.trim().toLowerCase()}:${ip.trim().toLowerCase() || "unknown"}`;
}

function evictOldestKey(): void {
  const oldestKey = requests.keys().next().value;
  if (oldestKey !== undefined) {
    requests.delete(oldestKey);
  }
}

/**
 * Applies an in-memory, per-process sliding-window limit. For multi-instance
 * production deployments, replace this adapter with a shared store.
 */
export function checkRateLimit({
  ip,
  action,
  limit,
  windowMs,
  now = Date.now(),
}: RateLimitOptions): RateLimitResult {
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError("Rate limit must be a positive safe integer.");
  }
  if (!Number.isSafeInteger(windowMs) || windowMs < 1) {
    throw new RangeError("Rate limit window must be a positive safe integer.");
  }
  if (!action.trim()) {
    throw new TypeError("A rate-limit action is required.");
  }

  const key = rateLimitKey(ip, action);
  const windowStart = now - windowMs;
  const attempts = (requests.get(key) ?? []).filter((timestamp) => timestamp > windowStart);
  const allowed = attempts.length < limit;

  if (allowed) {
    attempts.push(now);
  }

  if (requests.size >= MAX_TRACKED_KEYS && !requests.has(key)) {
    evictOldestKey();
  }
  requests.set(key, attempts);

  const oldestAttempt = attempts[0] ?? now;
  return {
    allowed,
    limit,
    remaining: allowed ? Math.max(0, limit - attempts.length) : 0,
    resetAt: new Date(oldestAttempt + windowMs),
  };
}

/** Intended for deterministic tests and process-local operational resets. */
export function resetRateLimits(): void {
  requests.clear();
}
