"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/client";

/**
 * TODO(dict): the dictionary has no key for this control, so the label lives
 * here in both languages rather than being announced in French on the English
 * site. As soon as `a11y.backToTop` exists in fr.ts + en.ts, replace this map
 * with `t("a11y.backToTop")` and delete it.
 */
const BACK_TO_TOP = { en: "Back to top", fr: "Retourner en haut de page" } as const;

export default function BackToTop() {
  const locale = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 320) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = () => {
    // Honour prefers-reduced-motion: an animated scroll back up a long price
    // table is exactly the kind of large motion the setting exists to stop.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label={BACK_TO_TOP[locale]}
      className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.75rem)] right-4 sm:bottom-6 sm:right-6 z-40 p-2.5 rounded-full bg-[#121624]/90 hover:bg-[#1a2035] text-slate-300 hover:text-white border border-white/15 hover:border-cyan-400/50 shadow-xl backdrop-blur-md no-print min-h-[40px] min-w-[40px] inline-flex items-center justify-center transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
    >
      <svg
        className="w-4.5 h-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}