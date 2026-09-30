import { NextResponse } from "next/server";
import { explainBuild, selfCheck, suggestBuild, type UseCase } from "@/lib/algo/optimizer";
import { getOffers } from "@/lib/data/catalog";

const USECASES: UseCase[] = ["gaming-1080p", "gaming-1440p", "office", "design"];

// POST /api/builds { picks } -> share link (stateless v1)
// POST /api/builds { budgetDa, useCase } -> optimizer suggestion + explanation
export async function POST(req: Request) {
  // Reject oversized payloads (anti-abuse)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 65536) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.budgetDa === "number") {
    // Sanitize budget boundaries (e.g. 20k to 5M DA)
    if (body.budgetDa < 15000 || body.budgetDa > 10000000) {
      return NextResponse.json({ error: "Budget hors limites acceptables (15 000 DA à 10 000 000 DA)." }, { status: 400 });
    }
    if (USECASES.includes(body.useCase)) {
      const s = suggestBuild(body.budgetDa, body.useCase as UseCase, await getOffers());
      return NextResponse.json({ ...s, explanation: explainBuild(s) });
    }
  }

  // Sanitize picks to prevent storing arbitrary scripts or nested payloads
  const sanitizedPicks: Record<string, string> = {};
  if (body.picks && typeof body.picks === "object" && !Array.isArray(body.picks)) {
    const keys = Object.keys(body.picks).slice(0, 15);
    for (const k of keys) {
      const v = body.picks[k];
      if (typeof k === "string" && typeof v === "string" && k.length <= 32 && v.length <= 64) {
        sanitizedPicks[k.replace(/[^a-zA-Z0-9_-]/g, "")] = v.replace(/[^a-zA-Z0-9_-]/g, "");
      }
    }
  }

  const id = Math.random().toString(36).slice(2, 8);
  return NextResponse.json({ id, picks: sanitizedPicks, url: `/builder?b=${id}` });
}

// GET /api/builds -> algorithm self-check (used by admin + CI)
export async function GET() {
  const checks = selfCheck();
  return NextResponse.json({ ok: checks.every((c) => c.ok), checks });
}
