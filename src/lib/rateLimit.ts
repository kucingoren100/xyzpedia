interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  intervalMs: number;
  max: number;
}

// In-memory bucket store
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 5 minutes to prevent memory leak
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check and increment rate limit for a specific key (IP or identifier)
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { intervalMs: 60_000, max: 30 }
): { success: boolean; limit: number; remaining: number; resetAt: number } {
  cleanupExpired();

  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.intervalMs,
    });
    return {
      success: true,
      limit: options.max,
      remaining: options.max - 1,
      resetAt: now + options.intervalMs,
    };
  }

  if (existing.count >= options.max) {
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit: options.max,
    remaining: options.max - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Extract client IP respecting TRUSTED_PROXY env ("cloudflare", "vercel", or "none")
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const proxyMode = (process.env.TRUSTED_PROXY || "cloudflare").toLowerCase();

  if (proxyMode === "cloudflare") {
    const cfIp = headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  }

  if (proxyMode === "vercel" || proxyMode === "cloudflare") {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      const firstIp = forwarded.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Extract client IP from Next.js ReadonlyHeaders (used in Server Actions)
 */
export function getClientIpFromHeaders(headers: { get: (name: string) => string | null }): string {
  const proxyMode = (process.env.TRUSTED_PROXY || "cloudflare").toLowerCase();

  if (proxyMode === "cloudflare") {
    const cfIp = headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  }

  if (proxyMode === "vercel" || proxyMode === "cloudflare") {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      const firstIp = forwarded.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}
