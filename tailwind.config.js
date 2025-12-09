/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        mainBgGradient:
          "linear-gradient(135deg, rgba(232, 226, 255, 0.3) 0%, rgba(255, 255, 255, 0.9) 57.87%, rgba(249, 249, 252, 0.99) 100%);",
        blueGradient:
          " linear-gradient(289.51deg, #4A2FCC 23.42%, #6B4EFF 76.58%);",
        yellowGradient:
          "linear-gradient(290.38deg, #D56400 25.66%, #F4BA5F 86.6%);",
      },
      colors: {
        primary: "#2177CE",
        secondary: "#2B2F38",
        darkGray: "#5A5E67",
        lightGray: "#E6E8EC",
        yellow: "#D19600",
        errorColor: "#D24343",
        successColor: "#00893A",
        midGray: "#9FA3AA",
        mainBlue: "#6B4EFF",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        quicksand: ["Quicksand", "sans-serif"],
      },
    },
  },
  plugins: [],
};
