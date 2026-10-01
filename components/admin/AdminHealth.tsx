"use client";

import { useState } from "react";
import type { AdminData } from "@/lib/admin/data";
import { ActionLink, Badge, Empty, Panel, SegmentedFilter, cx, n } from "./ui";

/**
 * HEALTH
 * ======
 * The algorithm self-check, one rule per row with its actual assertion.
 *
 * This panel is why the console crashed in the first place: `selfCheck()` runs
 * the real builder and the real compatibility engine, and when it threw, the
 * page it was rendering on took the whole console down with it. It now renders
 * failures first with the detail inline, so the fix is visible without opening
 * a log, and each failure is the first thing you see rather than buried in a
 * scrollable sub-list.
 */
export default function AdminHealth({ data }: { data: AdminData }) {
  const [show, setShow] = useState<"failed" | "all">("failed");

  const ordered = [...data.checks].sort((a, b) => Number(a.ok) - Number(b.ok));
  const rows = show === "failed" ? ordered.filter((c) => !c.ok) : ordered;
  const failed = data.checks.filter((c) => !c.ok).length;

  return (
    <div className="space-y-5">
      <Panel
        title="Algorithm self-check"
        subtitle="Each rule calls the real builder or compatibility engine and asserts an outcome. A failure here is a real regression, not a stale fixture."
        actions={
          <>
            <Badge tone={failed === 0 ? "good" : "bad"}>
              {failed === 0 ? `${n(data.checks.length)} passing` : `${failed} failing`}
            </Badge>
            <SegmentedFilter
              label="Filter checks"
              value={show}
              onChange={setShow}
              options={[
                { value: "failed", label: "Failures", count: failed || undefined },
                { value: "all", label: "All", count: data.checks.length },
              ]}
            />
          </>
        }
      >
        {rows.length === 0 ? (
          <Empty>
            All {n(data.checks.length)} checks pass. The builder, the tier tables and the compatibility
            rules all agree.
          </Empty>
        ) : (
          <ul className="space-y-2">
            {rows.map((c) => (
              <li
                key={c.name}
                className={cx(
                  "flex items-start gap-3 rounded-lg border px-3 py-2.5",
                  c.ok
                    ? "border-slate-800 bg-slate-950/50"
                    : "border-rose-800/60 bg-rose-950/25",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    c.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/25 text-rose-200",
                  )}
                >
                  {c.ok ? "✓" : "✕"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cx("text-xs font-bold", c.ok ? "text-slate-200" : "text-rose-100")}>{c.name}</p>
                  {c.detail ? (
                    <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-slate-400">{c.detail}</p>
                  ) : null}
                </div>
                <span className="sr-only">{c.ok ? "passing" : "failing"}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Machine checks" subtitle="Run the same verification the console itself ran just now.">
          <ul className="space-y-2 text-xs text-slate-400">
            {[
              ["Catalogue", "node scripts/check-perf.cjs"],
              ["Guides", "node scripts/check-guides.mjs"],
              ["Dictionaries", "node scripts/check-dict.mjs"],
              ["Types", "npx tsc --noEmit"],
            ].map(([label, cmd]) => (
              <li key={label} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2 last:border-0">
                <span className="font-semibold text-slate-300">{label}</span>
                <code className="rounded bg-slate-950 px-2 py-0.5 font-mono text-[11px] text-slate-400">{cmd}</code>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            These run locally or in CI. They are listed here because a failing rule on this tab usually
            means one of them is failing too.
          </p>
        </Panel>

        <Panel title="Scraper triggers" subtitle="Each opens the cron endpoint in a new tab and streams its JSON response.">
          <div className="flex flex-wrap gap-2">
            <ActionLink href="/api/cron/refresh?scope=full&full=1" tone="good">
              Full re-scrape
            </ActionLink>
            <ActionLink href="/api/cron/refresh?scope=quick" tone="brand">
              Quick refresh
            </ActionLink>
            <ActionLink href="/api/products">Products API</ActionLink>
            <ActionLink href="/api/builds">Builds &amp; algo JSON</ActionLink>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            The cron endpoints are unauthenticated by design so Vercel Cron can reach them. They are
            rate-limited and bounded per run; treat them as internal.
          </p>
        </Panel>
      </div>
    </div>
  );
}