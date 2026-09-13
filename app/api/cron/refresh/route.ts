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
  if (searchParams.get("matrix") === "1") {
    return NextResponse.json({
      stores: Object.fromEntries(STORE_NAMES.map((s) => [s, STORE_CATS(s)])),
    });
  }
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
  // Full-market Ouedkniss sweep: every category, top sellers per band.
  const okQueries = scope === "full"
    ? [
        // CPU — AM4 / AM5 / LGA1700 / LGA1851 best sellers
        "ryzen 5 5600", "ryzen 5 5600x", "ryzen 7 5700x", "ryzen 5 7500f", "ryzen 5 7600", "ryzen 7 7700",
        "ryzen 7 7800x3d", "ryzen 7 9800x3d", "ryzen 9 7900x", "ryzen 9 7950x",
        "i5 12400", "i5 13400", "i5 14400", "i7 13700", "i7 14700", "i9 14900", "i3 12100",
        // GPU — all bands stocked in DZ
        "rtx 3060", "rtx 4060", "rtx 4060 ti", "rtx 4070", "rtx 4070 super", "rtx 3070", "rtx 3080",
        "rtx 5060", "rtx 5060 ti", "rtx 5070", "rx 580", "rx 6600", "rx 6700 xt", "rx 6800",
        "rx 7600", "rx 7700 xt", "rx 7800 xt", "rx 7900 xt", "rx 9070", "rx 9060", "gtx 1660 super",
        // Motherboard chipsets
        "b550", "b650", "b660", "b760", "h610", "z790", "a620",
        // Coolers
        "ak400", "ak620", "watercooling 240", "watercooling 360",
        // RAM
        "16gb ddr4", "32gb ddr4", "ddr5 16gb", "ddr5 32gb",
        // SSD
        "980 pro", "nvme 1tb", "nvme 512gb", "nvme 2tb",
        // PSU wattages
        "650w", "750w", "850w",
        // Cases
        "boitier atx", "boitier gaming",
        // Monitors
        "ecran 144hz", "ecran 165hz", "ecran 27", "moniteur gaming",
      ]
    : ["rtx 3060"];
  // Driver modes for the refresh pipeline (scripts/refresh-full.mjs):
  // oklist=1 -> the full Ouedkniss query list; okq=<q> -> full offers for one query.
  if (searchParams.get("oklist") === "1") {
    return NextResponse.json({ queries: okQueries });
  }
  const okq = searchParams.get("okq") || "";
  if (okq) {
    try {
      const ok = await searchOuedkniss(okq);
      return NextResponse.json({
        ok: true,
        report: {
          [`ouedkniss:${okq}`]: { count: ok.length, offers: ok },
          "ouedkniss:all": ok.map((o) => ({ ...o, query: okq })),
        },
      });
    } catch (e) {
      return NextResponse.json({ ok: true, report: { [`ouedkniss:${okq}`]: { error: String(e).slice(0, 160) } } });
    }
  }
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
    // Polite gap between Ouedkniss queries (GraphQL rate limits)
    await new Promise((r) => setTimeout(r, 800));
  }
  if (full) report["ouedkniss:all"] = okAll;
  }
  return NextResponse.json({ ok: true, report });
}
