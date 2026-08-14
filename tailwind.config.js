/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        zen: {
          cream: '#FDFBE4',
          forest: '#1B3B2B',
          'forest-muted': '#2D4A3A',
          mist: '#E8E4D4',
          border: '#D4D0C0',
          muted: '#8A8A7A',
          growth: '#4A8C4D',
        },
        block: {
          bg: '#121212',
          card: '#252528',
          surface: '#2F2F33',
          lavender: '#C2C1FD',
          muted: '#9A9AA3',
        },
      },
    },
  },
  plugins: [],
};
