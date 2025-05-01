/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'space-black': '#181A20',
        'deep-purple': '#4B0082',
        'tech-blue': '#2A5C8A',
        'validation-green': '#28A745',
        'holographic-white': '#F8F9FA',
        'flame-red': '#E25822',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Lato', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(75, 0, 130, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(75, 0, 130, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};