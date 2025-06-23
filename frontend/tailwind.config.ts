import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray': {
          50: '#f8f9fa',
          100: '#f1f3f4',
          900: '#2d3748',
          800: '#4a5568',
        },
        'peach': {
          100: '#ffc4b5',
          300: '#ffb3a7',
          500: '#ff9999',
        }
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px #ff9999' },
          '50%': { boxShadow: '0 0 20px #ff9999, 0 0 30px #ff9999' },
          '100%': { boxShadow: '0 0 5px #ff9999' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config
