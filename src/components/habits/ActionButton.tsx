'use client'

import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Action {
  name: string
  points: number
}

interface ActionButtonProps {
  action: Action
  type: 'positive' | 'negative'
  onLog: (action: Action) => Promise<void>
  disabled?: boolean
}

export const ActionButton: FC<ActionButtonProps> = ({
  action,
  type,
  onLog,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleClick = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    try {
      await onLog(action)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to log action:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isPositive = type === 'positive'

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={cn(
        'w-full justify-between h-auto py-3 px-4',
        isPositive
          ? 'border-green-500/30 hover:border-green-500 hover:bg-green-500/10'
          : 'border-red-500/30 hover:border-red-500 hover:bg-red-500/10',
        isSuccess && isPositive && 'bg-green-500/20 border-green-500',
        isSuccess && !isPositive && 'bg-red-500/20 border-red-500'
      )}
    >
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSuccess ? (
          <Check className={cn('w-4 h-4', isPositive ? 'text-green-400' : 'text-red-400')} />
        ) : (
          <div
            className={cn(
              'w-4 h-4 rounded-full border-2',
              isPositive ? 'border-green-500' : 'border-red-500'
            )}
          />
        )}
        <span className="text-sm font-medium">{action.name}</span>
      </div>

      <span
        className={cn(
          'text-sm font-bold',
          isPositive ? 'text-green-400' : 'text-red-400'
        )}
      >
        {action.points > 0 ? '+' : ''}
        {action.points} pts
      </span>
    </Button>
  )
}
