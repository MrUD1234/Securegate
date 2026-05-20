import { env } from "@/lib/env";

type RateLimitResult = { allowed: boolean; remaining: number };

export async function rateLimit(identifier: string, max: number = 5, window: number = 60): Promise<RateLimitResult> {
  const redisUrl = env("UPSTASH_REDIS_REST_URL");
  const redisToken = env("UPSTASH_REDIS_REST_TOKEN");

  if (!redisUrl || !redisToken) {
    return { allowed: true, remaining: max };
  }

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({ url: redisUrl, token: redisToken });
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${window} s`),
      analytics: true,
    });

    const { success, remaining } = await ratelimit.limit(identifier);
    return { allowed: success, remaining };
  } catch {
    return { allowed: true, remaining: max };
  }
}
