import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

const AUTH_MESSAGE_PREFIX = 'Sign this message to authenticate with Habits.\n\nThis will not trigger a blockchain transaction or cost any gas fees.\n\nTimestamp:'

export function createAuthMessage(timestamp: number = Date.now()): string {
  return `${AUTH_MESSAGE_PREFIX} ${timestamp}`
}

export function verifySignature(
  message: string,
  signature: Uint8Array,
  publicKey: PublicKey
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message)
    return nacl.sign.detached.verify(
      messageBytes,
      signature,
      publicKey.toBytes()
    )
  } catch {
    return false
  }
}

export function isValidTimestamp(timestamp: number, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now()
  return timestamp > now - maxAgeMs && timestamp <= now + 60000 // Allow 1 minute clock skew
}

export function extractTimestampFromMessage(message: string): number | null {
  const match = message.match(/Timestamp: (\d+)/)
  if (!match) return null
  return parseInt(match[1], 10)
}

export interface AuthPayload {
  walletAddress: string
  message: string
  signature: string
}

export function encodeSignature(signature: Uint8Array): string {
  return bs58.encode(signature)
}

export function decodeSignature(signature: string): Uint8Array {
  return bs58.decode(signature)
}
