'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { MobileLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Target,
  Flame,
  Trophy,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { getSolscanUrl } from '@/lib/solana/client'

interface Bet {
  id: string
  habitId: string | null
  habitName?: string
  goalDescription: string
  stakeAmount: number
  stakeTxSignature: string | null
  durationDays: number
  startDate: string
  endDate: string
  status: 'active' | 'won' | 'lost' | 'forfeited'
  dailyLogRequired: boolean
  missedDays: number
  payoutTxSignature: string | null
  createdAt: string
  resolvedAt: string | null
}

function getStatusConfig(status: Bet['status']) {
  switch (status) {
    case 'active':
      return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Flame, label: 'ACTIVE' }
    case 'won':
      return { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Trophy, label: 'WON' }
    case 'lost':
      return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'LOST' }
    case 'forfeited':
      return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: AlertTriangle, label: 'FORFEITED' }
  }
}

function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function calculateProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()
  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

export default function BetDetailPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const params = useParams()
  const [bet, setBet] = useState<Bet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const betId = params.id as string

  const fetchBet = useCallback(async () => {
    if (!publicKey || !betId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/bets/${betId}?wallet=${publicKey.toBase58()}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bet')
      }

      setBet(data.bet)
    } catch (err) {
      console.error('Error fetching bet:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bet')
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, betId])

  useEffect(() => {
    if (!connected) {
      router.push('/')
    } else {
      fetchBet()
    }
  }, [connected, router, fetchBet])

  if (!connected) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    )
  }

  // Error state
  if (error || !bet) {
    return (
      <MobileLayout showNav={false}>
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/bets">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-display font-black text-foreground">
              Bet Not Found
            </h1>
          </div>
          <Card className="p-6 bg-red-500/10 border-red-500/30 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {error || 'This bet does not exist or you do not have access to it.'}
            </p>
            <Link href="/bets">
              <Button className="mt-4">Back to Bets</Button>
            </Link>
          </Card>
        </div>
      </MobileLayout>
    )
  }

  const statusConfig = getStatusConfig(bet.status)
  const StatusIcon = statusConfig.icon
  const daysRemaining = calculateDaysRemaining(bet.endDate)
  const progress = calculateProgress(bet.startDate, bet.endDate)
  const stakeInSol = bet.stakeAmount / LAMPORTS_PER_SOL

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/bets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-display font-black text-foreground">
              BET DETAILS
            </h1>
          </div>
          <Badge className={statusConfig.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Goal Card */}
        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <div className="text-xs text-primary font-medium mb-1">GOAL</div>
              <div className="text-foreground">{bet.goalDescription}</div>
            </div>
          </div>
        </Card>

        {/* Stake Info */}
        <Card className="p-4 bg-surface border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">STAKE</div>
            <div className="text-3xl font-display font-black text-primary">
              {stakeInSol.toFixed(2)} SOL
            </div>
            {bet.stakeTxSignature && (
              <a
                href={getSolscanUrl(bet.stakeTxSignature)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
              >
                View transaction <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </Card>

        {/* Progress */}
        {bet.status === 'active' && (
          <Card className="p-4 bg-surface border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium text-foreground">
                {daysRemaining} days left
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(bet.startDate).toLocaleDateString()}</span>
              <span>{new Date(bet.endDate).toLocaleDateString()}</span>
            </div>
          </Card>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 bg-surface border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="text-sm font-medium text-foreground">
                  {bet.durationDays} days
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-surface border-border">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Daily Log</div>
                <div className="text-sm font-medium text-foreground">
                  {bet.dailyLogRequired ? 'Required' : 'Optional'}
                </div>
              </div>
            </div>
          </Card>

          {bet.dailyLogRequired && (
            <Card className="p-3 bg-surface border-border col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">Missed Days</div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    bet.missedDays > 0 ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {bet.missedDays} / {Math.floor(bet.durationDays * 0.3)} max
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Linked Habit */}
        {bet.habitId && bet.habitName && (
          <Card className="p-4 bg-surface border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">LINKED HABIT</div>
                <div className="text-sm font-medium text-foreground">
                  {bet.habitName}
                </div>
              </div>
              <Link href={`/habits/${bet.habitId}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Outcome info for completed bets */}
        {bet.status !== 'active' && (
          <Card
            className={`p-4 ${
              bet.status === 'won'
                ? 'bg-green-500/10 border-green-500/30'
                : bet.status === 'lost'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-gray-500/10 border-gray-500/30'
            }`}
          >
            <div className="text-center">
              <StatusIcon
                className={`w-8 h-8 mx-auto mb-2 ${
                  bet.status === 'won'
                    ? 'text-green-400'
                    : bet.status === 'lost'
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              />
              <div className="text-lg font-display font-bold text-foreground">
                {bet.status === 'won'
                  ? 'Congratulations!'
                  : bet.status === 'lost'
                  ? 'Better luck next time'
                  : 'Bet forfeited'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {bet.status === 'won'
                  ? `You won ${stakeInSol.toFixed(2)} SOL back!`
                  : bet.status === 'lost'
                  ? `You lost ${(stakeInSol * 0.5).toFixed(2)} SOL`
                  : `You lost ${stakeInSol.toFixed(2)} SOL`}
              </div>
              {bet.payoutTxSignature && (
                <a
                  href={getSolscanUrl(bet.payoutTxSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  View payout transaction <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}
