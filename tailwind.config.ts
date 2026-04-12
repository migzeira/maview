import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        maview: {
          bg: "hsl(var(--background))",
          card: "hsl(var(--card))",
          surface: "hsl(var(--muted))",
          border: "hsl(var(--border))",
          purple: {
            DEFAULT: "#6D28D9",
            dark: "#4C1D95",
            light: "#7C3AED",
            soft: "#EDE9FE",
          },
          text: {
            DEFAULT: "hsl(var(--foreground))",
            sub: "hsl(var(--muted-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted-foreground))",
            light: "hsl(263 15% 45%)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "scroll-reverse": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "gentleBlink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "mesh-first": {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "mesh-second": {
          "0%": { transform: "rotate(0deg) translateX(0)" },
          "33%": { transform: "rotate(120deg) translateX(40px)" },
          "66%": { transform: "rotate(240deg) translateX(-40px)" },
          "100%": { transform: "rotate(360deg) translateX(0)" },
        },
        "mesh-third": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(-180deg) scale(1.15)" },
          "100%": { transform: "rotate(-360deg) scale(1)" },
        },
        "ambient-float": {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.5" },
          "50%": { transform: "translateY(-20px) scale(1.05)", opacity: "0.7" },
        },
        "ambient-drift": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(10px, -15px)" },
          "50%": { transform: "translate(-5px, 5px)" },
          "75%": { transform: "translate(-15px, -10px)" },
        },
        "pulse-urgency": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(239, 68, 68, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scroll": "scroll 35s linear infinite",
        "scroll-reverse": "scroll-reverse 38s linear infinite",
        "gentleBlink": "gentleBlink 3s ease-in-out infinite",
        "mesh-first": "mesh-first 20s ease infinite",
        "mesh-second": "mesh-second 15s ease infinite reverse",
        "mesh-third": "mesh-third 25s ease infinite",
        "ambient-float": "ambient-float 8s ease-in-out infinite",
        "ambient-drift": "ambient-drift 12s ease-in-out infinite",
        "pulse-urgency": "pulse-urgency 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
