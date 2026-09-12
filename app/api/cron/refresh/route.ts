import { NextResponse } from "next/server";
import { STORE_CATS, STORE_NAMES, scrapeStoreCategory } from "@/lib/scrapers/stores";
import { searchOuedkniss } from "@/lib/scrapers/ouedkniss";

// GET /api/cron/refresh?store=LICB+&cat=gpu — targeted run
// GET /api/cron/refresh?scope=smoke — gpu+cpu on all 4 stores (default)
// Vercel Cron 1x/day 03:00 Algiers full run comes W3 with Supabase upsert.
export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }
  const { searchParams } = new URL(req.url);
  const store = searchParams.get("store") || "";
  const cat = searchParams.get("cat") || "";
  const scope = searchParams.get("scope") || "smoke";
  const full = searchParams.get("full") === "1"; // include every offer (for catalog bake)
  const onlyStores = (searchParams.get("stores") || "").split(",").filter(Boolean);
  const wantOk = searchParams.get("ok") !== "0";
  const jobs: [string, string][] = [];
  if (store && cat) {
    jobs.push([store, cat]);
  } else if (scope === "full") {
    for (const s of STORE_NAMES) {
      if (onlyStores.length && !onlyStores.includes(s)) continue;
      for (const c of STORE_CATS(s)) jobs.push([s, c]);
    }
  } else {
    for (const s of STORE_NAMES) for (const c of ["gpu", "cpu"]) jobs.push([s, c]);
  }
  const report: Record<string, unknown> = {};
  for (const [s, c] of jobs) {
    try {
      const offers = await scrapeStoreCategory(s, c);
      report[`${s}/${c}`] = full
        ? { count: offers.length, offers }
        : {
            count: offers.length,
            sample: offers.slice(0, 2).map((o) => ({ title: o.title, price: o.priceDa, url: o.url })),
          };
    } catch (e) {
      report[`${s}/${c}`] = { error: String(e).slice(0, 160) };
    }
  }
  const okQueries = scope === "full"
    ? ["rtx 3060", "rtx 4060", "rtx 4070", "rx 580", "ryzen 5 5600", "i5 12400", "b550", "16gb ddr4", "ddr5", "nvme 1tb", "650w", "ecran 144hz"]
    : ["rtx 3060"];
  const okAll: unknown[] = [];
  if (wantOk) {
  for (const q of okQueries) {
    try {
      const ok = await searchOuedkniss(q);
      okAll.push(...ok.map((o) => ({ ...o, query: q })));
      report[`ouedkniss:${q}`] = {
        offers: ok.length,
        sample: ok.slice(0, 2).map((o) => ({ title: o.title.slice(0, 90), price: o.priceDa, url: o.url.slice(0, 110) })),
      };
    } catch (e) {
      report[`ouedkniss:${q}`] = { error: String(e).slice(0, 160) };
    }
  }
  if (full) report["ouedkniss:all"] = okAll;
  }
  return NextResponse.json({ ok: true, report });
}
