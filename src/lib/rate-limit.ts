import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'dummy_url',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy_token',
})

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'ratelimit:auth',
})

export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'ratelimit:checkout',
})

export const generalApiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  prefix: 'ratelimit:general',
})

// AI Chat rate limit. This protects both per-user abuse and helps avoid exhausting 
// the shared Gemini free-tier quota across all traffic. 
// Note: This is a per-user limit, not a global one. The free tier's account-wide 
// RPM/RPD cap is a separate, shared ceiling across everyone using the app simultaneously.
export const aiChatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'ratelimit:ai-chat',
})
