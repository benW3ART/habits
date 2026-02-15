import { Connection, clusterApiUrl } from '@solana/web3.js'

// Singleton connection instance
let connection: Connection | null = null

export function getConnection(): Connection {
  if (!connection) {
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      clusterApiUrl(
        (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta' | 'testnet') ||
          'devnet'
      )

    connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    })
  }

  return connection
}

export function getNetwork(): 'mainnet-beta' | 'devnet' | 'testnet' {
  return (
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'mainnet-beta' | 'devnet' | 'testnet') ||
    'devnet'
  )
}

export function getSolscanUrl(signature: string): string {
  const network = getNetwork()
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`
  return `https://solscan.io/tx/${signature}${cluster}`
}
