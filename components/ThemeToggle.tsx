"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";

/**
 * Light/dark switch.
 *
 * The actual class flip lives in the blocking inline script in app/layout.tsx
 * (it must run before first paint to avoid a flash). This component mirrors
 * that state, persists the choice and exposes the accessible toggle button.
 *
 * "system" is the default until the visitor picks a side, in which case the
 * choice is stored and wins over the OS preference.
 */

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "dz_theme";

function readStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode — the class is still applied for this session */
  }
}

export default function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Hydrate from whatever the pre-paint script decided.
  useEffect(() => {
    setTheme(readStored());
    setMounted(true);
  }, []);

  // Follow the OS live while the visitor has not chosen explicitly.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const toggle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const next: Theme = isDark ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const label = !mounted
    ? t("theme.toggle")
    : theme === "dark"
    ? t("theme.toLight")
    : theme === "light"
    ? t("theme.toDark")
    : t("theme.system");

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="p-2 rounded-lg border border-white/15 text-slate-200 hover:bg-white/10 hover:border-white/25 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#2c87c3]"
    >
      {/* Sun (light mode target) / moon (dark mode target) — both kept in the
          DOM and swapped with CSS so there is no hydration mismatch. */}
      <svg
        className="w-4 h-4 hidden dark:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        className="w-4 h-4 block dark:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}