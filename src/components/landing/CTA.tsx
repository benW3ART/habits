'use client'

import { FC } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const CTA: FC = () => {
  const { connected } = useWallet()
  const { setVisible } = useWalletModal()
  const router = useRouter()

  const handleCTA = () => {
    if (connected) {
      router.push('/dashboard')
    } else {
      setVisible(true)
    }
  }

  return (
    <section className="py-20 px-4 text-center">
      <h2 className="text-4xl font-display font-black text-foreground mb-4">
        READY TO
        <br />
        <span className="text-primary">CHANGE?</span>
      </h2>

      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        Join thousands of users who are betting on themselves
        and building better habits on Solana.
      </p>

      <Button size="lg" onClick={handleCTA} className="group">
        {connected ? 'OPEN DASHBOARD' : 'START NOW'}
        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      <p className="text-xs text-muted-foreground mt-6">
        Free to use. Only pay for bets (optional).
      </p>
    </section>
  )
}
