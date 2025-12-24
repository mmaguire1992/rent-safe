/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        mainBgGradient:
          "linear-gradient(135deg, rgba(232, 226, 255, 0.3) 0%, rgba(255, 255, 255, 0.9) 57.87%, rgba(249, 249, 252, 0.99) 100%);",
        blueGradient:
          " linear-gradient(289.51deg, #4A2FCC 23.42%, #6B4EFF 76.58%);",
        yellowGradient:
          "linear-gradient(290.38deg, #D56400 25.66%, #F4BA5F 86.6%);",
        BoxGrayBg: "url('/boxgraybg.png')",
        lightGrayGradient:
          "linear-gradient(93.66deg, rgba(232, 226, 255, 0) 2.66%, rgba(232, 226, 255, 0.3) 97.34%);",
        lightGreenGradient:
          "linear-gradient(110.09deg, rgba(223, 255, 230, 0) 18.77%, rgba(223, 255, 230, 0.3) 81.23%);",
        blueWhiteGradient:
          "linear-gradient(135deg, rgba(249, 249, 252, 0.99) 0%, rgba(255, 255, 255, 0.9) 57.87%, rgba(232, 226, 255, 0.3) 100%)",
        lightBlueGradient:
          "linear-gradient(135deg, rgba(232, 226, 255, 0.3) 0%, rgba(255, 255, 255, 0.9) 57.87%, rgba(249, 249, 252, 0.99) 100%)",
        badgeGradient:
          "linear-gradient(90deg, rgba(232, 226, 255, 0.6) 0%, rgba(107, 78, 255, 0.1) 100%)",
        blueGradient1: "linear-gradient(180deg, #6B4EFF 0%, #9B7EFF 100%)",
        blueGradient2:
          "linear-gradient(280.87deg, #6B4EFF 0.28%, #4A2FCC 99.72%);",
        orangeGradient:
          " linear-gradient(290.38deg, #D56400 25.66%, #F4BA5F 86.6%);",
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
