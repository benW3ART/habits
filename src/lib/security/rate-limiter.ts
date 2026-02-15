/**
 * Simple in-memory rate limiter for API routes.
 * Uses IP + route as key, limits to configurable requests per window.
 * 
 * NOTE: This is suitable for single-instance deployments.
 * For multi-instance, use Redis or a distributed rate limiter.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  store.forEach((entry, key) => {
    if (entry.resetAt < now) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => store.delete(key))
}, CLEANUP_INTERVAL)

export interface RateLimitConfig {
  /** Maximum requests per window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
  retryAfterMs?: number
}

// Default configs for different route types
export const RATE_LIMITS = {
  auth: { limit: 10, windowMs: 60 * 1000 },      // 10 req/min for auth
  bets: { limit: 30, windowMs: 60 * 1000 },      // 30 req/min for bets
  habits: { limit: 60, windowMs: 60 * 1000 },    // 60 req/min for habits
  logs: { limit: 120, windowMs: 60 * 1000 },     // 120 req/min for logs
  default: { limit: 60, windowMs: 60 * 1000 },   // 60 req/min default
} as const

/**
 * Check and increment rate limit for a given identifier.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.default
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  // No entry or expired entry - start fresh
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs
    store.set(identifier, { count: 1, resetAt })
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt,
    }
  }

  // Entry exists and is valid
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Get client IP from request headers.
 * Handles common proxy headers.
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP.trim()
  }

  // Fallback - this won't work in serverless but provides a fallback
  return 'unknown'
}

/**
 * Create a rate limit key from IP and route.
 */
export function createRateLimitKey(ip: string, route: string): string {
  return `${ip}:${route}`
}
