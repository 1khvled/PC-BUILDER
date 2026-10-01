"use client";

import { useMemo, useState } from "react";
import type { AdminData } from "@/lib/admin/data";
import AdminOverview from "./AdminOverview";
import AdminPricing from "./AdminPricing";
import AdminCoverage from "./AdminCoverage";
import AdminOffersTable from "./AdminOffersTable";
import AdminHealth from "./AdminHealth";
import { age, cx, n } from "./ui";

/**
 * TABS
 * ====
 * The old console rendered every panel at once: ~4,000 rows of DOM in a single
 * document, with the offers table and the dispersion table both on screen and
 * no way to move between them. Opening it meant scrolling past all of it to
 * reach anything.
 *
 * Tabs solve that, but they also change the page from a report into a tool:
 * each panel loads instantly because only one is mounted, and the tab label
 * carries the number you would otherwise have to scroll to find.
 */
const TABS = [
  { id: "overview", label: "Overview", render: (d: AdminData) => <AdminOverview data={d} /> },
  { id: "pricing", label: "Pricing", render: (d: AdminData) => <AdminPricing data={d} /> },
  { id: "coverage", label: "Coverage", render: (d: AdminData) => <AdminCoverage data={d} /> },
  { id: "offers", label: "Offers", render: (d: AdminData) => <AdminOffersTable data={d} /> },
  { id: "health", label: "Health", render: (d: AdminData) => <AdminHealth data={d} /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminShell({
  data,
  signOutAction,
  consolePath,
}: {
  data: AdminData;
  signOutAction: () => Promise<void>;
  consolePath: string;
}) {
  const [tab, setTab] = useState<TabId>("overview");

  // Warnings first, because they are the reason to open this screen at all.
  const badges = useMemo(
    () => ({
      overview: null,
      pricing: data.price.outliers.length || null,
      coverage: data.coverage.reduce((n, r) => n + r.tracked.filter((c) => (r.counts[c] ?? 0) === 0).length, 0) || null,
      offers: data.totals.unmatched || null,
      health: data.checkPass ? null : data.checks.filter((c) => !c.ok).length,
    }),
    [data],
  );

  const active = TABS.find((t) => t.id === tab)!;
  const scrapeAge = age(data.scrapedAt);
  const stale = /^\d+d/.test(scrapeAge);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* ---------------------------------------------------------- top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur print:static">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cx(
                "inline-flex h-2 w-2 shrink-0 rounded-full",
                data.dbLive ? "bg-emerald-400" : "bg-amber-400",
              )}
              aria-hidden="true"
            />
            <h1 className="truncate text-sm font-extrabold tracking-tight text-white">
              Ops console
            </h1>
            <span className="hidden font-mono text-[11px] text-slate-500 sm:inline">{consolePath}</span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <span className={cx("font-mono", stale && "font-semibold text-amber-300")}>
              scrape {scrapeAge}
            </span>
            <span className="text-slate-700" aria-hidden="true">
              │
            </span>
            <span className="font-mono tabular-nums">{n(data.totals.offers)} offers</span>
            <span className="text-slate-700" aria-hidden="true">
              │
            </span>
            <span className="font-mono tabular-nums">{n(data.totals.products)} products</span>
            <span className="text-slate-700" aria-hidden="true">
              │
            </span>
            <span className={cx("font-mono tabular-nums", !data.checkPass && "font-semibold text-rose-300")}>
              {data.checkPass ? "checks pass" : `${data.checks.filter((c) => !c.ok).length} checks failing`}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-slate-800 print:hidden"
            >
              Public site ↗
            </a>
            <form action={signOutAction} className="print:hidden">
              <button
                type="submit"
                className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:border-rose-600/60 hover:text-rose-300"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* ------------------------------------------------------------ tabs */}
        <nav
          aria-label="Console sections"
          className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-4 pb-2 print:hidden"
        >
          {TABS.map((t) => {
            const badge = badges[t.id];
            const isActive = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={isActive ? "page" : undefined}
                className={cx(
                  "shrink-0 rounded-t-lg border-b-2 px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "border-[#2c87c3] text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300",
                )}
              >
                {t.label}
                {badge ? (
                  <span
                    className={cx(
                      "ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold",
                      t.id === "health"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-amber-500/20 text-amber-300",
                    )}
                    title={`${badge} item${badge === 1 ? "" : "s"} needing attention`}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ------------------------------------------------------------- body */}
      <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 print:space-y-3 print:py-0">
        {active.render(data)}
      </main>
    </div>
  );
}