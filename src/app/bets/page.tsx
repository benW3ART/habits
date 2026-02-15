'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { MobileLayout } from '@/components/layout'
import { BetCard } from '@/components/bets'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Flame, Loader2 } from 'lucide-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

interface Bet {
  id: string
  habitId: string | null
  goalDescription: string
  stakeAmount: number
  stakeTxSignature: string | null
  durationDays: number
  startDate: string
  endDate: string
  status: 'active' | 'won' | 'lost' | 'forfeited'
  dailyLogRequired: boolean
  missedDays: number
  payoutTxSignature: string | null
  createdAt: string
  resolvedAt: string | null
}

export default function BetsPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [bets, setBets] = useState<Bet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBets = useCallback(async () => {
    if (!publicKey) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/bets?wallet=${publicKey.toBase58()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bets')
      }

      setBets(data.bets || [])
    } catch (err) {
      console.error('Error fetching bets:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bets')
    } finally {
      setIsLoading(false)
    }
  }, [publicKey])

  useEffect(() => {
    if (!connected) {
      router.push('/')
    } else {
      fetchBets()
    }
  }, [connected, router, fetchBets])

  if (!connected) {
    return null
  }

  const activeBets = bets.filter((bet) => bet.status === 'active')
  const completedBets = bets.filter((bet) => bet.status !== 'active')
  const totalStaked = activeBets.reduce((sum, bet) => sum + bet.stakeAmount, 0)

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-black text-foreground">
              MY BETS
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeBets.length} active · {(totalStaked / LAMPORTS_PER_SOL).toFixed(2)} SOL staked
            </p>
          </div>
          <Link href="/bets/new">
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
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchBets}>
              Retry
            </Button>
          </Card>
        )}

        {/* Bets content */}
        {!isLoading && !error && (
          <>
            {bets.length > 0 ? (
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="w-full bg-surface">
                  <TabsTrigger value="active" className="flex-1">
                    Active ({activeBets.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">
                    Completed ({completedBets.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4 space-y-3">
                  {activeBets.length > 0 ? (
                    activeBets.map((bet) => <BetCard key={bet.id} bet={bet} />)
                  ) : (
                    <Card className="p-6 bg-surface border-border text-center">
                      <p className="text-sm text-muted-foreground">
                        No active bets. Create one to get started!
                      </p>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-4 space-y-3">
                  {completedBets.length > 0 ? (
                    completedBets.map((bet) => <BetCard key={bet.id} bet={bet} />)
                  ) : (
                    <Card className="p-6 bg-surface border-border text-center">
                      <p className="text-sm text-muted-foreground">
                        No completed bets yet.
                      </p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="p-8 bg-surface border-border text-center">
                <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  No bets yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Put your SOL where your mouth is. Create a bet to commit to your goals.
                </p>
                <Link href="/bets/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Bet
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
