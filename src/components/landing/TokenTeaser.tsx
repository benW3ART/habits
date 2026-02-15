'use client'

import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Sparkles, Gift, Clock } from 'lucide-react'

export const TokenTeaser: FC = () => {
  return (
    <section className="py-16 px-4">
      <Card className="max-w-md mx-auto p-6 bg-gradient-to-br from-surface to-primary/10 border-primary/30 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-sm font-display font-bold text-primary tracking-wider">
              COMING SOON
            </span>
          </div>

          <h2 className="text-3xl font-display font-black text-foreground mb-4">
            $HABITS
            <br />
            <span className="text-primary">TOKEN</span>
          </h2>

          <p className="text-sm text-muted-foreground mb-6">
            Every point you earn now will count toward your future airdrop.
            Early users who build real habits will be rewarded.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-foreground">20% allocation for early users</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-foreground">Points tracked retroactively</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Supply</span>
              <span className="text-lg font-display font-black text-primary">1,000,000,000</span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
