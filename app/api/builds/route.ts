import { NextResponse } from "next/server";
import { explainBuild, selfCheck, suggestBuild, type UseCase } from "@/lib/algo/optimizer";

const USECASES: UseCase[] = ["gaming-1080p", "gaming-1440p", "office", "design"];

// POST /api/builds { picks } -> share link (stateless v1)
// POST /api/builds { budgetDa, useCase } -> optimizer suggestion + explanation
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (typeof body.budgetDa === "number" && USECASES.includes(body.useCase)) {
    const s = suggestBuild(body.budgetDa, body.useCase as UseCase);
    return NextResponse.json({ ...s, explanation: explainBuild(s) });
  }
  const id = Math.random().toString(36).slice(2, 8);
  return NextResponse.json({ id, picks: body.picks ?? {}, url: `/builder?b=${id}` });
}

// GET /api/builds -> algorithm self-check (used by admin + CI)
export async function GET() {
  const checks = selfCheck();
  return NextResponse.json({ ok: checks.every((c) => c.ok), checks });
}
