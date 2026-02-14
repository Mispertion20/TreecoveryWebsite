/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          forest: '#2D5016',
          emerald: '#059669',
          sage: '#A4C2A5',
          // Premium dark mode greens - brighter and more vibrant
          'emerald-dark': '#10B981', // Vibrant emerald for dark mode
          'bright': '#34D399', // Lighter emerald for accents
          'muted': '#6EE7B7', // Very light for subtle elements
        },
        secondary: {
          sky: '#0EA5E9',
          earth: '#92400E',
          // Dark mode variants
          'sky-dark': '#60A5FA', // Sky blue for dark mode
          'earth-dark': '#F59E0B', // Warmer earth tone for dark mode
        },
        neutral: {
          offwhite: '#FAFAF9',
          charcoal: '#1C1917',
          // Premium dark theme backgrounds (green-tinted, not pure black)
          'dark-bg-primary': '#0A0E0D', // Very dark green-tinted black
          'dark-bg-secondary': '#111716', // Slightly lighter with green tint
          'dark-bg-tertiary': '#1A201E', // Card backgrounds, elevated surfaces
          'dark-bg-elevated': '#212928', // Hover states, modals
          // Text colors for dark mode (high contrast)
          'dark-text-primary': '#F9FAFB', // Almost white - main headings
          'dark-text-secondary': '#E5E7EB', // Light gray - body text
          'dark-text-tertiary': '#9CA3AF', // Medium gray - captions, labels
          'dark-text-disabled': '#6B7280', // Dark gray - disabled states
          'dark-text-on-green': '#FFFFFF', // White text on green buttons
          'dark-text-accent': '#34D399', // Green text for highlights
        },
        accent: {
          golden: '#FCD34D', // Golden yellow for CTAs, highlights
          blue: '#60A5FA', // Sky blue for info, links
          purple: '#A78BFA', // Soft purple for special features
        },
        status: {
          success: '#10B981', // Green - alive trees
          warning: '#F59E0B', // Amber - needs attention
          error: '#EF4444', // Red - dead/critical
          info: '#3B82F6', // Blue - recently planted
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'sage-gradient': 'linear-gradient(135deg, #F0F5F1 0%, #E8F3E9 100%)',
        'forest-gradient': 'linear-gradient(135deg, #2D5016 0%, #1a3009 100%)',
        // Premium dark mode gradients
        'dark-hero': 'linear-gradient(135deg, #0A0E0D 0%, #0F1614 50%, #1A3A2E 100%)',
        'dark-surface': 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
        'dark-surface-hover': 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03))',
        'dark-map': 'linear-gradient(180deg, #0A0E0D 0%, #0F1C17 50%, #1A3A2E 100%)',
        'dark-stats': 'linear-gradient(180deg, #050807 0%, #0A0E0D 50%, #050807 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'emerald-bright-gradient': 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
      },
      boxShadow: {
        'glow-green': '0 0 40px rgba(16, 185, 129, 0.15)',
        'glow-green-lg': '0 0 60px rgba(16, 185, 129, 0.3)',
        'glow-green-button': '0 4px 20px rgba(16, 185, 129, 0.4)',
        'glow-green-button-hover': '0 6px 30px rgba(16, 185, 129, 0.6)',
        'soft-dark': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-dark': '0 8px 32px rgba(16, 185, 129, 0.15)',
        'card-dark-hover': '0 20px 60px rgba(16, 185, 129, 0.15)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'background-shift': 'backgroundShift 15s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)' },
        },
        'shimmer': {
          '100%': { left: '100%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'backgroundShift': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
