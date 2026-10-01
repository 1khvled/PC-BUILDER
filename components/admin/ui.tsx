/**
 * Admin console design primitives.
 *
 * The previous console was one 28KB server component that rendered ~4,000 rows
 * into a single page: eight KPI tiles, a 438-row dispersion table, a coverage
 * matrix and the full 3,558-row offers table, all at once, with no way to move
 * between them. Every number was hand-formatted inline and each table invented
 * its own header styling, so the same column looked different in two places.
 *
 * These primitives exist so the panels share one spacing scale, one type scale,
 * one numeric treatment and one severity vocabulary. Numbers are always
 * tabular-nums monospace: a price column that does not align vertically is
 * unreadable, and that is the entire job of this screen.
 */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ colour */

export const TONE = {
  neutral: "text-slate-300 border-slate-700 bg-slate-800/60",
  good: "text-emerald-300 border-emerald-700/60 bg-emerald-950/60",
  warn: "text-amber-300 border-amber-700/60 bg-amber-950/50",
  bad: "text-rose-300 border-rose-700/60 bg-rose-950/60",
  info: "text-sky-300 border-sky-800/60 bg-sky-950/50",
  brand: "text-[#8ecbf0] border-[#2c87c3]/50 bg-[#2c87c3]/10",
} as const;

export type Tone = keyof typeof TONE;

/* ------------------------------------------------------------- formatting */

/** Digits with thin separators, for every figure on this screen. */
export function n(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US");
}

/** Money. The console is internal and reads prices in DA throughout the site. */
export function da(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString("en-US")} DA`;
}

export function pct(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value)}%`;
}

/** "3h 12m" / "2d 4h". Scrape age is the first thing anyone asks on this screen. */
export function age(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "unknown";
  const mins = Math.max(0, Math.floor((now - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m ago`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h ago`;
}

/* ------------------------------------------------------------- containers */

export function Panel({
  title,
  subtitle,
  actions,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm print:border-slate-300"
      aria-labelledby={id ? `${id}-h` : undefined}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 print:border-slate-300">
        <div className="min-w-0">
          <h2 id={id ? `${id}-h` : undefined} className="text-sm font-bold text-white print:text-slate-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-slate-400 print:text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 print:border-slate-300 print:bg-white">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
        {label}
      </div>
      <div className={cx("mt-1 font-mono text-xl font-extrabold tabular-nums", TONE[tone].split(" ")[0])}>
        {value}
      </div>
      {sub ? <div className="mt-0.5 text-[10px] text-slate-500 print:text-slate-500">{sub}</div> : null}
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

/**
 * A zero cell in the coverage matrix.
 *
 * Red means "we track this store for this category and found nothing", which is
 * a broken scraper. Grey means "we do not track it", which is not a problem.
 * Conflating the two made the old matrix read as if 200 cells were failing.
 */
export function CoverageCell({ count, tracked }: { count: number; tracked: boolean }) {
  if (!tracked) {
    return (
      <span className="text-slate-700" title="Not tracked">
        –
      </span>
    );
  }
  if (count === 0) {
    return (
      <span
        className="inline-flex h-5 min-w-6 items-center justify-center rounded border border-rose-800 bg-rose-950 font-mono text-[10px] font-bold text-rose-300"
        title="Tracked but no matched offer — scraper may be broken"
      >
        0
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 min-w-6 items-center justify-center rounded border border-emerald-800/60 bg-emerald-950/70 font-mono text-[10px] font-semibold text-emerald-300">
      {count}
    </span>
  );
}

/**
 * The single table shell.
 *
 * `overflow-x-auto` because the dispersion and coverage tables are wider than a
 * phone and used to force the whole page sideways. The header is sticky so the
 * column meanings stay visible while scrolling ~400 rows.
 */
export function TableWrap({ children, maxHeight }: { children: React.ReactNode; maxHeight?: string }) {
  return (
    <div
      className="overflow-auto rounded-lg border border-slate-800 print:border-slate-300"
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  onClick,
  active,
  title,
  width,
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  onClick?: () => void;
  active?: boolean;
  title?: string;
  /** Column width hint in px, for the two tables with a fixed spread column. */
  width?: number;
}) {
  return (
    <th
      scope="col"
      title={title}
      style={width ? { width } : undefined}
      aria-sort={active ? "ascending" : undefined}
      className={cx(
        "sticky top-0 z-10 whitespace-nowrap border-b border-slate-800 bg-slate-950 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 print:bg-slate-100 print:text-slate-700",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        onClick && "cursor-pointer select-none hover:text-white",
        active && "text-[#8ecbf0]",
      )}
    >
      {onClick ? (
        <button type="button" onClick={onClick} className="inline-flex items-center gap-1 uppercase">
          {children}
          {active ? <span aria-hidden="true">▾</span> : null}
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  mono,
  title,
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <td
      title={title}
      className={cx(
        "border-b border-slate-800/60 px-2.5 py-1.5 print:border-slate-200",
        align === "right" && "text-right",
        align === "center" && "text-center",
        mono && "font-mono tabular-nums",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 px-4 py-8 text-center text-xs text-slate-500">
      {children}
    </div>
  );
}

/** Toolbar button. Used for scraper triggers, which open a new tab. */
export function ActionLink({
  href,
  children,
  tone = "neutral",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "good";
}) {
  const tones = {
    neutral: "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700",
    brand: "border-[#2c87c3]/60 bg-[#2c87c3]/15 text-[#8ecbf0] hover:bg-[#2c87c3]/25",
    good: "border-emerald-700/60 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60",
  } as const;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cx(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors print:hidden",
        tones[tone],
      )}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

/** Text input for the filter boxes. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-[#2c87c3] focus:outline-none sm:w-56"
      />
    </label>
  );
}

export function SegmentedFilter<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1 print:hidden">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cx(
            "rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors",
            value === o.value
              ? "border-[#2c87c3] bg-[#2c87c3]/20 text-[#8ecbf0]"
              : "border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200",
          )}
        >
          {o.label}
          {o.count != null ? <span className="ml-1 font-mono text-[10px] opacity-70">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}