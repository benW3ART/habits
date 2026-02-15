'use client'

import { FC } from 'react'

const steps = [
  {
    number: '01',
    title: 'CONNECT',
    description: 'Link your Solana wallet. Phantom or Seed Vault (Seeker).',
  },
  {
    number: '02',
    title: 'CHOOSE',
    description: 'Pick a preset habit or create your own with custom actions.',
  },
  {
    number: '03',
    title: 'LOG',
    description: 'Tap to record actions. Each log = 1 on-chain transaction.',
  },
  {
    number: '04',
    title: 'EARN',
    description: 'Accumulate points. Early users will be rewarded when $HABITS launches.',
  },
]

export const HowItWorks: FC = () => {
  return (
    <section className="py-16 px-4 bg-surface/50">
      <h2 className="text-3xl font-display font-black text-center mb-12">
        GET <span className="text-primary">STARTED</span>
      </h2>

      <div className="max-w-md mx-auto space-y-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-4 relative"
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-12 w-0.5 h-full bg-border" />
            )}

            {/* Number */}
            <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-display font-black text-black">
                {step.number}
              </span>
            </div>

            {/* Content */}
            <div className="pt-1">
              <h3 className="text-lg font-display font-bold text-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
