'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { MobileLayout } from '@/components/layout'
import { HabitCard } from '@/components/habits'
import { useHabits } from '@/lib/hooks/useHabits'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Target, Loader2 } from 'lucide-react'

export default function HabitsPage() {
  const { connected } = useWallet()
  const router = useRouter()
  const { habits, isLoading, error, fetchHabits } = useHabits()

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">
              MY HABITS
            </h1>
            <p className="text-sm text-muted-foreground">
              {habits.length} active habits
            </p>
          </div>
          <Link href="/habits/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              NEW
            </Button>
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <Card className="p-4 bg-red-500/10 border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchHabits}>
              Retry
            </Button>
          </Card>
        )}

        {/* Habits list */}
        {!isLoading && !error && (
          <>
            {habits.length > 0 ? (
              <div className="space-y-3">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    id={habit.id}
                    name={habit.name}
                    category={habit.category || 'general'}
                    streak={habit.currentStreak}
                    todayLogged={habit.todayLogged}
                    positiveCount={habit.todayPositive}
                    negativeCount={habit.todayNegative}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 bg-surface border-border text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  No habits yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your journey by creating your first habit
                </p>
                <Link href="/habits/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Habit
                  </Button>
                </Link>
              </Card>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  )
}
