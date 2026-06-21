/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          maroon: "#800020",
          gold: "#D4AF37",
        },
        background: "#FFFFFF",
        text: {
          dark: "#333333",
          light: "#666666",
        },
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 40px rgba(128, 0, 32, 0.1)",
        gold: "0 5px 20px rgba(212, 175, 55, 0.2)",
      },
    },
  },
  plugins: [],
};
