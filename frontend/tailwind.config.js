/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff8ed",
        lavender: "#e9ddff",
        blush: "#ffe4ec",
        rose: "#c65f7b",
        plum: "#513252",
        gold: "#c99a2e",
        ink: "#2b2630",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        aura: "0 18px 50px rgba(81, 50, 82, 0.13)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.55s ease-out both",
        floatSoft: "floatSoft 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
