'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { MobileLayout } from '@/components/layout'
import { HabitForm } from '@/components/habits'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useHabits } from '@/lib/hooks/useHabits'

export default function NewHabitPage() {
  const { connected } = useWallet()
  const router = useRouter()
  const { presets, createHabit, isLoading } = useHabits()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!connected) {
      router.push('/')
    }
  }, [connected, router])

  if (!connected) {
    return null
  }

  const handleSubmit = async (data: {
    name: string
    description: string
    category: string
    goal: string
    positiveActions: { name: string; points: number }[]
    negativeActions: { name: string; points: number }[]
    isPreset: boolean
    presetId?: string
  }) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await createHabit({
        name: data.name,
        description: data.description,
        category: data.category,
        goal: data.goal,
        positiveActions: data.positiveActions,
        negativeActions: data.negativeActions,
        isPreset: data.isPreset,
        presetId: data.presetId,
      })
      router.push('/habits')
    } catch (err) {
      console.error('Error creating habit:', err)
      setError(err instanceof Error ? err.message : 'Failed to create habit')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/habits">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-display font-black text-foreground">
              NEW HABIT
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose a preset or create custom
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="p-4 bg-red-500/10 border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}

        {/* Loading presets */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Form */
          <HabitForm
            presets={presets}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </MobileLayout>
  )
}
