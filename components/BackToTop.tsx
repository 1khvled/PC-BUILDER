"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retourner en haut de page"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white text-slate-700 hover:text-[#2c87c3] border border-slate-200 shadow-lg no-print focus-visible:ring-2 focus-visible:ring-[#2c87c3] focus-visible:outline-hidden"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
      <span className="sr-only">Haut de page</span>
    </button>
  );
}
