'use client'

import { FC, ReactNode, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta' | 'testnet' || 'devnet'

  const endpoint = useMemo(() => {
    // Use custom RPC if provided, otherwise use default cluster
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
  }, [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Seed Vault (Seeker's native wallet) auto-detects via Standard Wallet interface
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}
