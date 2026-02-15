import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/habits - List user habits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

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
      return NextResponse.json({ habits: [] })
    }

    // Get habits with streaks
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select(`
        *,
        streaks (
          current_streak,
          longest_streak,
          last_log_date
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (habitsError) {
      console.error('Error fetching habits:', habitsError)
      return NextResponse.json(
        { error: 'Failed to fetch habits' },
        { status: 500 }
      )
    }

    // Get today's log counts for each habit
    const today = new Date().toISOString().split('T')[0]
    const habitIds = habits?.map((h) => h.id) || []

    const { data: todayLogs, error: logsError } = await supabase
      .from('logs')
      .select('habit_id, action_type')
      .eq('user_id', user.id)
      .in('habit_id', habitIds)
      .gte('logged_at', today)

    if (logsError) {
      console.error('Error fetching logs:', logsError)
    }

    // Aggregate log counts
    const logCounts = (todayLogs || []).reduce(
      (acc, log) => {
        if (!acc[log.habit_id]) {
          acc[log.habit_id] = { positive: 0, negative: 0 }
        }
        if (log.action_type === 'positive') {
          acc[log.habit_id].positive++
        } else {
          acc[log.habit_id].negative++
        }
        return acc
      },
      {} as Record<string, { positive: number; negative: number }>
    )

    // Format response
    const formattedHabits = habits?.map((habit) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      goal: habit.goal,
      positiveActions: habit.positive_actions,
      negativeActions: habit.negative_actions,
      isPreset: habit.is_preset,
      currentStreak: habit.streaks?.[0]?.current_streak || 0,
      longestStreak: habit.streaks?.[0]?.longest_streak || 0,
      lastLogDate: habit.streaks?.[0]?.last_log_date,
      todayPositive: logCounts[habit.id]?.positive || 0,
      todayNegative: logCounts[habit.id]?.negative || 0,
      todayLogged: (logCounts[habit.id]?.positive || 0) + (logCounts[habit.id]?.negative || 0) > 0,
      createdAt: habit.created_at,
    }))

    return NextResponse.json({ habits: formattedHabits })
  } catch (error) {
    console.error('Habits API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      walletAddress,
      name,
      description,
      category,
      goal,
      positiveActions,
      negativeActions,
      isPreset,
      presetId,
    } = body

    if (!walletAddress || !name) {
      return NextResponse.json(
        { error: 'Wallet address and name required' },
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

    // Create habit
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name,
        description,
        category,
        goal,
        positive_actions: positiveActions,
        negative_actions: negativeActions,
        is_preset: isPreset,
      })
      .select()
      .single()

    if (habitError) {
      console.error('Error creating habit:', habitError)
      return NextResponse.json(
        { error: 'Failed to create habit' },
        { status: 500 }
      )
    }

    // Initialize streak entry
    await supabase.from('streaks').insert({
      habit_id: habit.id,
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
    })

    // Award points for creating a habit
    await supabase.from('points').insert({
      user_id: userId,
      action: 'habit_created',
      amount: 25,
      metadata: { habit_id: habit.id, habit_name: name },
    })

    return NextResponse.json({
      success: true,
      habit: {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        category: habit.category,
        goal: habit.goal,
        positiveActions: habit.positive_actions,
        negativeActions: habit.negative_actions,
      },
    })
  } catch (error) {
    console.error('Create habit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
