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
        background: '#0A0A0B', // Deep dark slate
        surface: '#121214',    // Slightly lighter dark for cards
        primary: '#A4FF23',    // Keep Lime Green
        secondary: '#FFB800', 
        accent: '#3D8BFF', 
        muted: '#A1A1AA',      // Gray-400 for better contrast on dark
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
