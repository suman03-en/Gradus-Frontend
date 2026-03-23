import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          50: '#eefcf9',
          100: '#d7f7ef',
          200: '#aeeedf',
          300: '#7edfc9',
          400: '#49c8ad',
          500: '#23ac92',
          600: '#178a76',
          700: '#166f62',
          800: '#16594f',
          900: '#154a43',
        },
      },
    },
  },
  plugins: [],
}
