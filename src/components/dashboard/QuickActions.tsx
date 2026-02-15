'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Plus, Target, Flame, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const actions = [
  {
    href: '/habits/new',
    icon: Plus,
    label: 'New Habit',
    color: 'bg-green-500/20 text-green-400',
  },
  {
    href: '/habits',
    icon: Target,
    label: 'My Habits',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    href: '/bets/new',
    icon: Flame,
    label: 'New Bet',
    color: 'bg-orange-500/20 text-orange-400',
  },
  {
    href: '/leaderboard',
    icon: Trophy,
    label: 'Leaderboard',
    color: 'bg-purple-500/20 text-purple-400',
  },
]

export const QuickActions: FC = () => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href}>
            <Card className="p-3 bg-surface border-border hover:border-primary/50 transition-colors flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  action.color
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-muted-foreground text-center">
                {action.label}
              </span>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
