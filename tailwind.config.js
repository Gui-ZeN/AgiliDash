/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'custom': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
