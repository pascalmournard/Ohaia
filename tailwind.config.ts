import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chalk: '#FAFAF7',
        sand: '#F5F0E8',
        charcoal: '#1C1C1A',
        forest: '#2D4A3E',
        earth: '#4A3520',
        slate: '#2A3D52',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        pill: '100px',
      },
      borderWidth: {
        thin: '0.5px',
      },
      fontSize: {
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(28, 28, 26, 0.06), 0 1px 2px rgba(28, 28, 26, 0.04)',
        'card-hover': '0 4px 12px rgba(28, 28, 26, 0.1), 0 2px 4px rgba(28, 28, 26, 0.06)',
        'input-focus': '0 0 0 3px rgba(28, 28, 26, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
