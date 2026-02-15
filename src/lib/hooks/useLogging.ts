'use client'

import { useCallback, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { createLogTransaction, confirmTransaction } from '@/lib/solana/transactions'

interface LogActionParams {
  habitId: string
  habitName: string
  actionName: string
  actionType: 'positive' | 'negative'
  points: number
  comment?: string
}

interface LogResult {
  success: boolean
  logId?: string
  txSignature?: string
  pointsEarned?: number
  streak?: number
  error?: string
}

export function useLogging() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [isLogging, setIsLogging] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const logAction = useCallback(
    async (params: LogActionParams): Promise<LogResult> => {
      if (!publicKey || !signTransaction) {
        return { success: false, error: 'Wallet not connected' }
      }

      setIsLogging(true)
      setLastError(null)

      try {
        // Step 1: Create transaction
        const transaction = await createLogTransaction(publicKey, {
          habitId: params.habitId,
          habitName: params.habitName,
          actionName: params.actionName,
          actionType: params.actionType,
          points: params.points,
          timestamp: Date.now(),
        })

        // Step 2: Sign transaction
        const signedTx = await signTransaction(transaction)

        // Step 3: Send transaction
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })

        // Step 4: Confirm transaction
        const confirmed = await confirmTransaction(signature)

        if (!confirmed) {
          throw new Error('Transaction failed to confirm')
        }

        // Step 5: Save to database
        const response = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            habitId: params.habitId,
            actionType: params.actionType,
            actionName: params.actionName,
            comment: params.comment,
            txSignature: signature,
            basePoints: params.points,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save log')
        }

        return {
          success: true,
          logId: data.log?.id,
          txSignature: signature,
          pointsEarned: data.log?.pointsEarned,
          streak: data.streak,
        }
      } catch (error) {
        console.error('Logging error:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'
        setLastError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLogging(false)
      }
    },
    [publicKey, signTransaction, connection]
  )

  return {
    logAction,
    isLogging,
    lastError,
    walletConnected: !!publicKey,
  }
}
