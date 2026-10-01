"use client";

import { useMemo, useState } from "react";
import type { AdminData } from "@/lib/admin/data";
import { CATEGORIES, type Category } from "@/lib/data/products";
import {
  ActionLink,
  Badge,
  CoverageCell,
  Empty,
  Panel,
  SegmentedFilter,
  TableWrap,
  Td,
  Th,
  cx,
  n,
  pct,
} from "./ui";

/**
 * COVERAGE
 * ========
 * Store x category, and the scraper trigger per cell.
 *
 * The previous matrix conflated two very different states in one visual: a red
 * "0" for a store-category we track and found nothing (a broken scraper), and a
 * dash for a combination we deliberately do not track (not a problem at all).
 * About two thirds of the grid was dash, so the red cells stopped meaning
 * anything. Tracked-only filtering is the default here for the same reason.
 *
 * A per-cell retest link replaces the old "test GPU only" button on every row,
 * which could only ever test one category regardless of which column you were
 * looking at.
 */
export default function AdminCoverage({ data }: { data: AdminData }) {
  const [onlyBroken, setOnlyBroken] = useState<"broken" | "all">("broken");

  const cats = useMemo(() => CATEGORIES.map((c) => c.slug), []);

  const rows = useMemo(() => {
    const allowed = new Set<string>(cats);
    return data.coverage
      .map((r) => {
        // A scraper may list a category that is not in CATEGORIES (a store can
        // sell something we do not model). Filter to known slugs so the matrix
        // stays rectangular, and keep the type honest while doing it.
        const tracked = r.tracked.filter((c): c is Category => allowed.has(c as Category));
        const broken = tracked.filter((c) => (r.counts[c] ?? 0) === 0);
        return { ...r, tracked, broken };
      })
      .filter((r) => (onlyBroken === "broken" ? r.broken.length > 0 : true))
      .sort((a, b) => b.broken.length - a.broken.length || b.total - a.total);
  }, [data.coverage, cats, onlyBroken]);

  const totalTracked = data.coverage.reduce((acc, r) => acc + r.tracked.length, 0);
  const totalBroken = data.coverage.reduce(
    (acc, r) => acc + r.tracked.filter((c) => (r.counts[c] ?? 0) === 0).length,
    0,
  );

  return (
    <Panel
      title="Store coverage"
      subtitle="Matched offers per store and category. A red zero is a scraper that is returning nothing for a category it is supposed to cover."
      actions={
        <>
          <Badge tone={totalBroken > 0 ? "bad" : "good"}>
            {totalBroken} of {n(totalTracked)} tracked cells empty
          </Badge>
          <SegmentedFilter
            label="Filter rows"
            value={onlyBroken}
            onChange={setOnlyBroken}
            options={[
              { value: "broken", label: "Needs attention" },
              { value: "all", label: "All stores", count: data.coverage.length },
            ]}
          />
        </>
      }
    >
      {rows.length === 0 ? (
        <Empty>Every tracked store-category pair is returning offers. Nothing to fix here.</Empty>
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Store</Th>
                <Th>Wilaya</Th>
                {cats.map((c) => (
                  <Th key={c} align="center" title={c}>
                    <span className="text-[9px]">{c.slice(0, 3)}</span>
                  </Th>
                ))}
                <Th align="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.store} className={cx("hover:bg-slate-800/40", r.broken.length > 0 && "bg-rose-950/10")}>
                  <Td className="font-bold text-slate-200">{r.store}</Td>
                  <Td className="text-slate-400">{r.wilaya}</Td>
                  {cats.map((c) => {
                    const tracked = r.tracked.includes(c as Category);
                    const count = r.counts[c] ?? 0;
                    return (
                      <Td key={c} align="center">
                        {tracked ? (
                          <a
                            href={`/api/cron/refresh?store=${encodeURIComponent(r.store)}&cat=${c}`}
                            target="_blank"
                            rel="noreferrer"
                            title={
                              count === 0
                                ? `${r.store} / ${c}: no offers. Click to run this scraper now.`
                                : `${r.store} / ${c}: ${count} offers. Click to re-run this scraper.`
                            }
                            className="print:pointer-events-none"
                          >
                            <CoverageCell count={count} tracked />
                          </a>
                        ) : (
                          <span className="text-slate-700">–</span>
                        )}
                      </Td>
                    );
                  })}
                  <Td align="right" mono className="font-bold text-white">
                    {n(r.total)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500 print:hidden">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 min-w-6 items-center justify-center rounded border border-emerald-800/60 bg-emerald-950/70 px-1 font-mono text-[10px] text-emerald-300">
                42
              </span>
              offers found
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 min-w-6 items-center justify-center rounded border border-rose-800 bg-rose-950 px-1 font-mono text-[10px] text-rose-300">
                0
              </span>
              tracked, nothing returned — click to re-run
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-700">–</span>
              not tracked for this store
            </span>
          </div>

          {onlyBroken === "broken" ? (
            <div className="mt-3 flex flex-wrap gap-2 print:hidden">
              <ActionLink href="/api/cron/refresh?scope=full&full=1" tone="good">
                Re-scrape everything
              </ActionLink>
              {rows.slice(0, 6).flatMap((r) =>
                r.broken.slice(0, 2).map((c) => (
                  <ActionLink
                    key={`${r.store}-${c}`}
                    href={`/api/cron/refresh?store=${encodeURIComponent(r.store)}&cat=${c}`}
                    tone="brand"
                  >
                    {r.store} · {c}
                  </ActionLink>
                )),
              )}
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}