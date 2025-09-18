/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ===== Base Colors =====
        // Primary Color Scale (Purple)
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
          DEFAULT: '#8b5cf6',
        },

        // ===== Custom UI Colors =====
        // Background Colors
        'space-black': {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          dark: '#020617',
        },
        'holographic-white': {
          DEFAULT: '#f8fafc',
          off: '#f1f5f9',
          dark: '#e2e8f0',
        },
        
        // Brand Colors
        'deep-purple': {
          DEFAULT: '#4c1d95',
          light: '#5b21b6',
          dark: '#3b0764',
        },
        'tech-blue': {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        'validation-green': {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },

        // ===== Theme Colors =====
        // Neutral Colors
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },

        // Status Colors
        success: {
          DEFAULT: colors.green[500],
          light: colors.green[400],
          dark: colors.green[600],
        },
        warning: {
          DEFAULT: colors.amber[500],
          light: colors.amber[400],
          dark: colors.amber[600],
        },
        error: {
          DEFAULT: colors.rose[600],
          light: colors.rose[500],
          dark: colors.rose[700],
        },
        info: {
          DEFAULT: colors.blue[500],
          light: colors.blue[400],
          dark: colors.blue[600],
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'glow': '0 0 15px -3px rgb(139, 92, 246, 0.5), 0 4px 6px -4px rgb(139, 92, 246, 0.3)',
        'glow-lg': '0 0 30px -5px rgb(139, 92, 246, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { 'box-shadow': '0 0 30px rgba(139, 92, 246, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'all': 'all',
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          'text-shadow': '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-md': {
          'text-shadow': '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        },
        '.text-shadow-lg': {
          'text-shadow': '0 15px 30px rgba(0,0,0,0.11), 0 5px 15px rgba(0,0,0,0.08)',
        },
        '.text-shadow-none': {
          'text-shadow': 'none',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};