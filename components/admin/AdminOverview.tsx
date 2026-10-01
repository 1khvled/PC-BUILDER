"use client";

import Link from "next/link";
import type { AdminData } from "@/lib/admin/data";
import { ActionLink, Badge, Panel, Stat, TableWrap, Td, Th, cx, da, n, pct } from "./ui";

/**
 * OVERVIEW
 * ========
 * The answer to "is anything wrong, and what do I press".
 *
 * The old header led with eight KPI tiles and buried the two figures that
 * actually predict a broken site: how many live offers point at a product id we
 * do not have, and how many catalogue products have no offers at all. Both are
 * promoted here, and the warning band only appears when they are non-zero, so a
 * healthy scrape produces a short page instead of eight numbers to decode.
 */
export default function AdminOverview({ data }: { data: AdminData }) {
  const t = data.totals;
  const newShare = t.offers ? Math.round((t.newCount / t.offers) * 100) : 0;

  const problems: { tone: "bad" | "warn"; label: string; detail: string }[] = [];
  if (t.unmatched > 0) {
    problems.push({
      tone: "bad",
      label: `${n(t.unmatched)} offers match nothing`,
      detail:
        "These offers are indexed but point at a product id that is not in the catalogue, so they appear on no product page. Usually an alias table that lost an entry after a product was renamed.",
    });
  }
  if (t.orphanedProducts > 0) {
    problems.push({
      tone: "warn",
      label: `${n(t.orphanedProducts)} products have no offers`,
      detail:
        "Catalogue entries with nothing behind them. They still render on category pages as unpriced rows, which is worse for trust than not listing them.",
    });
  }
  if (!data.checkPass) {
    const failed = data.checks.filter((c) => !c.ok);
    problems.push({
      tone: "bad",
      label: `${failed.length} algorithm checks failing`,
      detail: `First failure: ${failed[0].name} — ${failed[0].detail || "no detail"}. See the Health tab.`,
    });
  }
  if (!data.dbLive) {
    problems.push({
      tone: "warn",
      label: "Serving baked data, not the database",
      detail:
        "Supabase is not configured, so every figure on this screen comes from the static snapshot in lib/data/live.ts. Nothing here reflects a live scrape.",
    });
  }

  const gpu = data.price.byCategory.find((c) => c.category === "gpu");

  return (
    <div className="space-y-5">
      {problems.length > 0 ? (
        <section
          aria-label="Needs attention"
          className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-4 print:border-slate-300 print:bg-white"
        >
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-200 print:text-slate-900">
            Needs attention
          </h2>
          <ul className="space-y-2.5">
            {problems.map((p) => (
              <li key={p.label} className="flex gap-2.5 text-xs">
                <span
                  aria-hidden="true"
                  className={cx(
                    "mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full",
                    p.tone === "bad" ? "bg-rose-400" : "bg-amber-400",
                  )}
                />
                <span className="min-w-0">
                  <b className={p.tone === "bad" ? "text-rose-200 print:text-slate-900" : "text-amber-200 print:text-slate-900"}>
                    {p.label}
                  </b>
                  <span className="ml-2 text-slate-400 print:text-slate-600">{p.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Panel
        title="Catalogue"
        subtitle="What the site is currently serving to visitors."
        actions={
          <>
            <ActionLink href="/api/cron/refresh?scope=full&full=1" tone="good">
              Full re-scrape
            </ActionLink>
            <ActionLink href="/api/products">Products API</ActionLink>
            <ActionLink href="/api/builds">Builds &amp; algo JSON</ActionLink>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Live offers" value={n(t.offers)} sub={`${n(t.stores)} stores`} />
          <Stat
            label="Matched"
            value={n(t.offers - t.unmatched)}
            sub={`${pct(t.offers ? ((t.offers - t.unmatched) / t.offers) * 100 : 0)} of offers`}
            tone={t.unmatched > 0 ? "warn" : "good"}
          />
          <Stat label="Products" value={n(t.products)} sub={`${n(t.orphanedProducts)} unpriced`} />
          <Stat label="New / used" value={`${newShare}%`} sub={`${n(t.newCount)} new · ${n(t.usedCount)} used`} />
          <Stat
            label="GPU median"
            value={gpu ? n(gpu.median) : "—"}
            sub={gpu ? `${n(gpu.offers)} offers priced` : "no GPU offers"}
            tone="brand"
          />
          <Stat
            label="Algo"
            value={data.checkPass ? "PASS" : "FAIL"}
            sub={`${n(data.checks.length)} rules`}
            tone={data.checkPass ? "good" : "bad"}
          />
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Price by category" subtitle="Median of matched offers, in DA.">
          <TableWrap>
            <thead>
              <tr>
                <Th>Category</Th>
                <Th align="right">Offers</Th>
                <Th align="right">Median</Th>
                <Th align="right">Range</Th>
              </tr>
            </thead>
            <tbody>
              {data.price.byCategory.map((c) => (
                <tr key={c.category} className="hover:bg-slate-800/40">
                  <Td>
                    <Link href={`/category/${c.category}`} target="_blank" className="capitalize hover:text-[#8ecbf0]">
                      {c.category}
                    </Link>
                  </Td>
                  <Td align="right" mono>{n(c.offers)}</Td>
                  <Td align="right" mono>{n(c.median)}</Td>
                  <Td align="right" mono title={`${c.min} – ${c.max}`} className="text-slate-400">
                    {n(c.min)}–{n(c.max)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Panel>

        <Panel
          title="Price outliers"
          subtitle="Components priced at 2.5x or more between sellers, with at least three offers. Either a bad price in the feed or a matcher hitting the wrong product."
        >
          {data.price.outliers.length === 0 ? (
            <p className="text-xs text-slate-500">
              None. No component has a spread above 150% across three or more sellers.
            </p>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Component</Th>
                  <Th align="right">Offers</Th>
                  <Th align="right">Spread</Th>
                </tr>
              </thead>
              <tbody>
                {data.price.outliers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40">
                    <Td>
                      <Link href={`/product/${o.id}`} target="_blank" className="hover:text-[#8ecbf0]">
                        {o.label}
                      </Link>
                    </Td>
                    <Td align="right" mono>{n(o.count)}</Td>
                    <Td align="right" mono>
                      <Badge tone={o.spreadPct >= 400 ? "bad" : "warn"}>+{o.spreadPct}%</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>

      <Panel title="Matcher queue" subtitle="Scraped listings that match no catalogue entry. Each one is a missing alias.">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono text-2xl font-extrabold tabular-nums text-amber-300">
            {n(t.unmatchedQueue)}
          </span>
          <span className="text-slate-400">
            waiting to be matched. Live, outside-the-catalogue listings: {n(t.unmatched)} of them are indexed
            but unresolved.
          </span>
        </div>
      </Panel>

      <Panel title="Infrastructure" subtitle="Where this data comes from right now.">
        <dl className="grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-slate-500">Source</dt>
            <dd className="mt-0.5">
              <Badge tone={data.dbLive ? "good" : "warn"}>
                {data.dbLive ? "Supabase (live)" : "Baked snapshot"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Last snapshot</dt>
            <dd className="mt-0.5 font-mono text-slate-300">{data.scrapedAt.slice(0, 19).replace("T", " ")}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Schema tables</dt>
            <dd className="mt-0.5">
              {data.tables.length === 0 ? (
                <span className="text-slate-500">schema.sql not found</span>
              ) : (
                <span className="flex flex-wrap gap-1">
                  {data.tables.map((tbl) => (
                    <span key={tbl} className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      {tbl}
                    </span>
                  ))}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Median GPU price</dt>
            <dd className="mt-0.5 font-mono tabular-nums text-slate-300">{gpu ? da(gpu.median) : "—"}</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}