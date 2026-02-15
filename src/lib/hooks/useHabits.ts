'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface Action {
  name: string
  points: number
}

interface Habit {
  id: string
  name: string
  description: string | null
  category: string | null
  goal: string | null
  positiveActions: Action[]
  negativeActions: Action[]
  currentStreak: number
  longestStreak: number
  lastLogDate: string | null
  todayPositive: number
  todayNegative: number
  todayLogged: boolean
  createdAt: string
}

interface PresetHabit {
  id: string
  name: string
  description: string | null
  category: string
  goal: string | null
  positiveActions: Action[]
  negativeActions: Action[]
  icon: string
}

interface HabitsState {
  habits: Habit[]
  presets: PresetHabit[]
  isLoading: boolean
  error: string | null
}

interface CreateHabitData {
  name: string
  description?: string
  category?: string
  goal?: string
  positiveActions: Action[]
  negativeActions: Action[]
  isPreset?: boolean
  presetId?: string
}

export function useHabits() {
  const { publicKey } = useWallet()
  const [state, setState] = useState<HabitsState>({
    habits: [],
    presets: [],
    isLoading: true,
    error: null,
  })

  const walletAddress = publicKey?.toBase58()

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    if (!walletAddress) {
      setState((prev) => ({ ...prev, habits: [], isLoading: false }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/habits?wallet=${walletAddress}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch habits')
      }

      setState((prev) => ({
        ...prev,
        habits: data.habits || [],
        isLoading: false,
      }))
    } catch (error) {
      console.error('Error fetching habits:', error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch habits',
        isLoading: false,
      }))
    }
  }, [walletAddress])

  // Fetch presets
  const fetchPresets = useCallback(async () => {
    try {
      const response = await fetch('/api/habits/presets')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch presets')
      }

      setState((prev) => ({
        ...prev,
        presets: data.presets || [],
      }))
    } catch (error) {
      console.error('Error fetching presets:', error)
    }
  }, [])

  // Create habit
  const createHabit = useCallback(
    async (habitData: CreateHabitData) => {
      if (!walletAddress) {
        throw new Error('Wallet not connected')
      }

      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          ...habitData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create habit')
      }

      // Refresh habits list
      await fetchHabits()

      return data.habit
    },
    [walletAddress, fetchHabits]
  )

  // Delete habit
  const deleteHabit = useCallback(
    async (habitId: string) => {
      if (!walletAddress) {
        throw new Error('Wallet not connected')
      }

      const response = await fetch(
        `/api/habits/${habitId}?wallet=${walletAddress}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete habit')
      }

      // Refresh habits list
      await fetchHabits()
    },
    [walletAddress, fetchHabits]
  )

  // Get single habit
  const getHabit = useCallback(
    async (habitId: string) => {
      if (!walletAddress) {
        throw new Error('Wallet not connected')
      }

      const response = await fetch(
        `/api/habits/${habitId}?wallet=${walletAddress}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch habit')
      }

      return data.habit
    },
    [walletAddress]
  )

  // Fetch data on mount and wallet change
  useEffect(() => {
    fetchHabits()
    fetchPresets()
  }, [fetchHabits, fetchPresets])

  return {
    ...state,
    fetchHabits,
    fetchPresets,
    createHabit,
    deleteHabit,
    getHabit,
    walletConnected: !!walletAddress,
  }
}
