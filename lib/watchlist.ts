"use client";

/**
 * WATCHLIST ("my parts")
 * =====================
 * The single mechanic that brings people back to a price-comparison site is
 * "did it drop yet?". Everything else on the site answers a question you already
 * had; this one creates a reason to return.
 *
 * The trick that makes it work without any backend: we remember the price each
 * watched part had the last time you looked. On your next visit we compare it
 * with today's price and tell you what moved. That is a real, earned return
 * visit rather than a notification we would need infrastructure to send.
 *
 * Storage is localStorage, deliberately:
 *   - no account, no email, no consent flow, no PII;
 *   - the existing builder already persists to localStorage, so the pattern is
 *     established in this codebase;
 *   - the trade-off is that it is per-device and per-browser. That is the right
 *     call at this stage: a server-side watchlist needs auth, and auth on a
 *     price site is a much bigger decision than a watchlist.
 *
 * Migration-friendly: unknown or corrupt stored data is discarded rather than
 * allowed to throw, because a broken watchlist must never break the page.
 */

const KEY = "dz_watchlist";
/** Bump when the stored shape changes so old payloads are discarded, not misread. */
const VERSION = 1;

export interface WatchEntry {
  /** Epoch ms when the user added it. */
  addedAt: number;
  /**
   * Best price the last time the watchlist was rendered. Null until we have
   * seen it once, so a brand new watch does not immediately claim a "drop".
   */
  lastSeenPrice: number | null;
}

export interface Watchlist {
  version: number;
  items: Record<string, WatchEntry>;
}

export function emptyWatchlist(): Watchlist {
  return { version: VERSION, items: {} };
}

export function loadWatchlist(): Watchlist {
  if (typeof window === "undefined") return emptyWatchlist();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyWatchlist();
    const parsed = JSON.parse(raw) as Watchlist;
    if (!parsed || parsed.version !== VERSION || typeof parsed.items !== "object" || parsed.items === null) {
      return emptyWatchlist();
    }
    // Validate each entry rather than trusting the shape: a hand-edited or
    // half-migrated value must not take the page down.
    const items: Record<string, WatchEntry> = {};
    for (const [id, entry] of Object.entries(parsed.items)) {
      if (entry && typeof entry.addedAt === "number") {
        items[id] = {
          addedAt: entry.addedAt,
          lastSeenPrice: typeof entry.lastSeenPrice === "number" ? entry.lastSeenPrice : null,
        };
      }
    }
    return { version: VERSION, items };
  } catch {
    return emptyWatchlist();
  }
}

function saveWatchlist(list: Watchlist): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    // Let anything else on the page (nav badge, cards) react to the change.
    window.dispatchEvent(new CustomEvent("dz:watchlist", { detail: list }));
  } catch {
    /* private mode or quota exceeded - the watchlist is simply not persisted */
  }
}

export function isWatched(list: Watchlist, productId: string): boolean {
  return Object.prototype.hasOwnProperty.call(list.items, productId);
}

export function toggleWatch(productId: string): Watchlist {
  const list = loadWatchlist();
  if (isWatched(list, productId)) {
    delete list.items[productId];
  } else {
    list.items[productId] = { addedAt: Date.now(), lastSeenPrice: null };
  }
  saveWatchlist(list);
  return list;
}

export function watchedIds(list: Watchlist): string[] {
  return Object.keys(list.items);
}

/* ------------------------------------------------------------- price delta */

export type MoveDirection = "down" | "up" | "flat" | "unknown";

export interface PriceMove {
  direction: MoveDirection;
  /** Signed percentage change since the last visit, e.g. -8.4 */
  pct: number;
  previousPrice: number | null;
  currentPrice: number;
}

/**
 * Compares the price we remembered with the current one.
 *
 * A drop is only reported above `MIN_MEANINGFUL_DROP` (1%). A 40 DA move on a
 * 90 000 DA part is noise, and telling someone "it dropped!" for that trains
 * them to ignore the badge, which destroys the whole mechanic.
 */
export function priceMove(entry: WatchEntry | undefined, currentPrice: number | null): PriceMove {
  const base: PriceMove = { direction: "unknown", pct: 0, previousPrice: null, currentPrice: currentPrice ?? 0 };
  if (!entry || currentPrice == null) return base;
  if (entry.lastSeenPrice == null) return { ...base, direction: "unknown" };

  const previous = entry.lastSeenPrice;
  if (previous <= 0) return { ...base, previousPrice: previous };
  if (currentPrice === previous) return { ...base, direction: "flat", previousPrice: previous };

  const pct = ((currentPrice - previous) / previous) * 100;
  return { direction: pct < 0 ? "down" : "up", pct, previousPrice: previous, currentPrice };
}

/**
 * Records today's price so the next visit has a baseline to compare against.
 * Deliberately writes on every render: the comparison is always "since you last
 * looked", which is what a shopper means by it.
 */
export function rememberCurrentPrice(productId: string, currentPrice: number | null): Watchlist {
  const list = loadWatchlist();
  const entry = list.items[productId];
  if (!entry) return list;
  if (currentPrice == null || currentPrice <= 0) return list;
  if (entry.lastSeenPrice === currentPrice) return list;

  entry.lastSeenPrice = currentPrice;
  saveWatchlist(list);
  return list;
}

/* --------------------------------------------------------------- analytics */

/**
 * Counts the parts that have dropped since the last visit. This is the number
 * that goes in the nav badge: it is the only reason to click through, so it
 * should be the loudest thing we can show.
 */
export function droppedCount(
  list: Watchlist,
  currentPriceFor: (productId: string) => number | null,
): number {
  return watchedIds(list).filter((id) => {
    const move = priceMove(list.items[id], currentPriceFor(id));
    return move.direction === "down" && Math.abs(move.pct) >= 1;
  }).length;
}
