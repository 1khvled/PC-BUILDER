import type { PricePoint } from "@/lib/data/products";

const COLORS = ["#2c87c3", "#00b16a", "#d97706", "#7c3aed", "#d91e18"];

// Pure-SVG price history (PCPartPicker signature), no deps. Server-safe.
export default function PriceChart({ points }: { points: PricePoint[] }) {
  const daySet: Record<string, boolean> = {};
  points.forEach((p: PricePoint) => {
    daySet[p.day] = true;
  });
  const days = Object.keys(daySet).sort();
  const byStore: Record<string, PricePoint[]> = {};
  points.forEach((p: PricePoint) => {
    if (!byStore[p.store]) byStore[p.store] = [];
    byStore[p.store].push(p);
  });
  const stores = Object.keys(byStore)
    .map((s) => ({ s, pts: byStore[s].sort((a: PricePoint, b: PricePoint) => (a.day < b.day ? -1 : 1)) }))
    .sort((a, b) => b.pts.length - a.pts.length)
    .slice(0, 4);

  if (days.length < 2) {
    return (
      <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-4">
        Historique en cours de construction — {points.length} relevé{points.length > 1 ? "s" : ""} à ce jour.
        Revenez après le prochain relevé quotidien pour voir la courbe.
        <div className="flex flex-wrap gap-1.5 mt-2">
          {stores.map(({ s, pts }) => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-white border text-[11px]">
              {s}: {pts[pts.length - 1].price.toLocaleString("fr-DZ")} DA
            </span>
          ))}
        </div>
      </div>
    );
  }

  const W = 560;
  const H = 180;
  const PAD = 8;
  const all = points.map((p) => p.price);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = Math.max(1, max - min);
  const x = (d: string) => PAD + (days.indexOf(d) / Math.max(1, days.length - 1)) * (W - PAD * 2);
  const y = (v: number) => PAD + (1 - (v - min) / span) * (H - PAD * 2 - 14);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Historique des prix">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - PAD * 2 - 14)} y2={PAD + f * (H - PAD * 2 - 14)} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {stores.map(({ s, pts }, i) => (
          <g key={s}>
            <polyline
              points={pts.map((p) => `${x(p.day)},${y(p.price)}`).join(" ")}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {pts.map((p) => (
              <circle key={p.day + p.price} cx={x(p.day)} cy={y(p.price)} r="3" fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="1.5" />
            ))}
          </g>
        ))}
        <text x={PAD} y={H - 2} fontSize="10" fill="#94a3b8">{days[0]}</text>
        <text x={W - PAD} y={H - 2} fontSize="10" fill="#94a3b8" textAnchor="end">{days[days.length - 1]}</text>
        <text x={W - PAD} y={PAD + 8} fontSize="10" fill="#64748b" textAnchor="end">{max.toLocaleString("fr-DZ")} DA</text>
        <text x={W - PAD} y={H - 16} fontSize="10" fill="#64748b" textAnchor="end">{min.toLocaleString("fr-DZ")} DA</text>
      </svg>
      <div className="flex flex-wrap gap-3 mt-1">
        {stores.map(({ s }, i) => (
          <span key={s} className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
