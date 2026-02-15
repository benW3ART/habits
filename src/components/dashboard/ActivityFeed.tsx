'use client'

import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  habitName: string
  actionName: string
  actionType: 'positive' | 'negative'
  points: number
  timestamp: string
}

interface ActivityFeedProps {
  activities: Activity[]
}

export const ActivityFeed: FC<ActivityFeedProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Card className="p-6 bg-surface border-border text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start logging your habits to see your activity here
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <Card
          key={activity.id}
          className="p-3 bg-surface border-border flex items-center gap-3"
        >
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              activity.actionType === 'positive'
                ? 'bg-green-500/20'
                : 'bg-red-500/20'
            )}
          >
            {activity.actionType === 'positive' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {activity.actionName}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {activity.habitName}
            </div>
          </div>

          <div className="text-right">
            <Badge
              variant={activity.actionType === 'positive' ? 'default' : 'outline'}
              className="text-xs"
            >
              {activity.points > 0 ? '+' : ''}
              {activity.points} pts
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {activity.timestamp}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
