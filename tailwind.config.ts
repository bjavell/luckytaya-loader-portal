import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'yellow-green': 'linear-gradient(to right, #C1C957, #73984F)',
        'darkGrey-mattBlack': 'linear-gradient(to right, #242424, #242424)'
      },
      colors: {
        darkGrey: '#242424',
        semiBlack: '#101010',
        cursedBlack: '#131313',
        semiYellow: '#EFE65C',
        yellow: '#C1C957',
        red: '#ED3939',
        neutralGray: '#C3C3C3',
        lightGreen: '#73984F',
        gray13: '#212121',
        green: '#608C4D',
        codGray: '#090909'
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        'sans-light': ['Open Sans Light', 'sans-serif']
      },
      borderRadius: {
        xlg: '15px'
      },
      height: {
        '96.75' : '27.563rem'
      }
    },
  },
  plugins: [],
};
export default config;
