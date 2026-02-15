/**
 * CSRF Protection utilities.
 * Validates Origin/Referer headers on mutation requests.
 */

/**
 * Get allowed origins from environment.
 * Falls back to common development origins.
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = []
  
  // Production URL from Vercel
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`)
  }
  
  // Explicit allowed origins
  if (process.env.ALLOWED_ORIGINS) {
    origins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()))
  }
  
  // Next.js public URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL)
  }
  
  // Development origins (only in dev mode)
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
    )
  }
  
  return origins
}

/**
 * Check if a request passes CSRF validation.
 * Returns true if the request is safe, false otherwise.
 */
export function validateCSRF(request: Request): { valid: boolean; reason?: string } {
  const method = request.method.toUpperCase()
  
  // Safe methods don't need CSRF protection
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true }
  }
  
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const allowedOrigins = getAllowedOrigins()
  
  // If no allowed origins configured, skip validation in production
  // This prevents breaking the app if env vars aren't set
  if (allowedOrigins.length === 0) {
    console.warn('[CSRF] No allowed origins configured, skipping validation')
    return { valid: true }
  }
  
  // Check Origin header first (most reliable)
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin.startsWith(allowed)
    )
    if (isAllowed) {
      return { valid: true }
    }
    return { 
      valid: false, 
      reason: `Origin '${origin}' not in allowed list` 
    }
  }
  
  // Fall back to Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = refererUrl.origin
      const isAllowed = allowedOrigins.some(allowed => 
        refererOrigin === allowed || refererOrigin.startsWith(allowed)
      )
      if (isAllowed) {
        return { valid: true }
      }
      return { 
        valid: false, 
        reason: `Referer origin '${refererOrigin}' not in allowed list` 
      }
    } catch {
      return { valid: false, reason: 'Invalid Referer header' }
    }
  }
  
  // No Origin or Referer - reject for mutation requests
  // This can happen with some HTTP clients, but browsers always send these
  return { 
    valid: false, 
    reason: 'Missing Origin and Referer headers' 
  }
}

/**
 * CSRF validation response for API routes.
 */
export function csrfError(reason: string): Response {
  return new Response(
    JSON.stringify({ 
      error: 'CSRF validation failed',
      message: reason,
    }),
    { 
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
