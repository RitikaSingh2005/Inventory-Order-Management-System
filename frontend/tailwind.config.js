/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkest: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        primary: '#f1f5f9',
        secondary: '#94a3b8',
        accentPink: '#ec4899',
        accentPurple: '#a855f7',
        accentYellow: '#eab308',
        accentBlue: '#1e3a8a',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
