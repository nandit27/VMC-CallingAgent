/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF', // Pure White
        surface: '#FFFFFF',    // White for cards
        primary: '#A4FF23',    // Keep Lime Green
        secondary: '#FFB800', 
        accent: '#3D8BFF', 
        muted: '#6B7280',      // Gray-500
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
