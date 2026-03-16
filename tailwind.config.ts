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
        "text-primary": "#1a1a1a",
        "text-secondary": "#555555",
        "text-tertiary": "#8a8580",
        green: {
          DEFAULT: "#2d6a4f",
          light: "#edf5f0",
          border: "#c6e2d3",
        },
        red: { DEFAULT: "#b91c1c" },
        purple: {
          DEFAULT: "#6d28d9",
          light: "#f5f3ff",
        },
        blue: { DEFAULT: "#2563eb" },
        amber: {
          DEFAULT: "#b45309",
          light: "#fffbeb",
        },
        teal: {
          DEFAULT: "#1a4b58",
          light: "#e8f4f7",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
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
        card: "0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)",
        "card-hover": "0 2px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        sheet: "0 -4px 24px rgba(0,0,0,0.12)",
        nav: "0 -1px 8px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
