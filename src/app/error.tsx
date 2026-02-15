'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-surface border-red-500/30 text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-2xl font-display font-black text-foreground mb-2">
          SOMETHING WENT WRONG
        </h1>
        <p className="text-muted-foreground mb-6">
          An unexpected error occurred. Please try again.
        </p>
        {error.message && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3 mb-6 font-mono">
            {error.message}
          </p>
        )}
        <Button onClick={reset} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Card>
    </div>
  )
}
