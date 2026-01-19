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
        cyber: {
          black: '#0a0a0f',
          dark: '#0f0f1a',
          darker: '#1a1a2e',
          'dark-blue': '#0d1117',
          purple: {
            DEFAULT: '#a855f7',
            light: '#c084fc',
            neon: '#d946ef',
            glow: '#e879f9',
          },
          cyan: {
            DEFAULT: '#38bdf8',
            light: '#67e8f9',
            neon: '#22d3ee',
            glow: '#7dd3fc',
            bright: '#0ea5e9',
          },
          blue: {
            DEFAULT: '#3b82f6',
            light: '#60a5fa',
            neon: '#2563eb',
            glow: '#93c5fd',
          },
          green: {
            DEFAULT: '#10b981',
            neon: '#34d399',
            glow: '#6ee7b7',
            bright: '#4ade80',
          },
          red: {
            DEFAULT: '#ef4444',
            neon: '#f87171',
            glow: '#fca5a5',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cyber': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-neon': 'linear-gradient(135deg, #a855f7 0%, #10b981 100%)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'neon-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'neon-cyan': '0 0 20px rgba(56, 189, 248, 0.5)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 40px rgba(168, 85, 247, 0.8)',
        'glow-green': '0 0 40px rgba(16, 185, 129, 0.8)',
        'glow-cyan': '0 0 40px rgba(56, 189, 248, 0.8), 0 0 60px rgba(56, 189, 248, 0.4)',
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.8)',
        'glow-yellow': '0 0 40px rgba(234, 179, 8, 0.8), 0 0 60px rgba(234, 179, 8, 0.4)',
        'glow-red': '0 0 40px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(56, 189, 248, 0.5)',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.5), 0 0 10px rgba(168, 85, 247, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 30px rgba(168, 85, 247, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
