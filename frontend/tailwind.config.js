/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          blue: '#00f0ff',
          pink: '#ff007f',
          purple: '#9d4edd',
          dark: '#05050a',
          darker: '#010103',
          gray: '#101018',
          card: 'rgba(16, 16, 28, 0.65)',
          light: '#f5f5fc',
          lightCard: 'rgba(255, 255, 255, 0.75)',
        }
      },
      boxShadow: {
        'neon-blue': '0 0 8px rgba(0, 240, 255, 0.6), 0 0 20px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 8px rgba(255, 0, 127, 0.6), 0 0 20px rgba(255, 0, 127, 0.2)',
        'neon-purple': '0 0 8px rgba(157, 78, 221, 0.6), 0 0 20px rgba(157, 78, 221, 0.2)',
        'cyber-inset': 'inset 0 0 12px rgba(0, 240, 255, 0.15)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
        'cyber-grid-light': 'linear-gradient(to right, rgba(157, 78, 221, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(157, 78, 221, 0.05) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
