import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRatelimit(limit: number, window: Parameters<typeof Ratelimit.slidingWindow>[1]) {
  return process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(limit, window),
      })
    : { limit: async () => ({ success: true }) as const };
}

export const ratelimit = createRatelimit(10, "1 m");
export const authRatelimit = createRatelimit(5, "1 m");
export const chatDailyRatelimit = createRatelimit(25, "1 d");
