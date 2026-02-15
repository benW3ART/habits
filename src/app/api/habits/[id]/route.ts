import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/habits/[id] - Get a specific habit with logs
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

    // Get habit with streak
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select(`
        *,
        streaks (
          current_streak,
          longest_streak,
          last_log_date
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (habitError || !habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    // Get recent logs for this habit
    const { data: logs, error: logsError } = await supabase
      .from('logs')
      .select('*')
      .eq('habit_id', id)
      .order('logged_at', { ascending: false })
      .limit(20)

    if (logsError) {
      console.error('Error fetching logs:', logsError)
    }

    // Format response
    const formattedHabit = {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      goal: habit.goal,
      positiveActions: habit.positive_actions,
      negativeActions: habit.negative_actions,
      currentStreak: habit.streaks?.[0]?.current_streak || 0,
      longestStreak: habit.streaks?.[0]?.longest_streak || 0,
      lastLogDate: habit.streaks?.[0]?.last_log_date,
      logs: logs?.map((log) => ({
        id: log.id,
        actionType: log.action_type,
        actionName: log.action_name,
        points: log.points_earned,
        txSignature: log.tx_signature,
        timestamp: log.logged_at,
        comment: log.comment,
      })),
    }

    return NextResponse.json({ habit: formattedHabit })
  } catch (error) {
    console.error('Habit detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/habits/[id] - Delete a habit
export async function DELETE(
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

    // Delete habit (cascades to logs and streaks)
    const { error: deleteError } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting habit:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete habit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete habit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
