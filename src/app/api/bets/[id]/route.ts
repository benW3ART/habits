import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Platform rake percentage (5%)
const PLATFORM_RAKE_PERCENT = 5

// Resolution outcome types
type BetOutcome = 'won' | 'lost' | 'forfeited'

// Calculate payout based on outcome
function calculatePayout(
  stakeAmount: number,
  outcome: BetOutcome
): { userPayout: number; platformRake: number } {
  switch (outcome) {
    case 'won':
      // User wins: 100% stake returned (no rake on wins)
      return { userPayout: stakeAmount, platformRake: 0 }
    case 'lost':
      // User loses: 50% stake returned minus 5% rake
      const lostPayout = Math.floor(stakeAmount * 0.5)
      const lostRake = Math.floor(lostPayout * (PLATFORM_RAKE_PERCENT / 100))
      return { userPayout: lostPayout - lostRake, platformRake: lostRake + (stakeAmount - lostPayout) }
    case 'forfeited':
      // User forfeits: 0% returned, 100% to platform
      return { userPayout: 0, platformRake: stakeAmount }
    default:
      return { userPayout: 0, platformRake: stakeAmount }
  }
}

// Determine bet outcome based on conditions
async function determineBetOutcome(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  bet: {
    id: string
    user_id: string
    habit_id: string | null
    daily_log_required: boolean
    missed_days: number
    duration_days: number
    start_date: string
    end_date: string
  }
): Promise<{ outcome: BetOutcome; reason: string }> {
  const missedDaysThreshold = Math.floor(bet.duration_days * 0.3)

  // Check if forfeited due to too many missed days
  if (bet.daily_log_required && bet.missed_days > missedDaysThreshold) {
    return {
      outcome: 'forfeited',
      reason: `Missed ${bet.missed_days} days (threshold: ${missedDaysThreshold})`,
    }
  }

  // If habit-linked, check log activity
  if (bet.habit_id && bet.daily_log_required) {
    // Count logged days for the habit during bet period
    const { count: loggedDays, error: logError } = await supabase
      .from('logs')
      .select('*', { count: 'exact', head: true })
      .eq('habit_id', bet.habit_id)
      .eq('user_id', bet.user_id)
      .gte('logged_at', bet.start_date)
      .lte('logged_at', bet.end_date + 'T23:59:59.999Z')

    if (logError) {
      console.error('Error counting logs:', logError)
    }

    const totalDays = bet.duration_days
    const actualLoggedDays = loggedDays || 0
    const requiredDays = Math.ceil(totalDays * 0.7) // 70% of days required

    if (actualLoggedDays >= requiredDays) {
      return {
        outcome: 'won',
        reason: `Logged ${actualLoggedDays}/${totalDays} days (required: ${requiredDays})`,
      }
    } else {
      return {
        outcome: 'lost',
        reason: `Only logged ${actualLoggedDays}/${totalDays} days (required: ${requiredDays})`,
      }
    }
  }

  // For non-habit-linked bets or bets without daily log requirement
  // Default to checking missed_days against threshold
  if (bet.missed_days <= missedDaysThreshold) {
    return {
      outcome: 'won',
      reason: `Completed with ${bet.missed_days} missed days (threshold: ${missedDaysThreshold})`,
    }
  } else {
    return {
      outcome: 'lost',
      reason: `Missed ${bet.missed_days} days (threshold: ${missedDaysThreshold})`,
    }
  }
}

// GET /api/bets/[id] - Get single bet details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get bet with habit details
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select(`
        *,
        habits (
          id,
          name,
          category,
          goal
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (betError || !bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }

    // Calculate progress if bet has linked habit
    let progress = null
    if (bet.habit_id) {
      const { count: loggedDays } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .eq('habit_id', bet.habit_id)
        .eq('user_id', user.id)
        .gte('logged_at', bet.start_date)
        .lte('logged_at', bet.end_date + 'T23:59:59.999Z')

      const totalDays = bet.duration_days
      const actualLoggedDays = loggedDays || 0
      const requiredDays = Math.ceil(totalDays * 0.7)

      progress = {
        loggedDays: actualLoggedDays,
        totalDays,
        requiredDays,
        percentComplete: Math.round((actualLoggedDays / totalDays) * 100),
        onTrack: actualLoggedDays >= Math.ceil((new Date().getTime() - new Date(bet.start_date).getTime()) / (1000 * 60 * 60 * 24) * 0.7),
      }
    }

    // Calculate days remaining
    const today = new Date()
    const endDate = new Date(bet.end_date)
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

    return NextResponse.json({
      bet: {
        id: bet.id,
        habitId: bet.habit_id,
        habitName: bet.habits?.name || null,
        habitCategory: bet.habits?.category || null,
        habitGoal: bet.habits?.goal || null,
        goalDescription: bet.goal_description,
        stakeAmount: bet.stake_amount,
        stakeTxSignature: bet.stake_tx_signature,
        durationDays: bet.duration_days,
        startDate: bet.start_date,
        endDate: bet.end_date,
        daysRemaining,
        status: bet.status,
        dailyLogRequired: bet.daily_log_required,
        missedDays: bet.missed_days,
        payoutTxSignature: bet.payout_tx_signature,
        createdAt: bet.created_at,
        resolvedAt: bet.resolved_at,
        progress,
      },
    })
  } catch (error) {
    console.error('Get bet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bets/[id] - Resolve a bet or update missed days
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, walletAddress, payoutTxSignature, missedDays } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get bet
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (betError || !bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }

    // Handle different actions
    if (action === 'update_missed_days') {
      // Update missed days count (called by cron job or manual check)
      if (typeof missedDays !== 'number' || missedDays < 0) {
        return NextResponse.json(
          { error: 'Valid missedDays value required' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabase
        .from('bets')
        .update({ missed_days: missedDays })
        .eq('id', id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update missed days' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        missedDays,
      })
    }

    if (action === 'resolve') {
      // Check if bet is already resolved
      if (bet.status !== 'active') {
        return NextResponse.json(
          { error: `Bet already resolved with status: ${bet.status}` },
          { status: 400 }
        )
      }

      // Check if bet end date has passed
      const today = new Date()
      const endDate = new Date(bet.end_date)
      if (today < endDate) {
        return NextResponse.json(
          { error: 'Bet cannot be resolved before end date' },
          { status: 400 }
        )
      }

      // Determine outcome
      const { outcome, reason } = await determineBetOutcome(supabase, bet)

      // Calculate payout
      const { userPayout, platformRake } = calculatePayout(bet.stake_amount, outcome)

      // Update bet status
      const { error: updateError } = await supabase
        .from('bets')
        .update({
          status: outcome,
          payout_tx_signature: payoutTxSignature || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error resolving bet:', updateError)
        return NextResponse.json(
          { error: 'Failed to resolve bet' },
          { status: 500 }
        )
      }

      // Award points based on outcome
      const pointsAwarded = outcome === 'won' ? 100 : outcome === 'lost' ? 25 : 0
      if (pointsAwarded > 0) {
        await supabase.from('points').insert({
          user_id: user.id,
          action: `bet_${outcome}`,
          amount: pointsAwarded,
          metadata: {
            bet_id: id,
            stake_amount: bet.stake_amount,
            payout: userPayout,
            reason,
          },
        })
      }

      return NextResponse.json({
        success: true,
        resolution: {
          betId: id,
          outcome,
          reason,
          stakeAmount: bet.stake_amount,
          userPayout,
          platformRake,
          payoutTxSignature: payoutTxSignature || null,
          pointsAwarded,
          resolvedAt: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "resolve" or "update_missed_days"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Bet action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
