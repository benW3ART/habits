import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'
import { createClient } from '@supabase/supabase-js'
import {
  verifySignature,
  isValidTimestamp,
  extractTimestampFromMessage,
  decodeSignature,
  type AuthPayload,
} from '@/lib/solana/auth'
import {
  checkRateLimit,
  getClientIP,
  createRateLimitKey,
  RATE_LIMITS,
  validateCSRF,
  csrfError,
} from '@/lib/security'

// Create supabase client lazily to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  // CSRF validation
  const csrf = validateCSRF(request)
  if (!csrf.valid) {
    return csrfError(csrf.reason || 'CSRF validation failed')
  }

  // Rate limiting
  const ip = getClientIP(request)
  const rateLimitKey = createRateLimitKey(ip, 'auth')
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.auth)
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 60000) / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    )
  }

  try {
    const body: AuthPayload = await request.json()
    const { walletAddress, message, signature } = body

    // Validate required fields
    if (!walletAddress || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate wallet address format
    let publicKey: PublicKey
    try {
      publicKey = new PublicKey(walletAddress)
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Extract and validate timestamp
    const timestamp = extractTimestampFromMessage(message)
    if (!timestamp || !isValidTimestamp(timestamp)) {
      return NextResponse.json(
        { error: 'Invalid or expired message timestamp' },
        { status: 400 }
      )
    }

    // Verify signature
    const signatureBytes = decodeSignature(signature)
    const isValid = verifySignature(message, signatureBytes, publicKey)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Create or update user in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is fine
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    let user = existingUser

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      user = newUser

      // Award welcome points
      await supabase.from('points').insert({
        user_id: user.id,
        action: 'welcome_bonus',
        amount: 100,
        metadata: { message: 'Welcome to Habits!' },
      })
    } else {
      // Update last seen
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
