'use client'

import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Target, Flame, Trophy, Coins, Brain, Shield } from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'TRACK ANYTHING',
    description: 'Log positive and negative habits. No shame, just honesty.',
    color: 'text-green-400',
  },
  {
    icon: Flame,
    title: 'BUILD STREAKS',
    description: 'Consistency is key. Longer streaks = bigger rewards.',
    color: 'text-orange-400',
  },
  {
    icon: Coins,
    title: 'BET ON YOURSELF',
    description: 'Stake SOL on your goals. Win it back (plus bonus) or lose it.',
    color: 'text-primary',
  },
  {
    icon: Trophy,
    title: 'CLIMB THE RANKS',
    description: 'Compete on the leaderboard. Top performers get extra points.',
    color: 'text-purple-400',
  },
  {
    icon: Brain,
    title: 'AI INSIGHTS',
    description: 'Coming soon: Personalized tips based on your patterns.',
    color: 'text-blue-400',
  },
  {
    icon: Shield,
    title: 'ON-CHAIN PROOF',
    description: 'Every log is a Solana transaction. Immutable accountability.',
    color: 'text-cyan-400',
  },
]

export const Features: FC = () => {
  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-display font-black text-center mb-12">
        HOW IT <span className="text-primary">WORKS</span>
      </h2>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className="p-4 bg-surface border-border hover:border-primary/50 transition-colors"
            >
              <Icon className={`w-8 h-8 ${feature.color} mb-3`} />
              <h3 className="text-sm font-display font-bold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
