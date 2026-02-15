'use client'

import { FC } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, Trophy, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: typeof Home
  label: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/habits', icon: Target, label: 'Habits' },
  { href: '/bets', icon: Flame, label: 'Bets' },
  { href: '/leaderboard', icon: Trophy, label: 'Rank' },
]

export const BottomNav: FC = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-transform',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive && 'font-bold'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
