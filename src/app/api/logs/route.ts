import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Helper to calculate points with streak bonus
function calculatePoints(
  basePoints: number,
  currentStreak: number,
  streakBonusPerDay: number = 5,
  maxStreakBonus: number = 50
): number {
  const streakBonus = Math.min(currentStreak * streakBonusPerDay, maxStreakBonus)
  return basePoints + (basePoints > 0 ? streakBonus : 0)
}

// Helper to update streak
async function updateStreak(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  habitId: string,
  userId: string
): Promise<{ currentStreak: number; longestStreak: number }> {
  const today = new Date().toISOString().split('T')[0]

  // Get current streak data
  const { data: streak, error: streakError } = await supabase
    .from('streaks')
    .select('*')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .single()

  if (streakError && streakError.code !== 'PGRST116') {
    console.error('Error fetching streak:', streakError)
    return { currentStreak: 0, longestStreak: 0 }
  }

  let currentStreak = 1
  let longestStreak = 1
  const lastLogDate = streak?.last_log_date

  if (lastLogDate) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastLogDate === today) {
      // Already logged today, keep current streak
      currentStreak = streak.current_streak
      longestStreak = streak.longest_streak
    } else if (lastLogDate === yesterdayStr) {
      // Logged yesterday, increment streak
      currentStreak = streak.current_streak + 1
      longestStreak = Math.max(currentStreak, streak.longest_streak)
    } else {
      // Missed days, reset streak
      currentStreak = 1
      longestStreak = streak.longest_streak
    }
  }

  // Upsert streak
  const { error: upsertError } = await supabase.from('streaks').upsert(
    {
      habit_id: habitId,
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_log_date: today,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'habit_id,user_id',
    }
  )

  if (upsertError) {
    console.error('Error upserting streak:', upsertError)
  }

  return { currentStreak, longestStreak }
}

// GET /api/logs - Get logs for a habit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const habitId = searchParams.get('habit_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json({ logs: [] })
    }

    // Build query
    let query = supabase
      .from('logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(limit)

    if (habitId) {
      query = query.eq('habit_id', habitId)
    }

    const { data: logs, error: logsError } = await query

    if (logsError) {
      console.error('Error fetching logs:', logsError)
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }

    const formattedLogs = logs?.map((log) => ({
      id: log.id,
      habitId: log.habit_id,
      actionType: log.action_type,
      actionName: log.action_name,
      value: log.value,
      comment: log.comment,
      pointsEarned: log.points_earned,
      txSignature: log.tx_signature,
      loggedAt: log.logged_at,
    }))

    return NextResponse.json({ logs: formattedLogs })
  } catch (error) {
    console.error('Logs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/logs - Create a new log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      walletAddress,
      habitId,
      actionType,
      actionName,
      value = 1,
      comment,
      txSignature,
      basePoints,
    } = body

    if (!walletAddress || !habitId || !actionType || !actionName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update streak and get current value
    const { currentStreak } = await updateStreak(supabase, habitId, user.id)

    // Calculate points with streak bonus
    const pointsEarned = calculatePoints(basePoints || 10, currentStreak)

    // Create log entry
    const { data: log, error: logError } = await supabase
      .from('logs')
      .insert({
        habit_id: habitId,
        user_id: user.id,
        action_type: actionType,
        action_name: actionName,
        value,
        comment,
        points_earned: pointsEarned,
        tx_signature: txSignature,
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating log:', logError)
      return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
    }

    // Award points
    await supabase.from('points').insert({
      user_id: user.id,
      action: 'habit_log',
      amount: pointsEarned,
      metadata: {
        habit_id: habitId,
        action_type: actionType,
        action_name: actionName,
        log_id: log.id,
        streak: currentStreak,
      },
    })

    // Check for streak milestones and award bonus points
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      // Weekly streak bonus
      await supabase.from('points').insert({
        user_id: user.id,
        action: 'streak_milestone',
        amount: 50,
        metadata: {
          habit_id: habitId,
          streak: currentStreak,
          milestone: `${currentStreak} day streak!`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      log: {
        id: log.id,
        habitId: log.habit_id,
        actionType: log.action_type,
        actionName: log.action_name,
        pointsEarned: log.points_earned,
        txSignature: log.tx_signature,
        loggedAt: log.logged_at,
      },
      streak: currentStreak,
    })
  } catch (error) {
    console.error('Create log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
