"use client";

import { useCallback, useEffect, useState } from "react";
import { isWatched, loadWatchlist, toggleWatch } from "@/lib/watchlist";
import { useT } from "@/lib/i18n/client";

/**
 * Watch toggle for a product card or detail page.
 *
 * Deliberately a small optimistic client component rather than a server action:
 * it lives inside already-hydrated client components, the write is localStorage,
 * and optimistic state means zero perceived latency.
 */
export default function WatchButton({
  productId,
  className = "",
  showLabel = false,
}: {
  productId: string;
  className?: string;
  showLabel?: boolean;
}) {
  const t = useT();
  const [watched, setWatched] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWatched(isWatched(loadWatchlist(), productId));
    setReady(true);

    // Stay in sync when another card on the same page toggles the same part.
    const onChange = () => setWatched(isWatched(loadWatchlist(), productId));
    window.addEventListener("dz:watchlist", onChange);
    return () => window.removeEventListener("dz:watchlist", onChange);
  }, [productId]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setWatched(isWatched(toggleWatch(productId), productId));
    },
    [productId],
  );

  if (!ready) {
    // Reserve the space so adding the watchlist does not shift the card layout.
    return <span className={`inline-block w-8 h-8 ${className}`} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={watched}
      title={watched ? t("watch.remove") : t("watch.add")}
      aria-label={watched ? t("watch.remove") : t("watch.add")}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition-colors ${
        showLabel ? "px-2.5 py-1.5" : "w-8 h-8"
      } ${
        watched
          ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
      } ${className}`}
    >
      <span aria-hidden="true">{watched ? "★" : "☆"}</span>
      {showLabel && <span>{watched ? t("watch.remove") : t("watch.add")}</span>}
    </button>
  );
}
