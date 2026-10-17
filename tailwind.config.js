/** @type {import('tailwindcss').Config} */

// ---------------------------------------------------------------------------
// "Instrument" design system
// ---------------------------------------------------------------------------
// Two global moves do most of the anti-slop work here, and both are theme
// replacements rather than per-component edits:
//
//  1. borderRadius is REPLACED (not extended), so the ~400 existing
//     `rounded-xl` / `rounded-2xl` call sites collapse from 12px/16px down to
//     6px/8px in one edit. The old build had a radii soup -- 8/10/12/16 and
//     `rounded-full` all floating around the same screen -- which is a strong
//     "generated template" tell. `full` is deliberately kept for the 2px status
//     dots and the language pill, which should still read as pills.
//
//  2. boxShadow is REPLACED and `card` is flattened to `none`. Soft ambient
//     shadows were applied to *every* surface, so nothing read as a distinct
//     layer. Structure now comes from hairline borders and whitespace; the only
//     shadows left in the scale are genuinely floating things (popovers, the
//     toast, the sticky header on scroll).
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
    // Replacement, not extension — see note 1 above.
    borderRadius: {
      none: "0px",
      xs: "2px",
      sm: "3px",
      DEFAULT: "4px",
      md: "4px",
      lg: "6px",
      xl: "6px",
      "2xl": "8px",
      "3xl": "10px",
      full: "9999px",
    },
    // Replacement — see note 2 above.
    boxShadow: {
      none: "none",
      xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.06)",
      DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.07)",
      md: "0 4px 12px -2px rgb(0 0 0 / 0.10)",
      lg: "0 12px 32px -8px rgb(0 0 0 / 0.18)",
      xl: "0 24px 60px -12px rgb(0 0 0 / 0.24)",
      "2xl": "0 32px 80px -16px rgb(0 0 0 / 0.28)",
      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.06)",
      // Flat by design: cards are separated by their 1px border, not a glow.
      card: "none",
      "card-hover": "none",
      // Genuinely floating layers keep a shadow, but always paired with a
      // hairline ring so they read as attached to a surface, not pasted on.
      pop: "0 16px 48px -12px rgb(0 0 0 / 0.28)",
      dropdown: "0 12px 36px -10px rgb(0 0 0 / 0.22)",
    },
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
        // Zero-cost system mono. Reserved for figures, spec keys and micro
        // labels — the "instrument" cue that this is a data product.
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

        // NOTE: every colour below is a `var()` reference, not a literal.
        // Tailwind would otherwise bake a static hex into `bg-surface` and
        // `text-ink`, and those utilities would stay light in dark mode no
        // matter how the `--dz-*` custom properties were redeclared. Pointing
        // them at the variables means the dark theme is a single block of
        // overrides at the top of globals.css instead of `dark:` variants
        // scattered across every component.
        accent: {
          DEFAULT: "var(--dz-accent)",
          hover: "var(--dz-accent-hover)",
          soft: "var(--dz-accent-soft)",
        },
        // Semantic states. The ONLY other colours allowed to appear, and only
        // as status -- never as decoration.
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
      maxWidth: {
        // One content width for the whole site. Every `max-w-7xl` in the
        // codebase now resolves to the same measure, which is what makes the
        // page edges line up as one system instead of several.
        shell: "1360px",
      },
    },
  },
  plugins: [],
};