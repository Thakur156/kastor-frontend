import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        xs: "400px",
      },
      maxWidth: {
        container: "1440px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        h1: [
          "72px",
          {
            lineHeight: "72px",
            fontWeight: "500",
          },
        ],
        h2: [
          "68px",
          {
            lineHeight: "68px",
            fontWeight: "400",
          },
        ],
        h3: [
          "48px",
          {
            lineHeight: "48px",
            fontWeight: "500",
          },
        ],
        b18: [
          "18px",
          {
            lineHeight: "28px",
            fontWeight: "400",
          },
        ],
        b14: [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "500",
          },
        ],
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
        instrumental: ["Instrumental Sans", "sans-serif"],
        consolas: ["Consolas", "monospace"],
        inter: "var(--font-inter)",
      },
      colors: {
        darkgrey: "#2E2E2E",
        graymain: "#B6B8BD",
        graysec: "#999999",
        gray2: "#131313",
        Blue: "#004096",
        Red: "#F64B4B",
        Gray: "#F9F9F9",
        Black: "#1E1E1E",
        Green: "#17B26A",
        Stroke: "#E5E5E5",
        darkGray: "#77797E",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#004096",
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
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
