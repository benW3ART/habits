'use client'

import { FC, ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export const StatsCard: FC<StatsCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendValue,
  className,
}) => {
  return (
    <Card className={cn('p-4 bg-surface border-border', className)}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <div className="text-muted-foreground">{icon}</div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-display font-black text-foreground">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          )}
        </div>

        {trend && trendValue && (
          <div
            className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-green-400',
              trend === 'down' && 'text-red-400',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue}
          </div>
        )}
      </div>
    </Card>
  )
}
