import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bold Minimal Design System
        primary: {
          DEFAULT: '#FFE600',
          hover: '#FFF033',
          muted: 'rgba(255, 230, 0, 0.2)',
        },
        background: '#000000',
        surface: {
          DEFAULT: '#111111',
          hover: '#1A1A1A',
        },
        border: {
          DEFAULT: '#222222',
          active: '#FFE600',
        },
        text: {
          DEFAULT: '#FFFFFF',
          muted: '#888888',
          inactive: '#444444',
        },
        success: {
          DEFAULT: '#FFE600',
          bg: 'rgba(255, 230, 0, 0.15)',
        },
        danger: {
          DEFAULT: '#FF4444',
          bg: 'rgba(255, 68, 68, 0.15)',
          muted: '#666666',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 230, 0, 0.3)',
        'glow-strong': '0 0 40px rgba(255, 230, 0, 0.5)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
