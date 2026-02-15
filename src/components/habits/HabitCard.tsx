'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HabitCardProps {
  id: string
  name: string
  category: string
  streak: number
  todayLogged: boolean
  positiveCount: number
  negativeCount: number
}

export const HabitCard: FC<HabitCardProps> = ({
  id,
  name,
  category,
  streak,
  todayLogged,
  positiveCount,
  negativeCount,
}) => {
  return (
    <Link href={`/habits/${id}`}>
      <Card
        className={cn(
          'p-4 bg-surface border-border hover:border-primary/50 transition-all',
          todayLogged && 'border-l-4 border-l-green-500'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-foreground truncate">
                {name}
              </h3>
              {streak > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 text-orange-400 border-orange-400/50">
                  <Flame className="w-3 h-3" />
                  {streak}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize">{category}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <div className="text-green-400">+{positiveCount} today</div>
              <div className="text-red-400">-{negativeCount} today</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
