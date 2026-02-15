import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface LeaderboardUser {
  rank: number
  walletAddress: string
  username: string | null
  totalPoints?: number
  maxStreak?: number
}

// GET /api/leaderboard - Get leaderboard rankings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'points'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const walletAddress = searchParams.get('wallet') // Optional: to get user's own rank

    if (type !== 'points' && type !== 'streaks') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "points" or "streaks"' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    let leaderboard: LeaderboardUser[] = []
    let userRank: LeaderboardUser | null = null

    if (type === 'points') {
      // Aggregate points by user
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('user_id, amount')

      if (pointsError) {
        console.error('Error fetching points:', pointsError)
        return NextResponse.json(
          { error: 'Failed to fetch leaderboard' },
          { status: 500 }
        )
      }

      // Aggregate points by user_id
      const pointsByUser: Record<string, number> = {}
      for (const point of pointsData || []) {
        if (!pointsByUser[point.user_id]) {
          pointsByUser[point.user_id] = 0
        }
        pointsByUser[point.user_id] += point.amount
      }

      // Get user details for all users with points
      const userIds = Object.keys(pointsByUser)
      if (userIds.length === 0) {
        return NextResponse.json({
          leaderboard: [],
          userRank: null,
          type: 'points',
        })
      }

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, wallet_address, username')
        .in('id', userIds)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return NextResponse.json(
          { error: 'Failed to fetch user data' },
          { status: 500 }
        )
      }

      // Create user lookup
      const userLookup: Record<string, { walletAddress: string; username: string | null }> = {}
      for (const user of users || []) {
        userLookup[user.id] = {
          walletAddress: user.wallet_address,
          username: user.username,
        }
      }

      // Create sorted leaderboard
      const sortedUsers = Object.entries(pointsByUser)
        .sort(([, a], [, b]) => b - a)
        .map(([userId, totalPoints], index) => ({
          rank: index + 1,
          walletAddress: userLookup[userId]?.walletAddress || '',
          username: userLookup[userId]?.username || null,
          totalPoints,
        }))
        .filter((entry) => entry.walletAddress)

      // Find user's rank if wallet provided
      if (walletAddress) {
        userRank = sortedUsers.find(
          (u) => u.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        ) || null
      }

      leaderboard = sortedUsers.slice(0, limit)
    } else {
      // Get max current_streak by user from streaks table
      const { data: streaksData, error: streaksError } = await supabase
        .from('streaks')
        .select('user_id, current_streak')

      if (streaksError) {
        console.error('Error fetching streaks:', streaksError)
        return NextResponse.json(
          { error: 'Failed to fetch leaderboard' },
          { status: 500 }
        )
      }

      // Get max streak per user
      const maxStreakByUser: Record<string, number> = {}
      for (const streak of streaksData || []) {
        if (!maxStreakByUser[streak.user_id] || streak.current_streak > maxStreakByUser[streak.user_id]) {
          maxStreakByUser[streak.user_id] = streak.current_streak
        }
      }

      // Filter out users with 0 streaks
      const userIds = Object.entries(maxStreakByUser)
        .filter(([, streak]) => streak > 0)
        .map(([userId]) => userId)

      if (userIds.length === 0) {
        return NextResponse.json({
          leaderboard: [],
          userRank: null,
          type: 'streaks',
        })
      }

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, wallet_address, username')
        .in('id', userIds)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return NextResponse.json(
          { error: 'Failed to fetch user data' },
          { status: 500 }
        )
      }

      // Create user lookup
      const userLookup: Record<string, { walletAddress: string; username: string | null }> = {}
      for (const user of users || []) {
        userLookup[user.id] = {
          walletAddress: user.wallet_address,
          username: user.username,
        }
      }

      // Create sorted leaderboard
      const sortedUsers = Object.entries(maxStreakByUser)
        .filter(([, streak]) => streak > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([userId, maxStreak], index) => ({
          rank: index + 1,
          walletAddress: userLookup[userId]?.walletAddress || '',
          username: userLookup[userId]?.username || null,
          maxStreak,
        }))
        .filter((entry) => entry.walletAddress)

      // Find user's rank if wallet provided
      if (walletAddress) {
        userRank = sortedUsers.find(
          (u) => u.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        ) || null
      }

      leaderboard = sortedUsers.slice(0, limit)
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      type,
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
