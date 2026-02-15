'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { MobileLayout } from '@/components/layout'
import { StatsCard, PointsTeaser, ActivityFeed, QuickActions } from '@/components/dashboard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Flame, Calendar, Trophy, Loader2 } from 'lucide-react'
import { useDashboard } from '@/lib/hooks/useDashboard'

export default function DashboardPage() {
  const { connected } = useWallet()
  const router = useRouter()
  const { stats, activities, isLoading, error, refresh } = useDashboard()

  useEffect(() => {
    if (!connected) {
      router.push('/')
    }
  }, [connected, router])

  if (!connected) {
    return null
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-display font-black text-foreground">
            WELCOME BACK
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep building those habits
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <Card className="p-4 bg-red-500/10 border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
              Retry
            </Button>
          </Card>
        )}

        {/* Dashboard content */}
        {!isLoading && !error && (
          <>
            {/* Points teaser */}
            <PointsTeaser points={stats.points} />

            {/* Quick actions */}
            <QuickActions />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatsCard
                title="Habits"
                value={stats.totalHabits}
                icon={<Target className="w-4 h-4" />}
                subtitle="Active"
              />
              <StatsCard
                title="Streaks"
                value={stats.currentStreaks}
                icon={<Flame className="w-4 h-4" />}
                subtitle="On fire"
                trend={stats.currentStreaks > 0 ? 'up' : undefined}
                trendValue={stats.currentStreaks > 0 ? `${stats.currentStreaks}` : undefined}
              />
              <StatsCard
                title="This Week"
                value={stats.logsThisWeek}
                icon={<Calendar className="w-4 h-4" />}
                subtitle="Logs"
              />
              <StatsCard
                title="Global Rank"
                value={stats.rank ? `#${stats.rank}` : '-'}
                icon={<Trophy className="w-4 h-4" />}
                subtitle={stats.rank ? 'Keep climbing!' : 'Not ranked yet'}
              />
            </div>

            {/* Activity feed */}
            <div>
              <h2 className="text-lg font-display font-bold text-foreground mb-3">
                Recent Activity
              </h2>
              <ActivityFeed activities={activities} />
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  )
}
