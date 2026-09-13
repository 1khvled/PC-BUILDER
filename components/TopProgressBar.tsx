"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Complete progress on route change
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Listen to link clicks to start progress bar immediately
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || target.target === "_blank") {
        return;
      }

      // Check if it's an internal route that actually navigates to a new page
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin && (url.pathname !== pathname || url.search !== window.location.search)) {
          setVisible(true);
          setProgress(25);
          setTimeout(() => setProgress(65), 100);
        }
      } catch {
        /* noop */
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none overflow-hidden no-print"
    >
      <div
        className="h-full bg-[#2c87c3] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "180ms" : "400ms",
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
