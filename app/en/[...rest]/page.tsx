import { notFound } from "next/navigation";

/**
 * Catch-all for the English subtree.
 *
 * Without it, an unknown URL under /en (e.g. /en/oops, /en/admin-kh7) falls
 * through to the ROOT not-found boundary and renders the French 404. This
 * route always defers to notFound(), so the closest boundary — app/en/not-found.tsx
 * — renders the English one instead.
 *
 * It never shadows a real page: /en, /en/builder, /en/category/[slug], etc. are
 * all more specific segments and win.
 */
export default function EnglishCatchAll(): never {
  notFound();
}
