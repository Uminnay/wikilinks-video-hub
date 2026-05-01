import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: {
          low: "var(--surface-low)",
          high: "var(--surface-high)",
        },
        primary: "#7C5CFC",
        onSurface: {
          DEFAULT: "var(--on-surface)",
          muted: "var(--on-surface-muted)",
        },
        priority: {
          high: "#F59E0B",
          medium: "#60A5FA",
          low: "#4B5563",
        },
        status: {
          seen: "var(--status-seen)",
          discarded: "var(--status-discarded)",
          notion: "#10B981",
        },
        error: "#EF4444"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
