"use client";

/**
 * RECENTLY VIEWED
 * ===============
 * "Where was that PSU I was looking at?" is one of the most common ways a
 * shopping session ends without a purchase. This closes that loop.
 *
 * Same storage approach as the watchlist - localStorage, no account, no PII -
 * for the same reason: a server-side history needs auth, and auth is a much
 * bigger decision than a recently-viewed list.
 *
 * MOST RECENT FIRST, capped, and de-duplicated: revisiting a product moves it to
 * the top rather than adding a second entry, because a list of the same PSU
 * three times is not a history.
 */

const KEY = "dz_recent";
const VERSION = 1;
const MAX = 12;

export interface RecentEntry {
  id: string;
  /** Epoch ms of the most recent view. */
  at: number;
}

export interface RecentList {
  version: number;
  items: RecentEntry[];
}

function empty(): RecentList {
  return { version: VERSION, items: [] };
}

export function loadRecent(): RecentList {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as RecentList;
    if (!parsed || parsed.version !== VERSION || !Array.isArray(parsed.items)) return empty();
    const items = parsed.items.filter(
      (e): e is RecentEntry => !!e && typeof e.id === "string" && typeof e.at === "number",
    );
    return { version: VERSION, items: items.slice(0, MAX) };
  } catch {
    return empty();
  }
}

function save(list: RecentList): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("dz:recent", { detail: list }));
  } catch {
    /* private mode or quota - history is simply not persisted */
  }
}

/** Records a visit, moving an existing entry to the front rather than duplicating. */
export function recordVisit(productId: string): void {
  if (!productId) return;
  const list = loadRecent();
  const next: RecentList = {
    version: VERSION,
    items: [{ id: productId, at: Date.now() }, ...list.items.filter((e) => e.id !== productId)].slice(0, MAX),
  };
  save(next);
}

export function clearRecent(): void {
  save(empty());
}

export function recentIds(list: RecentList): string[] {
  return list.items.map((e) => e.id);
}
