/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'min-512': { 'min': '512px' },
      },
      colors: {
        "bg_color": "#181818",
        "2A2A2A": "#2A2A2A",
        "secondary_bg_color": "#000000",
        "text_color": "#FFFFFF",
        "hint_color": "#959595",
        "hint_bg_color": "#5A5A5A",
        "card_bg_color": "#333333",
        "red": "#F45555",
        "green": "#5AAD5D",
        "blue": "#4556E7"
      }
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/line-clamp')
  ],
  daisyui: {
    themes: [],
  }
}

