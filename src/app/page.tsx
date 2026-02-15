import { Hero, Features, HowItWorks, TokenTeaser, CTA } from '@/components/landing'
import { Header } from '@/components/layout'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header showWallet={true} />
      <div className="pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <TokenTeaser />
        <CTA />

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Built with love on Solana
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2024 Habits. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  )
}
