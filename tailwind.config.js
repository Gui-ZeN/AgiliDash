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
        primary: {
          DEFAULT: '#0e4f6d',
          light: '#1e5466',
          dark: '#0a3a4f',
        },
        secondary: {
          DEFAULT: '#58a3a4',
          light: '#6bb3b4',
          dark: '#42878e',
        },
        accent: {
          cyan: '#06b6d4',
          teal: '#2c6d7a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem',      // Cards padrão
        'card-lg': '1.5rem', // Cards grandes
        'card-xl': '2rem',   // Cards destaque
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
