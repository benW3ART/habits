import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/bets - List user's bets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const status = searchParams.get('status') // 'active', 'won', 'lost', 'forfeited', or null for all

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get user ID from wallet address
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json({ bets: [] })
    }

    // Build query
    let query = supabase
      .from('bets')
      .select(`
        *,
        habits (
          id,
          name,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: bets, error: betsError } = await query

    if (betsError) {
      console.error('Error fetching bets:', betsError)
      return NextResponse.json(
        { error: 'Failed to fetch bets' },
        { status: 500 }
      )
    }

    // Format response
    const formattedBets = bets?.map((bet) => ({
      id: bet.id,
      habitId: bet.habit_id,
      habitName: bet.habits?.name || null,
      habitCategory: bet.habits?.category || null,
      goalDescription: bet.goal_description,
      stakeAmount: bet.stake_amount, // in lamports
      stakeTxSignature: bet.stake_tx_signature,
      durationDays: bet.duration_days,
      startDate: bet.start_date,
      endDate: bet.end_date,
      status: bet.status,
      dailyLogRequired: bet.daily_log_required,
      missedDays: bet.missed_days,
      payoutTxSignature: bet.payout_tx_signature,
      createdAt: bet.created_at,
      resolvedAt: bet.resolved_at,
    }))

    return NextResponse.json({ bets: formattedBets })
  } catch (error) {
    console.error('Bets API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bets - Create a new bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      walletAddress,
      goalDescription,
      stakeAmount, // in lamports
      durationDays,
      dailyLogRequired = true,
      habitId, // optional
      stakeTxSignature,
    } = body

    // Validate required fields
    if (!walletAddress || !goalDescription || !stakeAmount || !durationDays) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, goalDescription, stakeAmount, durationDays' },
        { status: 400 }
      )
    }

    if (stakeAmount <= 0) {
      return NextResponse.json(
        { error: 'Stake amount must be positive' },
        { status: 400 }
      )
    }

    if (durationDays < 1 || durationDays > 365) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 365 days' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get or create user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    let userId = existingUser?.id

    if (!userId) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress })
        .select('id')
        .single()

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
      userId = newUser.id
    }

    // Validate habitId if provided
    if (habitId) {
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('id')
        .eq('id', habitId)
        .eq('user_id', userId)
        .single()

      if (habitError || !habit) {
        return NextResponse.json(
          { error: 'Invalid habit ID or habit does not belong to user' },
          { status: 400 }
        )
      }
    }

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    // Create bet
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        user_id: userId,
        habit_id: habitId || null,
        goal_description: goalDescription,
        stake_amount: stakeAmount,
        stake_tx_signature: stakeTxSignature || null,
        duration_days: durationDays,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        daily_log_required: dailyLogRequired,
        missed_days: 0,
      })
      .select()
      .single()

    if (betError) {
      console.error('Error creating bet:', betError)
      return NextResponse.json(
        { error: 'Failed to create bet' },
        { status: 500 }
      )
    }

    // Award points for creating a bet
    await supabase.from('points').insert({
      user_id: userId,
      action: 'bet_created',
      amount: 50,
      metadata: {
        bet_id: bet.id,
        stake_amount: stakeAmount,
        duration_days: durationDays,
      },
    })

    return NextResponse.json({
      success: true,
      bet: {
        id: bet.id,
        habitId: bet.habit_id,
        goalDescription: bet.goal_description,
        stakeAmount: bet.stake_amount,
        stakeTxSignature: bet.stake_tx_signature,
        durationDays: bet.duration_days,
        startDate: bet.start_date,
        endDate: bet.end_date,
        status: bet.status,
        dailyLogRequired: bet.daily_log_required,
        createdAt: bet.created_at,
      },
    })
  } catch (error) {
    console.error('Create bet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
