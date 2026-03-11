/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Light theme base (remapped)
        dark: {
          50: '#f8fafc',
          100: '#1e293b',
          200: '#334155',
          300: '#6b7280',
          400: '#9ca3af',
          500: '#d1d5db',
          600: '#e5e7eb',
          700: '#f3f4f6',
          800: '#ffffff',
          900: '#ffffff',
          950: '#f9fafb',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
        },
        success: {
          50: '#ecfdf5',
          400: '#34d399',
          500: '#10b981',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          400: '#f87171',
          500: '#ef4444',
          700: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
}
