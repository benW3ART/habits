'use client'

import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Flame, Trophy, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
  lastLogDate?: string
}

export const StreakBadge: FC<StreakBadgeProps> = ({
  currentStreak,
  longestStreak,
  lastLogDate,
}) => {
  const isOnFire = currentStreak >= 7
  const isBestEver = currentStreak === longestStreak && currentStreak > 0

  return (
    <Card
      className={cn(
        'p-4 bg-surface border-border',
        isOnFire && 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Current streak */}
          <div className="text-center">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center mb-1',
                isOnFire ? 'bg-orange-500/30' : 'bg-surface-hover'
              )}
            >
              <Flame
                className={cn(
                  'w-6 h-6',
                  isOnFire ? 'text-orange-400' : 'text-muted-foreground'
                )}
              />
            </div>
            <div
              className={cn(
                'text-2xl font-display font-black',
                isOnFire ? 'text-orange-400' : 'text-foreground'
              )}
            >
              {currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>

          {/* Divider */}
          <div className="h-12 w-px bg-border" />

          {/* Best streak */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mb-1">
              <Trophy
                className={cn(
                  'w-6 h-6',
                  isBestEver ? 'text-primary' : 'text-muted-foreground'
                )}
              />
            </div>
            <div
              className={cn(
                'text-2xl font-display font-black',
                isBestEver ? 'text-primary' : 'text-foreground'
              )}
            >
              {longestStreak}
            </div>
            <div className="text-xs text-muted-foreground">Best</div>
          </div>
        </div>

        {/* Last log */}
        {lastLogDate && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              Last logged
            </div>
            <div className="text-sm font-medium text-foreground">{lastLogDate}</div>
          </div>
        )}
      </div>

      {isBestEver && currentStreak > 0 && (
        <div className="mt-3 pt-3 border-t border-border text-center">
          <span className="text-xs font-medium text-primary">
            🎉 You're at your personal best!
          </span>
        </div>
      )}
    </Card>
  )
}
