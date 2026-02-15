'use client'

import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface PointsTeaserProps {
  points: number
}

export const PointsTeaser: FC<PointsTeaserProps> = ({ points }) => {
  return (
    <Card className="p-4 bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Points earned</div>
            <div className="text-2xl font-display font-black text-primary">
              {points.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-primary font-medium">$HABITS</div>
          <div className="text-xs text-muted-foreground">Coming soon</div>
        </div>
      </div>
    </Card>
  )
}
