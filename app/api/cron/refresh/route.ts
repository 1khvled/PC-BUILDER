import { NextResponse } from "next/server";
import { STORE_CATS, STORE_NAMES, scrapeStoreCategory } from "@/lib/scrapers/stores";
import { searchOuedkniss } from "@/lib/scrapers/ouedkniss";
import { SCRAPED_AT } from "@/lib/data/live";
import { isDbConfigured, supabase } from "@/lib/supabase";

// Set maximum duration for Vercel Serverless Function (up to 60s)
export const maxDuration = 60;

// GET /api/cron/refresh?smart=1 — smart auto-updater (checks freshness first, saves compute)
// GET /api/cron/refresh?store=LICB+&cat=gpu — targeted run
// GET /api/cron/refresh?scope=smoke — gpu+cpu on all stores (default)
export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }
  const { searchParams } = new URL(req.url);

  // Smart guard: skip compute if data was updated within 36h (< 1.5 days)
  if (searchParams.get("smart") === "1" && searchParams.get("force") !== "1") {
    let lastDate = new Date(SCRAPED_AT);
    if (isDbConfigured()) {
      try {
        const { data } = await supabase()
          .from("offers")
          .select("day")
          .order("day", { ascending: false })
          .limit(1);
        if (data && data.length > 0 && data[0].day) {
          lastDate = new Date(data[0].day);
        }
      } catch {
        // Fall back to SCRAPED_AT if Supabase connection fails
      }
    }
    const hoursAgo = (Date.now() - lastDate.getTime()) / (1000 * 3600);
    if (hoursAgo < 36) {
      return NextResponse.json({
        ok: true,
        status: "skipped_fresh",
        message: `Catalog was updated ${Math.round(hoursAgo)}h ago. Skipping run to conserve Supabase & Vercel compute.`,
        hoursAgo: Math.round(hoursAgo * 10) / 10,
        lastUpdate: lastDate.toISOString(),
      });
    }
  }

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
  } else if (searchParams.get("okq") || searchParams.get("oklist") === "1") {
    // Pure Ouedkniss job (okq/oks/oklist): skip store scraping entirely.
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
        "ryzen 5 3600", "ryzen 5 5600", "ryzen 5 5600x", "ryzen 5 5600g", "ryzen 7 5700x", "ryzen 7 5700x3d", "ryzen 7 5800x3d",
        "ryzen 5 7500f", "ryzen 5 7600", "ryzen 7 7700", "ryzen 7 7800x3d", "ryzen 7 9800x3d", "ryzen 9 7900x", "ryzen 9 7950x",
        "ryzen 5 8400f", "ryzen 5 8500g", "ryzen 5 9600x", "ryzen 7 9700x", "ryzen 9 9900x", "ryzen 9 9950x",
        "i3 12100", "i5 12400", "i5 12600k", "i5 13400", "i5 13600k", "i5 14400", "i5 14600k",
        "i7 12700", "i7 13700", "i7 14700", "i7 14700k", "i9 13900k", "i9 14900", "ultra 7 265k", "ultra 9 285k",
        // GPU — all bands stocked in DZ
        "rtx 3050", "rtx 3060", "rtx 3060 ti", "rtx 3070", "rtx 3080",
        "rtx 4060", "rtx 4060 ti", "rtx 4070", "rtx 4070 super", "rtx 4070 ti", "rtx 4080", "rtx 4090",
        "rtx 5060", "rtx 5060 ti", "rtx 5070", "gtx 1660 super",
        "rx 580", "rx 6600", "rx 6650 xt", "rx 6700 xt", "rx 6800",
        "rx 7600", "rx 7700 xt", "rx 7800 xt", "rx 7900 xt", "rx 7900 xtx", "rx 9070", "rx 9060",
        // Motherboard chipsets
        "b450", "a520", "b550", "b650", "b650m", "b660", "b760", "b760m", "h610", "z790", "a620", "x670", "b850", "x870", "z890",
        // Coolers
        "ak400", "ak620", "ak500", "ag400", "ag620", "peerless assassin", "phantom spirit", "liquid freezer", "watercooling 240", "watercooling 360",
        // RAM
        "16gb ddr4", "32gb ddr4", "ddr4 3200", "ddr5 16gb", "ddr5 32gb", "ddr5 6000",
        // SSD
        "980 pro", "990 pro", "sn850x", "sn770", "kc3000", "legend 710", "legend 850", "nv3 1tb", "nvme 1tb", "nvme 512gb", "nvme 2tb",
        // PSU wattages (prefixed with alimentation to ensure only PC power supplies match)
        "alimentation 550w", "alimentation 600w", "alimentation 650w", "alimentation 750w", "alimentation 850w", "alimentation 1000w",
        // Cases
        "boitier atx", "boitier gaming", "boitier aquarium",
        // Monitors
        "ecran 144hz", "ecran 165hz", "ecran 180hz", "ecran 240hz", "ecran 24", "ecran 27", "ecran 32", "moniteur gaming",
      ]
    : ["rtx 3060"];
  // Driver modes for the refresh pipeline (scripts/refresh-full.mjs):
  // oklist=1 -> the full Ouedkniss query list; okq=<q> -> full offers for one query.
  if (searchParams.get("oklist") === "1") {
    return NextResponse.json({ queries: okQueries });
  }
  const okq = searchParams.get("okq") || "";
  const oks = searchParams.get("oks") || "";
  if (okq) {
    try {
      const ind = searchParams.get("okind") === "ind";
      const ok = await searchOuedkniss(okq, oks || undefined, ind || undefined);
      const stamped = ok.map((o) => ({ ...o, query: okq }));
      // Seller sweep: rows join ouedkniss:all with the raw query stamped,
      // so OK_CAT + seenOkUrl in bake work with zero bake changes.
      // Individuals (okind=ind) carry isFromStore:false; bake parks them in
      // extras only (tier 3: visible, never a price reference).
      return NextResponse.json({
        ok: true,
        report: {
          [oks ? `ouedkniss-store:${oks}:${okq}` : ind ? `ouedkniss-ind:${okq}` : `ouedkniss:${okq}`]: { count: ok.length, offers: ok },
          "ouedkniss:all": stamped,
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
