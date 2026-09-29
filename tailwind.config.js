/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        haffer: ["Haffer", "sans-serif"],
      },
      colors: {
        blue: {
          light: "#dbeafe",
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
        },
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate(-50%, 0) scale(1)" },
          "100%": { transform: "translate(-46%, 3%) scale(1.06)" },
        },
        arrowDiagonal: {
          "0%, 100%": { opacity: "1", transform: "translate(0,0)" },
          "45%": { opacity: "0", transform: "translate(9px,-9px)" },
          "55%": { opacity: "0", transform: "translate(-9px,9px)" },
        },
      },
      animation: {
        drift: "drift 24s ease-in-out infinite alternate",
        "arrow-diagonal": "arrowDiagonal 500ms ease",
      },
    },
  },
  plugins: [],
};