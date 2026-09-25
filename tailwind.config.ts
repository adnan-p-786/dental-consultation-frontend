import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#261B1A",
        "ink-soft": "#635351",
        paper: "#FAF7F6",
        "teal-deep": "#5E3E3B",
        "teal-mid": "#462B28",
        mint: "#C98A82",
        "mint-deep": "#8E524D",
        line: "#E8DCD8",
        "line-soft": "#F4ECE9",
        error: "#B4483A",
        "brand-btn": "#5E3E3B",
        "brand-btn-hover": "#262525",
        teal: {
          50: "#FAF3F2",
          100: "#F4E6E4",
          200: "#E8CDC9",
          300: "#D9AEA8",
          400: "#B87F78",
          500: "#8E524D",
          600: "#74433E",
          700: "#5E3E3B",
          800: "#462B28",
          900: "#331E1C",
          950: "#221312",
        },
        emerald: {
          50: "#FAF3F2",
          100: "#F4E6E4",
          200: "#E8CDC9",
          300: "#D9AEA8",
          400: "#B87F78",
          500: "#8E524D",
          600: "#74433E",
          700: "#5E3E3B",
          800: "#462B28",
          900: "#331E1C",
          950: "#221312",
        },
        rosewood: {
          DEFAULT: "#5E3E3B",
          50: "#FAF3F2",
          100: "#F4E6E4",
          200: "#E8CDC9",
          300: "#D9AEA8",
          400: "#B87F78",
          500: "#8E524D",
          600: "#74433E",
          700: "#5E3E3B",
          800: "#462B28",
          900: "#331E1C",
          950: "#221312",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-baskerville)", "var(--font-fraunces)", "serif"],
        baskerville: ["var(--font-baskerville)", "serif"],
        serif: ["var(--font-baskerville)", "serif"],
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