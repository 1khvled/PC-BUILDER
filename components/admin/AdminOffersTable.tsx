"use client";

import { useMemo, useState } from "react";
import type { AdminData } from "@/lib/admin/data";
import { CATEGORIES } from "@/lib/data/products";
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
} from "./ui";

type Sort = "price" | "store" | "wilaya" | "title" | "condition";
const PAGE = 150;

/**
 * OFFERS
 * =====
 * Every indexed offer, searchable.
 *
 * The old table shipped all 3,558 rows into the document and filtered them
 * client-side on each keystroke with a template literal built per row. It also
 * had no way to see or filter the offers that match nothing, which is the most
 * useful subset when a matcher regresses. Both are fixed: the search runs
 * against a prebuilt lowercase index, unmatched offers are a first-class filter,
 * and rows are paged so the DOM stays small.
 */
export default function AdminOffersTable({ data }: { data: AdminData }) {
  const [q, setQ] = useState("");
  const [store, setStore] = useState("all");
  const [cat, setCat] = useState("all");
  const [cond, setCond] = useState("all");
  const [matched, setMatched] = useState<"all" | "matched" | "unmatched">("all");
  const [sort, setSort] = useState<Sort>("price");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const stores = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of data.offers) counts.set(o.store, (counts.get(o.store) ?? 0) + 1);
    return [
      { value: "all", label: "All stores", count: data.offers.length },
      ...Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([s, count]) => ({ value: s, label: s, count })),
    ];
  }, [data.offers]);

  // Prebuilt once per dataset rather than per keystroke: the old code rebuilt a
  // lowercase haystack for all 3,558 rows on every character typed.
  const haystack = useMemo(
    () => data.offers.map((o) => `${o.title} ${o.store} ${o.wilaya} ${o.productId}`.toLowerCase()),
    [data.offers],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out: number[] = [];
    for (let i = 0; i < data.offers.length; i++) {
      const o = data.offers[i];
      if (store !== "all" && o.store !== store) continue;
      if (cat !== "all" && o.category !== cat) continue;
      if (cond !== "all" && o.condition !== cond) continue;
      if (matched === "matched" && !o.matched) continue;
      if (matched === "unmatched" && o.matched) continue;
      if (needle && !haystack[i].includes(needle)) continue;
      out.push(i);
    }
    const mul = dir === "asc" ? 1 : -1;
    out.sort((a, b) => {
      const x = data.offers[a];
      const y = data.offers[b];
      switch (sort) {
        case "store":
          return mul * x.store.localeCompare(y.store) || mul * (x.priceDa - y.priceDa);
        case "wilaya":
          return mul * x.wilaya.localeCompare(y.wilaya) || mul * (x.priceDa - y.priceDa);
        case "title":
          return mul * x.title.localeCompare(y.title);
        case "condition":
          return mul * x.condition.localeCompare(y.condition) || mul * (x.priceDa - y.priceDa);
        default:
          return mul * (x.priceDa - y.priceDa);
      }
    });
    return out;
  }, [data.offers, haystack, q, store, cat, cond, matched, sort, dir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const view = filtered.slice(current * PAGE, current * PAGE + PAGE).map((i) => data.offers[i]);

  const header = (field: Sort, label: string, align: "left" | "right" = "left") => (
    <Th
      align={align}
      active={sort === field}
      onClick={() => {
        if (sort === field) setDir(dir === "asc" ? "desc" : "asc");
        else {
          setSort(field);
          setDir(field === "price" ? "asc" : "asc");
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
      title="All offers"
      subtitle="Everything currently indexed. Unmatched rows point at a product id the catalogue does not have."
      actions={
        <span className="font-mono text-[11px] tabular-nums text-slate-400">{n(filtered.length)} shown</span>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
        <SearchInput
          value={q}
          onChange={(v) => reset(() => setQ(v))}
          label="Search offers"
          placeholder="Search title, store, wilaya or product id"
        />
        <SegmentedFilter label="Filter by store" value={store} onChange={(v) => reset(() => setStore(v))} options={stores} />
        <SegmentedFilter
          label="Filter by category"
          value={cat}
          onChange={(v) => reset(() => setCat(v))}
          options={[{ value: "all", label: "All cats" }, ...CATEGORIES.map((c) => ({ value: c.slug, label: c.slug }))]}
        />
        <SegmentedFilter
          label="Filter by condition"
          value={cond}
          onChange={(v) => reset(() => setCond(v))}
          options={[
            { value: "all", label: "Any" },
            { value: "new", label: "New", count: data.totals.newCount },
            { value: "used", label: "Used", count: data.totals.usedCount },
          ]}
        />
        <SegmentedFilter
          label="Filter by match state"
          value={matched}
          onChange={(v) => reset(() => setMatched(v))}
          options={[
            { value: "all", label: "Any" },
            { value: "matched", label: "Matched" },
            { value: "unmatched", label: "Unmatched", count: data.totals.unmatched },
          ]}
        />
      </div>

      {view.length === 0 ? (
        <Empty>No offers match these filters.</Empty>
      ) : (
        <>
          <TableWrap maxHeight="65vh">
            <thead>
              <tr>
                <Th align="right" width={90}>
                  Price
                </Th>
                <Th>Listing title</Th>
                <Th>Category</Th>
                <Th>Product id</Th>
                {header("store", "Store")}
                {header("wilaya", "Wilaya")}
                {header("condition", "Cond.")}
                <Th>Stock</Th>
              </tr>
            </thead>
            <tbody>
              {view.map((o) => (
                <tr key={o.id} className={cx("hover:bg-slate-800/40", !o.matched && "bg-rose-950/10")}>
                  <Td align="right" mono className="font-bold text-emerald-300">
                    {n(o.priceDa)}
                  </Td>
                  <Td title={o.title}>
                    <span className="line-clamp-1">{o.title}</span>
                  </Td>
                  <Td>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {o.category}
                    </span>
                  </Td>
                  <Td mono title={o.productId}>
                    {o.matched ? (
                      <span className="text-slate-400">{o.productId}</span>
                    ) : (
                      <Badge tone="bad">no match</Badge>
                    )}
                  </Td>
                  <Td>{o.store}</Td>
                  <Td className="text-slate-400">{o.wilaya}</Td>
                  <Td>
                    <Badge tone={o.condition === "new" ? "good" : "neutral"}>{o.condition}</Badge>
                  </Td>
                  <Td className="text-slate-400">{o.stock || "—"}</Td>
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