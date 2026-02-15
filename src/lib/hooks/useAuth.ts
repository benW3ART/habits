'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createAuthMessage, encodeSignature } from '@/lib/solana/auth'

interface User {
  id: string
  walletAddress: string
  username: string | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export function useAuth() {
  const { publicKey, signMessage, connected, disconnect } = useWallet()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  })

  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setAuthState((prev) => ({
        ...prev,
        error: 'Wallet not connected or does not support message signing',
      }))
      return
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Create auth message
      const message = createAuthMessage()
      const messageBytes = new TextEncoder().encode(message)

      // Request signature
      const signature = await signMessage(messageBytes)
      const encodedSignature = encodeSignature(signature)

      // Send to API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          message,
          signature: encodedSignature,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      setAuthState({
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })

      // Store in localStorage for persistence
      localStorage.setItem('habits_user', JSON.stringify(data.user))
    } catch (error) {
      console.error('Auth error:', error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }))
    }
  }, [publicKey, signMessage])

  const logout = useCallback(async () => {
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    })
    localStorage.removeItem('habits_user')
    await disconnect()
  }, [disconnect])

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('habits_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        })
      } catch {
        localStorage.removeItem('habits_user')
      }
    }
  }, [])

  // Clear auth when wallet disconnects
  useEffect(() => {
    if (!connected && authState.isAuthenticated) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      })
      localStorage.removeItem('habits_user')
    }
  }, [connected, authState.isAuthenticated])

  return {
    ...authState,
    authenticate,
    logout,
    walletConnected: connected,
    walletAddress: publicKey?.toBase58() || null,
  }
}
