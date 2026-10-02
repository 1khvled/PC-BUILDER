/**
 * Compare set: up to 4 product ids the visitor flagged for side-by-side.
 *
 * localStorage, like the recent-views store: no accounts, no PII, survives a
 * reload. A `storage` listener keeps two category tabs in sync. Max 4 because a
 * 5-column table is unreadable on a phone and the page caps there anyway.
 */

const KEY = "dz-compare";
export const COMPARE_MAX = 4;

export function loadCompare(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

function save(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, COMPARE_MAX)));
  } catch {
    /* private mode */
  }
}

/** Toggle an id. Returns { ids, added, full }. */
export function toggleCompare(id: string): { ids: string[]; added: boolean; full: boolean } {
  const cur = loadCompare();
  if (cur.includes(id)) {
    const ids = cur.filter((x) => x !== id);
    save(ids);
    return { ids, added: false, full: false };
  }
  if (cur.length >= COMPARE_MAX) return { ids: cur, added: false, full: true };
  const ids = [...cur, id];
  save(ids);
  return { ids, added: true, full: false };
}

export function clearCompare(): void {
  save([]);
}
