import { env } from "@/lib/env";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = { allowed: boolean; remaining: number };

const redisUrl = env("UPSTASH_REDIS_REST_URL");
const redisToken = env("UPSTASH_REDIS_REST_TOKEN");

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(max: number, window: number): Ratelimit {
  const key = `${max}:${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, `${window} s`),
      analytics: true,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

export async function rateLimit(identifier: string, max: number = 5, window: number = 60): Promise<RateLimitResult> {
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.error("Rate limiting unavailable in production — check UPSTASH_REDIS env vars");
      return { allowed: true, remaining: max };
    }
    return { allowed: true, remaining: max };
  }

  try {
    const { success, remaining } = await getLimiter(max, window).limit(identifier);
    return { allowed: success, remaining };
  } catch {
    return { allowed: false, remaining: 0 };
  }
}
