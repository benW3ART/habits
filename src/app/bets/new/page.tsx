'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { MobileLayout } from '@/components/layout'
import { BetForm } from '@/components/bets'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createBetEscrowTransaction, confirmTransaction } from '@/lib/solana/transactions'

interface Habit {
  id: string
  name: string
}

interface CreateBetData {
  goalDescription: string
  stakeAmount: number // in SOL
  durationDays: number
  dailyLogRequired: boolean
  habitId?: string
}

export default function NewBetPage() {
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoadingHabits, setIsLoadingHabits] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHabits = useCallback(async () => {
    if (!publicKey) return

    try {
      const response = await fetch(`/api/habits?wallet=${publicKey.toBase58()}`)
      const data = await response.json()

      if (response.ok) {
        setHabits(data.habits || [])
      }
    } catch (err) {
      console.error('Error fetching habits:', err)
    } finally {
      setIsLoadingHabits(false)
    }
  }, [publicKey])

  useEffect(() => {
    if (!connected) {
      router.push('/')
    } else {
      fetchHabits()
    }
  }, [connected, router, fetchHabits])

  if (!connected || !publicKey || !signTransaction) {
    return null
  }

  const handleSubmit = async (data: CreateBetData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Generate a temporary bet ID for the escrow transaction
      const tempBetId = crypto.randomUUID()

      // Step 1: Create and sign escrow transaction
      const { transaction } = await createBetEscrowTransaction(
        publicKey,
        data.stakeAmount,
        tempBetId
      )

      const signedTx = await signTransaction(transaction)

      // Step 2: Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })

      // Step 3: Confirm transaction
      const confirmed = await confirmTransaction(signature)

      if (!confirmed) {
        throw new Error('Transaction failed to confirm')
      }

      // Step 4: Create bet in database
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + data.durationDays)

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          goalDescription: data.goalDescription,
          stakeAmount: Math.round(data.stakeAmount * LAMPORTS_PER_SOL),
          stakeTxSignature: signature,
          durationDays: data.durationDays,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dailyLogRequired: data.dailyLogRequired,
          habitId: data.habitId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create bet')
      }

      // Success - redirect to bets page
      router.push('/bets')
    } catch (err) {
      console.error('Error creating bet:', err)
      setError(err instanceof Error ? err.message : 'Failed to create bet')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/bets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-display font-black text-foreground">
              NEW BET
            </h1>
            <p className="text-sm text-muted-foreground">
              Stake SOL on your commitment
            </p>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoadingHabits ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <BetForm
            habits={habits}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </MobileLayout>
  )
}
