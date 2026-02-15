'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useHabits } from './useHabits'

interface Activity {
  id: string
  habitId: string
  habitName: string
  actionName: string
  actionType: 'positive' | 'negative'
  points: number
  timestamp: string
}

interface DashboardStats {
  totalHabits: number
  currentStreaks: number
  logsThisWeek: number
  rank: number | null
  points: number
}

interface DashboardState {
  stats: DashboardStats
  activities: Activity[]
  isLoading: boolean
  error: string | null
}

export function useDashboard() {
  const { publicKey } = useWallet()
  const { habits, isLoading: habitsLoading } = useHabits()
  const [state, setState] = useState<DashboardState>({
    stats: {
      totalHabits: 0,
      currentStreaks: 0,
      logsThisWeek: 0,
      rank: null,
      points: 0,
    },
    activities: [],
    isLoading: true,
    error: null,
  })

  const walletAddress = publicKey?.toBase58()

  const fetchDashboardData = useCallback(async () => {
    if (!walletAddress) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Fetch logs and leaderboard data in parallel
      const [logsResponse, leaderboardResponse] = await Promise.all([
        fetch(`/api/logs?wallet=${walletAddress}&limit=10`),
        fetch(`/api/leaderboard?type=points&wallet=${walletAddress}`),
      ])

      const logsData = await logsResponse.json()
      const leaderboardData = await leaderboardResponse.json()

      if (!logsResponse.ok) {
        throw new Error(logsData.error || 'Failed to fetch logs')
      }

      // Map logs to activities
      const habitMap: Record<string, string> = {}
      habits.forEach((h) => {
        habitMap[h.id] = h.name
      })

      const activities: Activity[] = (logsData.logs || []).map(
        (log: {
          id: string
          habitId: string
          actionName: string
          actionType: 'positive' | 'negative'
          pointsEarned: number
          loggedAt: string
        }) => ({
          id: log.id,
          habitId: log.habitId,
          habitName: habitMap[log.habitId] || 'Unknown Habit',
          actionName: log.actionName,
          actionType: log.actionType,
          points: log.pointsEarned,
          timestamp: formatTimestamp(log.loggedAt),
        })
      )

      // Calculate stats from habits
      const totalHabits = habits.length
      const currentStreaks = habits.filter((h) => h.currentStreak > 0).length

      // Calculate logs this week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const logsThisWeek = (logsData.logs || []).filter(
        (log: { loggedAt: string }) => new Date(log.loggedAt) >= oneWeekAgo
      ).length

      // Get rank and points from leaderboard
      const rank = leaderboardData.userRank?.rank || null
      const points = leaderboardData.userRank?.totalPoints || 0

      setState({
        stats: {
          totalHabits,
          currentStreaks,
          logsThisWeek,
          rank,
          points,
        },
        activities,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load dashboard',
        isLoading: false,
      }))
    }
  }, [walletAddress, habits])

  useEffect(() => {
    if (!habitsLoading) {
      fetchDashboardData()
    }
  }, [fetchDashboardData, habitsLoading])

  return {
    ...state,
    refresh: fetchDashboardData,
    walletConnected: !!walletAddress,
  }
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}
