import { NextResponse } from "next/server";

// GET /api/fb-resolve?url=... - on-demand single listing only (no background FB scrape).
// FB MCP verified dead 2026-09-12 (0 results even NYC/Paris). Paste-link only in v1.

/**
 * Hosts we accept for a pasted Marketplace listing.
 *
 * The previous check was `url.includes("facebook.com/marketplace/item/")`, which
 * also matches things like `https://evil.com/facebook.com/marketplace/item/` or
 * a path segment inside an attacker domain. v1 never fetches the URL so this was
 * harmless, but the moment this route starts resolving listings server-side it
 * becomes a textbook SSRF hole (metadata endpoints, internal ranges, redirects).
 * Parsing the URL and pinning the hostname makes that refactor safe by default.
 */
const ALLOWED_HOSTS = new Set(["facebook.com", "www.facebook.com", "m.facebook.com", "web.facebook.com"]);

const BAD_REQUEST = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url") ?? "";

  if (!raw || raw.length > 512) {
    return BAD_REQUEST("Collez un lien marketplace/item/ HTTPS valide (max 512 caractères).");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return BAD_REQUEST("Lien invalide. Collez un lien direct du type https://www.facebook.com/marketplace/item/...");
  }

  // https only: no plaintext, and no other scheme trickery.
  if (parsed.protocol !== "https:") {
    return BAD_REQUEST("Lien invalide : seule l'URL HTTPS est acceptée.");
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) {
    return BAD_REQUEST("Lien invalide : l'hôte doit être facebook.com.");
  }

  // Marketplace item path, checked on the parsed pathname rather than the raw
  // string so a query string cannot stand in for a path segment.
  if (!/^\/marketplace\/item\/\d+/i.test(parsed.pathname)) {
    return BAD_REQUEST("Lien invalide : attendu https://www.facebook.com/marketplace/item/<id>.");
  }

  return NextResponse.json({
    ok: true,
    url: parsed.toString(),
    note: "Résolution auto désactivée v1 - ajout manuel en cours. Bascule sur MCP quand il refonctionne.",
  });
}