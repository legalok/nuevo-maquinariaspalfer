/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brass: '#D4AF37',
        'coffee-black': '#0A0A0A',
      },
      fontFamily: {
        display: ['Syncopate', 'sans-serif'],
        sans: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
