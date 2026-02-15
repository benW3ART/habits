'use client'

import { FC } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'

export const Hero: FC = () => {
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
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-12 text-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,230,0,0.1),transparent_50%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      {/* Badge */}
      <div className="relative mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-primary/30 text-sm font-medium">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Built on</span>
          <span className="text-primary font-bold">Solana</span>
        </div>
      </div>

      {/* Main heading */}
      <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-display font-black text-foreground leading-[0.9] tracking-tight mb-6">
        CHANGE
        <br />
        <span className="text-primary">2EARN</span>
      </h1>

      {/* Subheading */}
      <p className="relative text-lg sm:text-xl text-muted-foreground max-w-md mb-8 font-body">
        Log your habits. Build streaks.
        <br />
        <span className="text-foreground font-semibold">Every action earns rewards.</span>
      </p>

      {/* CTA */}
      <div className="relative flex flex-col gap-4 w-full max-w-xs">
        <Button size="lg" onClick={handleCTA} className="w-full group">
          {connected ? 'GO TO DASHBOARD' : 'CONNECT WALLET'}
          <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="text-xs text-muted-foreground">
          No gas fees for logging. Just sign and go.
        </p>
      </div>

      {/* Stats preview - Early adopter messaging */}
      <div className="relative mt-16 grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-2xl sm:text-3xl font-display font-black text-primary">🚀</div>
          <div className="text-xs text-muted-foreground">EARLY ACCESS</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-display font-black text-primary">∞</div>
          <div className="text-xs text-muted-foreground">POTENTIAL</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-display font-black text-primary">0</div>
          <div className="text-xs text-muted-foreground">GAS FEES</div>
        </div>
      </div>
    </section>
  )
}
