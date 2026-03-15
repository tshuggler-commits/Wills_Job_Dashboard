import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f7f7f5",
        surface: "#ffffff",
        "surface-alt": "#f2f1ee",
        border: "#e8e6e1",
        "border-light": "#f0eeea",
        "text-primary": "#1a1a1a",
        "text-secondary": "#6b6b6b",
        "text-tertiary": "#9a9a9a",
        green: {
          DEFAULT: "#2d6a4f",
          light: "#edf5f0",
          border: "#c6e2d3",
        },
        red: { DEFAULT: "#b91c1c" },
        purple: {
          DEFAULT: "#5b21b6",
          light: "#f3f0ff",
        },
        blue: { DEFAULT: "#1d4ed8" },
        amber: {
          DEFAULT: "#92400e",
          light: "#fffbeb",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        std: "8px",
        card: "12px",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
