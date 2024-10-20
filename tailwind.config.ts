import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'yellow-green': 'linear-gradient(to right, #C1C957, #73984F)'
      },
      colors: {
        semiBlack: '#101010',
        cursedBlack: '#131313',
        semiYellow: '#EFE65C',
        yellow: '#C1C957',
        red: '#EFE65C',
        neutralGray: '#C3C3C3',
        lightGreen: '#73984F',
        gray13: '#212121',
        green: '#608C4D'
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        'sans-light': ['Open Sans Light', 'sans-serif']
      },
      borderRadius: {
        xlg: '15px'
      }
    },
  },
  plugins: [],
};
export default config;
