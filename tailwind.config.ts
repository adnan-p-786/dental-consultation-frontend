import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16241F",
        "ink-soft": "#4B5C55",
        paper: "#F3F7F4",
        "teal-deep": "#103832",
        "teal-mid": "#1E5A50",
        mint: "#4FA98A",
        "mint-deep": "#3A8A70",
        line: "#DCE6E0",
        "line-soft": "#EAF0EC",
        error: "#B4483A",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(.2,.7,.3,1) 0.15s forwards",
      },
    },
  },
  plugins: [],
};

export default config;