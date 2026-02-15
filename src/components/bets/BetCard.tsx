'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, Clock, Target, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export type BetStatus = 'active' | 'won' | 'lost' | 'forfeited'

export interface Bet {
  id: string
  habitId: string | null
  habitName?: string
  goalDescription: string
  stakeAmount: number // in lamports
  stakeTxSignature: string | null
  durationDays: number
  startDate: string
  endDate: string
  status: BetStatus
  dailyLogRequired: boolean
  missedDays: number
  payoutTxSignature: string | null
  createdAt: string
  resolvedAt: string | null
}

interface BetCardProps {
  bet: Bet
}

const statusConfig: Record<BetStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-primary text-black',
  },
  won: {
    label: 'Won',
    className: 'bg-green-500 text-black',
  },
  lost: {
    label: 'Lost',
    className: 'bg-red-500 text-white',
  },
  forfeited: {
    label: 'Forfeited',
    className: 'bg-gray-500 text-white',
  },
}

export const BetCard: FC<BetCardProps> = ({ bet }) => {
  const {
    id,
    goalDescription: goal,
    stakeAmount,
    status,
    durationDays,
    startDate,
    endDate,
    dailyLogRequired,
    habitName: linkedHabitName,
  } = bet
  const now = new Date()
  const end = new Date(endDate)
  const start = new Date(startDate)
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const daysCompleted = Math.max(0, Math.min(durationDays, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))))
  const progress = Math.min(100, (daysCompleted / durationDays) * 100)
  const stakeInSol = stakeAmount / LAMPORTS_PER_SOL
  const isActive = status === 'active'

  const { label: statusLabel, className: statusClassName } = statusConfig[status]

  return (
    <Link href={`/bets/${id}`}>
      <Card
        className={cn(
          'p-4 bg-surface border-border hover:border-primary/50 transition-all',
          status === 'won' && 'border-l-4 border-l-green-500',
          status === 'lost' && 'border-l-4 border-l-red-500',
          status === 'forfeited' && 'border-l-4 border-l-gray-500'
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-foreground truncate">
                {goal}
              </h3>
            </div>
            {linkedHabitName && (
              <p className="text-xs text-muted-foreground">
                Linked to: {linkedHabitName}
              </p>
            )}
          </div>
          <Badge className={cn('shrink-0', statusClassName)}>
            {statusLabel}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1.5 text-primary">
            <Coins className="w-4 h-4" />
            <span className="font-bold">{stakeInSol.toFixed(2)} SOL</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>{durationDays} days</span>
          </div>
          {dailyLogRequired && (
            <div className="text-xs text-muted-foreground">
              Daily log required
            </div>
          )}
        </div>

        {isActive ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium">
                {daysCompleted}/{durationDays} days
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{daysRemaining} days remaining</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completed</span>
            <span className="text-foreground">
              {daysCompleted}/{durationDays} days logged
            </span>
          </div>
        )}

        <div className="flex justify-end mt-3">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </Card>
    </Link>
  )
}
