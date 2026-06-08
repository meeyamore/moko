/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#E6F1FB', 100: '#B5D4F4', 200: '#85B7EB',
          300: '#378ADD', 400: '#185FA5', 500: '#0C447C', 600: '#042C53',
        },
        success: { light: '#EAF3DE', DEFAULT: '#3B6D11', dark: '#27500A' },
        warning: { light: '#FAEEDA', DEFAULT: '#854F0B', dark: '#633806' },
        danger:  { light: '#FCEBEB', DEFAULT: '#A32D2D', dark: '#791F1F' },
        neutral: {
          50: '#F8F7F4', 100: '#EFEFEC', 200: '#DDDDD8',
          300: '#C5C4BE', 400: '#9A9892', 500: '#6E6D67',
          600: '#4A4945', 700: '#32312E', 800: '#1E1D1B',
        },
      },
      borderRadius: {
        DEFAULT: '8px', lg: '12px', xl: '16px', '2xl': '20px',
      },
    },
  },
  plugins: [],
}
