/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ft-blue': '#0A76F6',
        'ft-darkblue': '#0053B3',
        'ft-lightblue': '#E8F1FA',
        'ft-gray': '#F2F2F7',
        'ft-darkgray': '#6A6A6A',
      },
    },
  },
  plugins: [],
}
