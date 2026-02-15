'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { MobileLayout } from '@/components/layout'
import { ActionButton, StreakBadge } from '@/components/habits'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useHabits } from '@/lib/hooks/useHabits'
import { useLogging } from '@/lib/hooks/useLogging'
import { getSolscanUrl } from '@/lib/solana/client'

interface Habit {
  id: string
  name: string
  description: string | null
  category: string | null
  goal: string | null
  positiveActions: { name: string; points: number }[]
  negativeActions: { name: string; points: number }[]
  currentStreak: number
  longestStreak: number
  lastLogDate: string | null
}

interface Log {
  id: string
  actionName: string
  actionType: 'positive' | 'negative'
  points: number
  timestamp: string
  txSignature: string | null
}

export default function HabitDetailPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const params = useParams()
  const habitId = params.id as string

  const { getHabit } = useHabits()
  const { logAction, isLogging } = useLogging()

  const [habit, setHabit] = useState<Habit | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoadingHabit, setIsLoadingHabit] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const walletAddress = publicKey?.toBase58()

  // Fetch habit data
  const fetchHabit = useCallback(async () => {
    if (!walletAddress || !habitId) return

    setIsLoadingHabit(true)
    setError(null)

    try {
      const habitData = await getHabit(habitId)
      setHabit(habitData)
    } catch (err) {
      console.error('Error fetching habit:', err)
      setError(err instanceof Error ? err.message : 'Failed to load habit')
    } finally {
      setIsLoadingHabit(false)
    }
  }, [walletAddress, habitId, getHabit])

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    if (!walletAddress || !habitId) return

    setIsLoadingLogs(true)

    try {
      const response = await fetch(`/api/logs?wallet=${walletAddress}&habit_id=${habitId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch logs')
      }

      // Transform logs to match expected format
      const transformedLogs: Log[] = (data.logs || []).map((log: {
        id: string
        action_name: string
        action_type: 'positive' | 'negative'
        points_earned: number
        created_at: string
        tx_signature: string | null
      }) => ({
        id: log.id,
        actionName: log.action_name,
        actionType: log.action_type,
        points: log.points_earned,
        timestamp: formatTimestamp(log.created_at),
        txSignature: log.tx_signature,
      }))

      setLogs(transformedLogs)
    } catch (err) {
      console.error('Error fetching logs:', err)
    } finally {
      setIsLoadingLogs(false)
    }
  }, [walletAddress, habitId])

  // Format timestamp for display
  function formatTimestamp(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${timeStr}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }) + `, ${timeStr}`
    }
  }

  useEffect(() => {
    if (!connected) {
      router.push('/')
    }
  }, [connected, router])

  useEffect(() => {
    fetchHabit()
    fetchLogs()
  }, [fetchHabit, fetchLogs])

  if (!connected) {
    return null
  }

  const handleLogAction = async (
    action: { name: string; points: number },
    actionType: 'positive' | 'negative'
  ) => {
    if (!habit) return

    const result = await logAction({
      habitId: habit.id,
      habitName: habit.name,
      actionName: action.name,
      actionType,
      points: Math.abs(action.points),
    })

    if (result.success) {
      // Refresh habit data (for updated streak) and logs
      fetchHabit()
      fetchLogs()
    } else {
      // Error is already logged in the hook
      throw new Error(result.error || 'Failed to log action')
    }
  }

  // Loading state
  if (isLoadingHabit) {
    return (
      <MobileLayout showNav={false}>
        <div className="p-4 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
            </div>
          </div>

          {/* Description skeleton */}
          <div className="h-4 bg-muted rounded w-full animate-pulse" />

          {/* Goal skeleton */}
          <div className="h-16 bg-muted rounded animate-pulse" />

          {/* Streak skeleton */}
          <div className="h-24 bg-muted rounded animate-pulse" />

          {/* Actions skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </MobileLayout>
    )
  }

  // Error state
  if (error || !habit) {
    return (
      <MobileLayout showNav={false}>
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/habits">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-display font-black text-foreground">
              Habit Not Found
            </h1>
          </div>

          <Card className="p-6 bg-red-500/10 border-red-500/30 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {error || 'This habit could not be found or you do not have access to it.'}
            </p>
            <Link href="/habits">
              <Button variant="outline">Back to Habits</Button>
            </Link>
          </Card>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/habits">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-display font-black text-foreground">
              {habit.name}
            </h1>
            {habit.category && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs">
                  {habit.category}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Description & Goal */}
        {habit.description && (
          <p className="text-sm text-muted-foreground">{habit.description}</p>
        )}
        {habit.goal && (
          <Card className="p-3 bg-primary/10 border-primary/30">
            <div className="text-xs text-primary font-medium mb-1">GOAL</div>
            <div className="text-sm text-foreground">{habit.goal}</div>
          </Card>
        )}

        {/* Streak Badge */}
        <StreakBadge
          currentStreak={habit.currentStreak}
          longestStreak={habit.longestStreak}
          lastLogDate={habit.lastLogDate ?? undefined}
        />

        {/* Positive Actions */}
        {habit.positiveActions.length > 0 && (
          <div>
            <h2 className="text-sm font-display font-bold text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              POSITIVE ACTIONS
            </h2>
            <div className="space-y-2">
              {habit.positiveActions.map((action, index) => (
                <ActionButton
                  key={index}
                  action={action}
                  type="positive"
                  onLog={(action) => handleLogAction(action, 'positive')}
                  disabled={isLogging}
                />
              ))}
            </div>
          </div>
        )}

        {/* Negative Actions */}
        {habit.negativeActions.length > 0 && (
          <div>
            <h2 className="text-sm font-display font-bold text-red-400 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              NEGATIVE ACTIONS
            </h2>
            <div className="space-y-2">
              {habit.negativeActions.map((action, index) => (
                <ActionButton
                  key={index}
                  action={action}
                  type="negative"
                  onLog={(action) => handleLogAction(action, 'negative')}
                  disabled={isLogging}
                />
              ))}
            </div>
          </div>
        )}

        {/* History toggle */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowHistory(!showHistory)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>

        {/* History */}
        {showHistory && (
          <div className="space-y-2">
            <h2 className="text-sm font-display font-bold text-foreground">
              RECENT LOGS
            </h2>
            {isLoadingLogs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <Card className="p-4 bg-surface border-border text-center">
                <p className="text-sm text-muted-foreground">
                  No logs yet. Start logging your actions!
                </p>
              </Card>
            ) : (
              logs.map((log) => (
                <Card
                  key={log.id}
                  className="p-3 bg-surface border-border flex items-center gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.actionType === 'positive'
                        ? 'bg-green-500/20'
                        : 'bg-red-500/20'
                    }`}
                  >
                    {log.actionType === 'positive' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {log.actionName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.timestamp}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        log.actionType === 'positive' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {log.actionType === 'positive' ? '+' : '-'}
                      {Math.abs(log.points)}
                    </div>
                    {log.txSignature && (
                      <a
                        href={getSolscanUrl(log.txSignature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View tx
                      </a>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
