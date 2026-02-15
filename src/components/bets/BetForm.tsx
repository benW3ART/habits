'use client'

import { FC, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Coins, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Habit {
  id: string
  name: string
}

interface BetFormData {
  goalDescription: string
  stakeAmount: number
  durationDays: number
  dailyLogRequired: boolean
  habitId?: string
}

interface BetFormProps {
  habits?: Habit[]
  onSubmit: (data: BetFormData) => Promise<void>
  isLoading?: boolean
}

const durationOptions = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
]

const ESTIMATED_TX_FEE = 0.001

export const BetForm: FC<BetFormProps> = ({
  habits = [],
  onSubmit,
  isLoading = false,
}) => {
  const [goal, setGoal] = useState('')
  const [stakeAmount, setStakeAmount] = useState<number>(0.1)
  const [durationDays, setDurationDays] = useState(30)
  const [dailyLogRequired, setDailyLogRequired] = useState(false)
  const [linkedHabitId, setLinkedHabitId] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const estimatedTotal = useMemo(() => {
    return (stakeAmount + ESTIMATED_TX_FEE).toFixed(4)
  }, [stakeAmount])

  const isValidForm = goal.trim().length > 0 && stakeAmount > 0

  const handleSubmit = async () => {
    if (!isValidForm || isSubmitting || isLoading) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        goalDescription: goal.trim(),
        stakeAmount,
        durationDays,
        dailyLogRequired,
        habitId: linkedHabitId,
      })
    } catch (error) {
      console.error('Failed to create bet:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitting = isSubmitting || isLoading

  return (
    <div className="space-y-6">
      {/* Goal Description */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          What are you committing to?
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Exercise for 30 minutes every day"
          className={cn(
            'flex w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-sm text-white ring-offset-background placeholder:text-text-inactive focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none',
            'min-h-[100px]'
          )}
          disabled={submitting}
        />
      </div>

      {/* Stake Amount */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Stake Amount (SOL)
        </label>
        <div className="relative">
          <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <Input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.1"
            min="0.01"
            step="0.01"
            className="pl-10"
            disabled={submitting}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Minimum: 0.01 SOL. This amount will be locked until the bet resolves.
        </p>
      </div>

      {/* Duration */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Duration
        </label>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((option) => (
            <Badge
              key={option.value}
              variant={durationDays === option.value ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer px-3 py-1.5',
                durationDays === option.value && 'bg-primary text-black'
              )}
              onClick={() => !submitting && setDurationDays(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Daily Log Required */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={cn(
              'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors',
              dailyLogRequired
                ? 'bg-primary border-primary'
                : 'bg-surface border-border'
            )}
            onClick={() => !submitting && setDailyLogRequired(!dailyLogRequired)}
          >
            {dailyLogRequired && (
              <svg
                className="w-4 h-4 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-foreground">
              Require daily logging
            </span>
            <p className="text-xs text-muted-foreground">
              Miss a day and you forfeit the bet
            </p>
          </div>
        </label>
      </div>

      {/* Link to Habit (Optional) */}
      {habits.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Link to Habit (optional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Card
              className={cn(
                'p-3 bg-surface border-border cursor-pointer transition-colors text-center',
                !linkedHabitId
                  ? 'border-primary bg-primary/10'
                  : 'hover:border-primary/50'
              )}
              onClick={() => !submitting && setLinkedHabitId(undefined)}
            >
              <span className="text-sm text-foreground">No habit</span>
            </Card>
            {habits.map((habit) => (
              <Card
                key={habit.id}
                className={cn(
                  'p-3 bg-surface border-border cursor-pointer transition-colors',
                  linkedHabitId === habit.id
                    ? 'border-primary bg-primary/10'
                    : 'hover:border-primary/50'
                )}
                onClick={() => !submitting && setLinkedHabitId(habit.id)}
              >
                <span className="text-sm text-foreground truncate block">
                  {habit.name}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Cost */}
      <Card className="p-4 bg-surface border-primary/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <div className="text-sm font-medium text-foreground">
              Estimated Cost
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stake</span>
                <span className="text-foreground">{stakeAmount.toFixed(4)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction fee</span>
                <span className="text-foreground">~{ESTIMATED_TX_FEE} SOL</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{estimatedTotal} SOL</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isValidForm || submitting}
        className="w-full"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Bet...
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 mr-2" />
            Create Bet ({stakeAmount} SOL)
          </>
        )}
      </Button>
    </div>
  )
}
