/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["DM Sans",  "system-ui", "sans-serif"],
        display: ["Syne",     "sans-serif"],
        mono:    ["DM Mono",  "monospace"],
      },
      colors: {
        amber:  "#f0a500",
        green:  "#34d399",
        blue:   "#60a5fa",
        red:    "#f87171",
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
}
