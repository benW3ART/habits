'use client'

import { FC, useCallback, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'

interface ConnectButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export const ConnectButton: FC<ConnectButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
}) => {
  const { publicKey, disconnect, connecting, connected } = useWallet()
  const { setVisible } = useWalletModal()

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])

  const truncatedAddress = useMemo(() => {
    if (!base58) return null
    return `${base58.slice(0, 4)}...${base58.slice(-4)}`
  }, [base58])

  const handleClick = useCallback(() => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }, [connected, disconnect, setVisible])

  const buttonText = useMemo(() => {
    if (connecting) return 'CONNECTING...'
    if (connected && truncatedAddress) return truncatedAddress
    return 'CONNECT WALLET'
  }, [connecting, connected, truncatedAddress])

  return (
    <Button
      onClick={handleClick}
      variant={connected ? 'outline' : variant}
      size={size}
      className={className}
      disabled={connecting}
    >
      {buttonText}
    </Button>
  )
}
