/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Class-based dark mode: the .dark class on <html> is set before paint by the
  // inline script in app/layout.tsx, so there is never a light-mode flash.
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          blue: "#2c87c3",
          "blue-hover": "#1e5c85",
          "blue-active": "#153f5b",
          navy: "#11111c",
          navy2: "#1a1c2c",
          navy3: "#26293b",
          paper: "#f4f4f3",
          line: "#e6e7eb",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,28,0.04), 0 10px 30px -14px rgba(17,17,28,0.12)",
        "card-hover": "0 2px 4px rgba(17,17,28,0.05), 0 20px 44px -16px rgba(17,17,28,0.16)",
        pop: "0 24px 70px -12px rgba(17,17,28,0.35)",
        dropdown: "0 4px 8px rgba(17,17,28,0.06), 0 24px 60px -12px rgba(17,17,28,0.22)",
      },
    },
  },
  plugins: [],
};
