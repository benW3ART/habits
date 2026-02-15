import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { getConnection } from './client'
import * as crypto from 'crypto'

// Memo program ID (SPL Memo v2)
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

// Habits Escrow Program ID
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || '93KHLZAXkWKy6yAqoH8NNFDngShAr61sea3nVCnFJxCE'
)

// Memo prefix for SKR eligibility
const MEMO_PREFIX = 'HABITS:'

// Instruction discriminators (from IDL)
const CREATE_BET_DISCRIMINATOR = Buffer.from([197, 42, 153, 2, 59, 63, 143, 246])

export interface LogActionData {
  habitId: string
  habitName: string
  actionName: string
  actionType: 'positive' | 'negative'
  points: number
  timestamp: number
}

export interface CreateBetData {
  betId: string // UUID that will be hashed to 32 bytes
  amount: number // in lamports
  habitId: string
  startDate: number // unix timestamp
  endDate: number // unix timestamp
  targetStreak: number
}

/**
 * Get the Config PDA address
 */
export function getConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  )
}

/**
 * Get the Bet PDA address for a user and bet ID
 */
export function getBetPda(userPubkey: PublicKey, betId: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), userPubkey.toBuffer(), Buffer.from(betId)],
    PROGRAM_ID
  )
}

/**
 * Convert a bet UUID to a 32-byte array
 */
export function betIdToBytes(betId: string): Uint8Array {
  // Hash the UUID to get exactly 32 bytes
  const hash = crypto.createHash('sha256').update(betId).digest()
  return new Uint8Array(hash)
}

/**
 * Encode a u64 as little-endian bytes
 */
function encodeU64(value: number | bigint): Buffer {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64LE(BigInt(value))
  return buf
}

/**
 * Encode an i64 as little-endian bytes
 */
function encodeI64(value: number | bigint): Buffer {
  const buf = Buffer.alloc(8)
  buf.writeBigInt64LE(BigInt(value))
  return buf
}

/**
 * Encode a u32 as little-endian bytes
 */
function encodeU32(value: number): Buffer {
  const buf = Buffer.alloc(4)
  buf.writeUInt32LE(value)
  return buf
}

/**
 * Encode a string with length prefix (Borsh format)
 */
function encodeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, 'utf-8')
  const lenBuffer = Buffer.alloc(4)
  lenBuffer.writeUInt32LE(strBuffer.length)
  return Buffer.concat([lenBuffer, strBuffer])
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
 * Create a bet escrow transaction using the Habits Escrow smart contract.
 * This creates a PDA that holds the escrowed SOL.
 */
export async function createBetEscrowTransaction(
  walletPubkey: PublicKey,
  stakeAmount: number, // in SOL
  betId: string
): Promise<{ transaction: Transaction; betPda: PublicKey; betIdBytes: Uint8Array }> {
  const connection = getConnection()

  // Convert bet ID to bytes
  const betIdBytes = betIdToBytes(betId)
  
  // Get PDAs
  const [configPda] = getConfigPda()
  const [betPda] = getBetPda(walletPubkey, betIdBytes)

  // Default values for the bet
  const amountLamports = Math.round(stakeAmount * LAMPORTS_PER_SOL)
  const startDate = Math.floor(Date.now() / 1000)
  const endDate = startDate + 7 * 24 * 60 * 60 // 7 days default
  const targetStreak = 7
  const habitId = 'default'

  // Build instruction data
  // Format: discriminator + bet_id (32 bytes) + amount (u64) + habit_id (string) + start_date (i64) + end_date (i64) + target_streak (u32)
  const instructionData = Buffer.concat([
    CREATE_BET_DISCRIMINATOR,
    Buffer.from(betIdBytes),
    encodeU64(amountLamports),
    encodeString(habitId),
    encodeI64(startDate),
    encodeI64(endDate),
    encodeU32(targetStreak),
  ])

  // Create the instruction
  const createBetInstruction = new TransactionInstruction({
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: false },
      { pubkey: betPda, isSigner: false, isWritable: true },
      { pubkey: walletPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })

  // Create memo for bet tracking (for SKR eligibility)
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
    .add(createBetInstruction)
    .add(memoInstruction)

  return { transaction, betPda, betIdBytes }
}

/**
 * Create a full bet escrow transaction with custom parameters.
 */
export async function createFullBetEscrowTransaction(
  walletPubkey: PublicKey,
  data: CreateBetData
): Promise<{ transaction: Transaction; betPda: PublicKey; betIdBytes: Uint8Array }> {
  const connection = getConnection()

  // Convert bet ID to bytes
  const betIdBytes = betIdToBytes(data.betId)
  
  // Get PDAs
  const [configPda] = getConfigPda()
  const [betPda] = getBetPda(walletPubkey, betIdBytes)

  // Build instruction data
  const instructionData = Buffer.concat([
    CREATE_BET_DISCRIMINATOR,
    Buffer.from(betIdBytes),
    encodeU64(data.amount),
    encodeString(data.habitId.slice(0, 64)), // Max 64 chars
    encodeI64(data.startDate),
    encodeI64(data.endDate),
    encodeU32(data.targetStreak),
  ])

  // Create the instruction
  const createBetInstruction = new TransactionInstruction({
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: false },
      { pubkey: betPda, isSigner: false, isWritable: true },
      { pubkey: walletPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  })

  // Create memo for bet tracking
  const memoMessage = `${MEMO_PREFIX}BET:${data.betId}`
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
    .add(createBetInstruction)
    .add(memoInstruction)

  return { transaction, betPda, betIdBytes }
}

/**
 * Get the program ID
 */
export function getProgramId(): PublicKey {
  return PROGRAM_ID
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
