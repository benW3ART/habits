'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export interface Bet {
  id: string
  habitId: string | null
  goalDescription: string
  stakeAmount: number // in lamports
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

export interface CreateBetData {
  goalDescription: string
  stakeAmount: number // in SOL (convert to lamports when sending)
  durationDays: number
  dailyLogRequired: boolean
  habitId?: string
  stakeTxSignature?: string
}

interface BetsState {
  bets: Bet[]
  isLoading: boolean
  error: string | null
}

const LAMPORTS_PER_SOL = 1_000_000_000

export function useBets() {
  const { publicKey } = useWallet()
  const [state, setState] = useState<BetsState>({
    bets: [],
    isLoading: true,
    error: null,
  })

  const walletAddress = publicKey?.toBase58()

  // Fetch bets
  const fetchBets = useCallback(async () => {
    if (!walletAddress) {
      setState((prev) => ({ ...prev, bets: [], isLoading: false }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/bets?wallet=${walletAddress}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bets')
      }

      setState((prev) => ({
        ...prev,
        bets: data.bets || [],
        isLoading: false,
      }))
    } catch (error) {
      console.error('Error fetching bets:', error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch bets',
        isLoading: false,
      }))
    }
  }, [walletAddress])

  // Create bet
  const createBet = useCallback(
    async (betData: CreateBetData): Promise<Bet> => {
      if (!walletAddress) {
        throw new Error('Wallet not connected')
      }

      // Convert SOL to lamports
      const stakeAmountLamports = Math.round(betData.stakeAmount * LAMPORTS_PER_SOL)

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          goalDescription: betData.goalDescription,
          stakeAmount: stakeAmountLamports,
          durationDays: betData.durationDays,
          dailyLogRequired: betData.dailyLogRequired,
          habitId: betData.habitId,
          stakeTxSignature: betData.stakeTxSignature,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bet')
      }

      // Refresh bets list
      await fetchBets()

      return data.bet
    },
    [walletAddress, fetchBets]
  )

  // Get single bet
  const getBet = useCallback(
    async (betId: string): Promise<Bet> => {
      if (!walletAddress) {
        throw new Error('Wallet not connected')
      }

      const response = await fetch(
        `/api/bets/${betId}?wallet=${walletAddress}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bet')
      }

      return data.bet
    },
    [walletAddress]
  )

  // Fetch data on mount and wallet change
  useEffect(() => {
    fetchBets()
  }, [fetchBets])

  return {
    ...state,
    fetchBets,
    createBet,
    getBet,
    walletConnected: !!walletAddress,
  }
}
