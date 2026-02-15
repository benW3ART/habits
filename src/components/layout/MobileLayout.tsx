'use client'

import { FC, ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface MobileLayoutProps {
  children: ReactNode
  showHeader?: boolean
  showNav?: boolean
  showWallet?: boolean
}

export const MobileLayout: FC<MobileLayoutProps> = ({
  children,
  showHeader = true,
  showNav = true,
  showWallet = true,
}) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header showWallet={showWallet} />}
      <main
        className={`
          max-w-md mx-auto
          ${showHeader ? 'pt-16' : ''}
          ${showNav ? 'pb-20' : ''}
        `}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
