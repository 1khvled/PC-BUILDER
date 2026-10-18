/** @type {import('tailwindcss').Config} */

// ---------------------------------------------------------------------------
// Theme notes
// ---------------------------------------------------------------------------
// Radius and shadow use Tailwind's DEFAULTS. The previous pass replaced both
// scales wholesale to flatten the cards, which was fighting the framework and
// left a bespoke scale nothing else could reason about. Flatness now comes from
// where surfaces are drawn (1px border, no ambient shadow) rather than from
// shrinking every radius, so the default scale stays intact and `rounded-lg`
// means the same thing here as it does everywhere else.
//
// `zIndex` is an explicit scale. The codebase had eight different arbitrary
// depths (`z-10` .. `z-[100]`) chosen ad hoc, which made stacking order
// unreadable and was the single most common cause of "why is this behind
// that".
// ---------------------------------------------------------------------------
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
          // The fallback inside var() is load-bearing. `next/font` defines
          // `--font-sans` through a generated class whose name is a build hash.
          // If a deploy serves HTML built with one hash and a stylesheet built
          // with another, the property is undefined -- and `var()` with no
          // fallback is invalid at computed-value time, so font-family collapses
          // to `inherit` and the whole site renders in the browser default
          // serif. That happened in production. With a fallback the worst case
          // is system sans.
          "var(--font-sans, -apple-system)",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
        // Monospace is reserved for figures and identifiers: prices, spec
        // values, part numbers, table headers. It is NOT used for headings or
        // UI prose -- wearing mono everywhere reads as a costume rather than a
        // hierarchy.
        mono: [
          "ui-monospace",
          "'SF Mono'",
          "'Cascadia Mono'",
          "'Segoe UI Mono'",
          "Menlo",
          "Consolas",
          "'Liberation Mono'",
          "monospace",
        ],
      },
      colors: {
        brand: {
          // Kept for the many hard-coded call sites; `accent` below is the
          // system's actual link/active colour and is contrast-checked.
          blue: "#2c87c3",
          "blue-hover": "#1e5c85",
          "blue-active": "#153f5b",
          navy: "#11111c",
          navy2: "#1a1c2c",
          navy3: "#26293b",
          paper: "#f4f4f3",
          line: "#e6e7eb",
        },
        // Every token below is a `var()` reference, not a literal. Tailwind
        // would otherwise bake a static hex into `bg-surface` and `text-ink`,
        // and those utilities would stay light in dark mode regardless of how
        // `--dz-*` was redeclared.
        accent: {
          DEFAULT: "var(--dz-accent)",
          hover: "var(--dz-accent-hover)",
          soft: "var(--dz-accent-soft)",
        },
        // Status only. Never decoration.
        ok: { DEFAULT: "var(--dz-ok)", soft: "var(--dz-ok-soft)" },
        warn: { DEFAULT: "var(--dz-warn)", soft: "var(--dz-warn-soft)" },
        bad: { DEFAULT: "var(--dz-bad)", soft: "var(--dz-bad-soft)" },
        ink: {
          DEFAULT: "var(--dz-ink)",
          2: "var(--dz-ink-2)",
          3: "var(--dz-ink-3)",
          4: "var(--dz-ink-4)",
        },
        line: {
          DEFAULT: "var(--dz-line)",
          strong: "var(--dz-line-strong)",
          soft: "var(--dz-line-soft)",
        },
        surface: {
          DEFAULT: "var(--dz-surface)",
          canvas: "var(--dz-canvas)",
          subtle: "var(--dz-subtle)",
        },
      },
      // One scale, top to bottom. Pick a name, don't invent a number.
      zIndex: {
        base: "0",
        raised: "10", // sticky sub-layers inside a component (image scrim, overlay)
        sticky: "20", // sticky headers and bars
        dropdown: "30", // menus and popovers
        overlay: "40", // modals, drawers, mobile bottom nav
        toast: "50", // toasts, tooltips, top progress bar
        skip: "60", // keyboard-only skip link, must beat everything
      },
      maxWidth: {
        shell: "1360px",
      },
    },
  },
  plugins: [],
};