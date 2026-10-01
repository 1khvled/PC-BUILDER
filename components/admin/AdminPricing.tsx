"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminData } from "@/lib/admin/data";
import Thumb from "@/components/Thumb";
import {
  Badge,
  Empty,
  Panel,
  SearchInput,
  SegmentedFilter,
  TableWrap,
  Td,
  Th,
  cx,
  n,
  pct,
} from "./ui";

type Sort = "count" | "spread" | "min" | "avg" | "model";
const PAGE = 100;

/**
 * PRICING
 * =======
 * Per-product price dispersion, which is what an operator actually uses this
 * screen for: find the components where one shop is charging nonsense.
 *
 * The old table rendered all 438 rows with no filter and no category grouping, so
 * the answer to "which GPUs have bad prices" required scrolling. Rows are now
 * filterable by category, searchable, sortable on any column, and paged — which
 * also keeps the DOM small enough that sorting is instant.
 *
 * Zero-offer products are hidden by default. They are real and worth finding, but
 * they are a separate question, so they get their own filter instead of sitting
 * in the middle of a price report as 37 empty rows.
 */
export default function AdminPricing({ data }: { data: AdminData }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [priced, setPriced] = useState<"priced" | "all" | "unpriced">("priced");
  const [sort, setSort] = useState<Sort>("count");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const cats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of data.productStats) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    return [
      { value: "all", label: "All", count: data.productStats.length },
      ...Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([c, count]) => ({ value: c, label: c, count })),
    ];
  }, [data.productStats]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = data.productStats.filter((s) => {
      if (cat !== "all" && s.category !== cat) return false;
      if (priced === "priced" && s.count === 0) return false;
      if (priced === "unpriced" && s.count > 0) return false;
      if (needle && !`${s.brand} ${s.model} ${s.id}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    const mul = dir === "asc" ? 1 : -1;
    out.sort((a, b) => {
      switch (sort) {
        case "model":
          return mul * `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
        case "spread":
          return mul * (a.spreadPct - b.spreadPct);
        case "min":
          return mul * (a.min - b.min);
        case "avg":
          return mul * (a.avg - b.avg);
        default:
          return mul * (a.count - b.count);
      }
    });
    return out;
  }, [data.productStats, q, cat, priced, sort, dir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const view = filtered.slice(current * PAGE, current * PAGE + PAGE);

  const header = (field: Sort, label: string, align: "left" | "right" = "left") => (
    <Th
      align={align}
      active={sort === field}
      onClick={() => {
        if (sort === field) setDir(dir === "asc" ? "desc" : "asc");
        else {
          setSort(field);
          setDir(field === "model" ? "asc" : "desc");
        }
        setPage(0);
      }}
    >
      {label}
    </Th>
  );

  const reset = (fn: () => void) => {
    fn();
    setPage(0);
  };

  return (
    <Panel
      title="Price dispersion per product"
      subtitle="How far apart sellers are on the same component. Sorted by contention; the widest spreads are the price errors."
      actions={
        <span className="font-mono text-[11px] tabular-nums text-slate-400">
          {n(filtered.length)} shown
        </span>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
        <SearchInput
          value={q}
          onChange={(v) => reset(() => setQ(v))}
          label="Search products"
          placeholder="Search brand, model or id"
        />
        <SegmentedFilter
          label="Filter by category"
          value={cat}
          onChange={(v) => reset(() => setCat(v))}
          options={cats}
        />
        <SegmentedFilter
          label="Filter by price coverage"
          value={priced}
          onChange={(v) => reset(() => setPriced(v))}
          options={[
            { value: "priced", label: "Has offers" },
            { value: "unpriced", label: "No offers", count: data.totals.orphanedProducts },
            { value: "all", label: "All" },
          ]}
        />
      </div>

      {view.length === 0 ? (
        <Empty>No products match these filters.</Empty>
      ) : (
        <>
          <TableWrap maxHeight="65vh">
            <thead>
              <tr>
                {header("model", "Product")}
                <Th>Category</Th>
                {header("count", "Offers", "right")}
                {header("min", "Min", "right")}
                {header("avg", "Avg", "right")}
                <Th align="right">Max</Th>
                <Th align="right" width={130}>
                  Spread
                </Th>
                <Th>Cheapest seller</Th>
                <Th align="center">Page</Th>
              </tr>
            </thead>
            <tbody>
              {view.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <Td>
                    <Link href={`/product/${s.id}`} target="_blank" className="flex items-center gap-2 hover:text-[#8ecbf0]">
                      <Thumb src={`/p/${s.id}.webp`} alt={s.model} size={22} />
                      <span className="truncate">
                        {s.brand} {s.model}
                      </span>
                    </Link>
                  </Td>
                  <Td>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {s.category}
                    </span>
                  </Td>
                  <Td align="right" mono>
                    {s.count === 0 ? (
                      <Badge tone="warn">none</Badge>
                    ) : (
                      <span className={cx(s.count === 1 && "text-amber-300")}>{n(s.count)}</span>
                    )}
                  </Td>
                  <Td align="right" mono>{s.min ? n(s.min) : "—"}</Td>
                  <Td align="right" mono className="text-slate-300">{s.avg ? n(s.avg) : "—"}</Td>
                  <Td align="right" mono className="text-slate-400">{s.max ? n(s.max) : "—"}</Td>
                  <Td align="right" mono>
                    {s.count > 1 ? (
                      <span className="flex items-center justify-end gap-2">
                        <span className="text-slate-400">+{s.spreadPct}%</span>
                        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-800">
                          <span
                            className={cx(
                              "block h-full rounded-full",
                              s.spreadPct >= 400
                                ? "bg-rose-500"
                                : s.spreadPct >= 150
                                  ? "bg-amber-500"
                                  : "bg-emerald-500",
                            )}
                            style={{ width: `${Math.min(100, Math.max(6, s.spreadPct / 3))}%` }}
                          />
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </Td>
                  <Td>
                    {s.cheapest ? (
                      <span className="text-emerald-300">
                        {s.cheapest.store}
                        <span className="ml-1 text-slate-500">({s.cheapest.wilaya})</span>
                      </span>
                    ) : (
                      <span className="italic text-slate-600">not offered</span>
                    )}
                  </Td>
                  <Td align="center">
                    <a
                      href={`/product/${s.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:text-sky-300 hover:underline"
                      aria-label={`Open product page for ${s.brand} ${s.model}`}
                    >
                      ↗
                    </a>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          {pages > 1 ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
              <span className="font-mono tabular-nums text-slate-500">
                {n(current * PAGE + 1)}–{n(Math.min((current + 1) * PAGE, filtered.length))} of {n(filtered.length)}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(0, current - 1))}
                  disabled={current === 0}
                  className="rounded-md border border-slate-700 px-2.5 py-1 font-semibold text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 font-mono tabular-nums text-slate-400">
                  {current + 1} / {pages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(pages - 1, current + 1))}
                  disabled={current >= pages - 1}
                  className="rounded-md border border-slate-700 px-2.5 py-1 font-semibold text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}