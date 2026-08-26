/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0d1117',
        'card-bg': '#161b22',
        'border-dark': '#30363d',
        'text-dim': '#8b949e',
        'text-light': '#c9d1d9',
        'accent': '#58a6ff',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-fira-code)', 'monospace'],
      }
    },
  },
  plugins: [],
}