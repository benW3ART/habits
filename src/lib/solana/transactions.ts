import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { getConnection } from './client'

// Memo program ID (SPL Memo v2)
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

// Memo prefix for SKR eligibility
const MEMO_PREFIX = 'HABITS:'

export interface LogActionData {
  habitId: string
  habitName: string
  actionName: string
  actionType: 'positive' | 'negative'
  points: number
  timestamp: number
}

/**
 * Create a memo transaction for logging a habit action.
 * Uses SPL Memo program for minimal cost (~0.000005 SOL).
 * Optimized for SKR Season 2 transaction eligibility.
 */
export async function createLogTransaction(
  walletPubkey: PublicKey,
  data: LogActionData
): Promise<Transaction> {
  const connection = getConnection()

  // Create compact memo message
  const memoData = {
    h: data.habitId.slice(0, 8), // Habit ID prefix (compact)
    a: data.actionName.slice(0, 32), // Action name (truncated)
    t: data.actionType === 'positive' ? 'p' : 'n', // Type: p or n
    p: data.points, // Points
    ts: data.timestamp, // Timestamp
  }

  const memoMessage = `${MEMO_PREFIX}${JSON.stringify(memoData)}`

  // Create memo instruction
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoMessage, 'utf-8'),
  })

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  // Create transaction
  const transaction = new Transaction({
    feePayer: walletPubkey,
    blockhash,
    lastValidBlockHeight,
  }).add(memoInstruction)

  return transaction
}

/**
 * Create escrow transaction for betting.
 * For MVP, this sends SOL to a designated escrow wallet (admin-controlled).
 */
export async function createBetEscrowTransaction(
  walletPubkey: PublicKey,
  stakeAmount: number, // in SOL
  betId: string
): Promise<Transaction> {
  const connection = getConnection()

  // Escrow wallet address (MUST be configured in env)
  const escrowWallet = process.env.NEXT_PUBLIC_ESCROW_WALLET
  if (!escrowWallet) {
    throw new Error(
      'NEXT_PUBLIC_ESCROW_WALLET is not configured. ' +
      'This is required for bet escrow functionality. ' +
      'Please set this environment variable to a valid Solana wallet address.'
    )
  }
  
  const escrowPubkey = new PublicKey(escrowWallet)

  // Create transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: walletPubkey,
    toPubkey: escrowPubkey,
    lamports: Math.round(stakeAmount * LAMPORTS_PER_SOL),
  })

  // Create memo for bet tracking
  const memoMessage = `${MEMO_PREFIX}BET:${betId}`
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoMessage, 'utf-8'),
  })

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  // Create transaction
  const transaction = new Transaction({
    feePayer: walletPubkey,
    blockhash,
    lastValidBlockHeight,
  })
    .add(transferInstruction)
    .add(memoInstruction)

  return transaction
}

/**
 * Estimate transaction fee
 */
export async function estimateFee(transaction: Transaction): Promise<number> {
  const connection = getConnection()
  const fee = await transaction.getEstimatedFee(connection)
  return fee ? fee / LAMPORTS_PER_SOL : 0.000005 // Default memo tx fee
}

/**
 * Confirm transaction with retry
 */
export async function confirmTransaction(
  signature: string,
  maxRetries: number = 3
): Promise<boolean> {
  const connection = getConnection()

  for (let i = 0; i < maxRetries; i++) {
    try {
      const { value } = await connection.confirmTransaction(signature, 'confirmed')
      return !value.err
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  return false
}
