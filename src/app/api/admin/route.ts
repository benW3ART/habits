import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/utils/admin'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/admin - Return platform stats
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

    // Check admin privileges
    if (!isAdmin(walletAddress)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Fetch platform stats in parallel
    const [
      usersResult,
      betsResult,
      activeBetsResult,
      pointsResult,
      habitsResult,
      logsResult,
      presetsResult,
    ] = await Promise.all([
      // Total users
      supabase.from('users').select('id', { count: 'exact', head: true }),
      // Total bets
      supabase.from('bets').select('id', { count: 'exact', head: true }),
      // Active bets
      supabase
        .from('bets')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      // Total points awarded
      supabase.from('points').select('amount'),
      // Total habits created
      supabase.from('habits').select('id', { count: 'exact', head: true }),
      // Total logs
      supabase.from('logs').select('id', { count: 'exact', head: true }),
      // Active presets
      supabase
        .from('preset_habits')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
    ])

    // Calculate total points
    const totalPoints =
      pointsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [recentUsersResult, recentLogsResult, recentBetsResult] =
      await Promise.all([
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
          .from('logs')
          .select('id', { count: 'exact', head: true })
          .gte('logged_at', sevenDaysAgo.toISOString()),
        supabase
          .from('bets')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
      ])

    // Calculate total staked SOL from active bets
    const { data: stakesData } = await supabase
      .from('bets')
      .select('stake_amount')
      .eq('status', 'active')

    const totalStakedLamports =
      stakesData?.reduce((sum, bet) => sum + (bet.stake_amount || 0), 0) || 0

    const stats = {
      overview: {
        totalUsers: usersResult.count || 0,
        totalHabits: habitsResult.count || 0,
        totalLogs: logsResult.count || 0,
        totalBets: betsResult.count || 0,
        activeBets: activeBetsResult.count || 0,
        totalPointsAwarded: totalPoints,
        activePresets: presetsResult.count || 0,
        totalStakedLamports,
      },
      recentActivity: {
        newUsersLast7Days: recentUsersResult.count || 0,
        logsLast7Days: recentLogsResult.count || 0,
        betsLast7Days: recentBetsResult.count || 0,
      },
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
