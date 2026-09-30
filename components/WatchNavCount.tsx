"use client";

import { useEffect, useState } from "react";
import { loadWatchlist } from "@/lib/watchlist";

/**
 * Tracked-parts count for the nav link.
 *
 * Deliberately shows the COUNT of tracked parts, not the number that dropped.
 * The dropped count needs live prices, and fetching /api/watchlist on every page
 * load to render one digit in a nav bar is a bad trade: it costs a round trip on
 * every navigation for a number most people will not look at. The drop detail
 * belongs on the page you land on, which is exactly where the watchlist puts it.
 *
 * Renders nothing when the count is zero, so the nav is unchanged for visitors
 * who have not used the feature.
 */
export default function WatchNavCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(Object.keys(loadWatchlist().items).length);
    sync();
    window.addEventListener("dz:watchlist", sync);
    return () => window.removeEventListener("dz:watchlist", sync);
  }, []);

  if (count === 0) return null;

  return (
    <span
      className="ml-1 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-900 px-1 tabular-nums"
      aria-hidden="true"
    >
      {count}
    </span>
  );
}
