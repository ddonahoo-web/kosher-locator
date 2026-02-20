/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#16a34a',
          dark: '#15803d',
          light: '#22c55e',
        },
      },
      minHeight: {
        'map-mobile': '400px',
        'map-desktop': '70vh',
      },
    },
  },
  plugins: [],
}
