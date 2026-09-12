import { NextResponse } from "next/server";

// GET /api/fb-resolve?url=... — on-demand single listing only (no background FB scrape).
// FB MCP verified dead 2026-09-12 (0 results even NYC/Paris). Paste-link only in v1.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") ?? "";
  if (!url.includes("facebook.com/marketplace/item/")) {
    return NextResponse.json({ ok: false, error: "Collez un lien marketplace/item/ valide." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, url, note: "Résolution auto désactivée v1 — ajout manuel en cours. Bascule sur MCP quand il refonctionne." });
}
