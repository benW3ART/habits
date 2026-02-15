'use client'

import { FC } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@/components/wallet/ConnectButton'

interface HeaderProps {
  showWallet?: boolean
}

export const Header: FC<HeaderProps> = ({ showWallet = true }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-display font-black text-primary tracking-tight">
            HABITS
          </span>
        </Link>
        {showWallet && <ConnectButton size="sm" />}
      </div>
    </header>
  )
}
