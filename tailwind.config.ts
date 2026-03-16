import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f5f3ef",
        surface: "#ffffff",
        "surface-alt": "#f9f7f4",
        "surface-warm": "#faf8f5",
        border: "#e5e0d8",
        "border-light": "#eeebe5",
        "text-primary": "#1c1c1c",
        "text-secondary": "#6b6560",
        "text-tertiary": "#8a8580",
        green: {
          DEFAULT: "#5a7d6a",
          light: "#edf5f0",
          border: "#c6e2d3",
        },
        red: { DEFAULT: "#a63d40" },
        purple: {
          DEFAULT: "#6b4c9a",
          light: "#f3f0ff",
        },
        blue: { DEFAULT: "#2563eb" },
        amber: {
          DEFAULT: "#c4832d",
          light: "#fef8ee",
        },
        teal: {
          DEFAULT: "#1a4b58",
          light: "#e8f4f7",
        },
        gold: {
          DEFAULT: "#b8860b",
          light: "#fdf6e3",
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        sans: ["DM Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        std: "10px",
        card: "14px",
      },
      maxWidth: {
        app: "480px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.04), 0 3px 10px rgba(0,0,0,0.03)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
        sheet: "0 -8px 32px rgba(0,0,0,0.15)",
        nav: "0 -1px 12px rgba(0,0,0,0.05)",
        button: "0 1px 3px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
