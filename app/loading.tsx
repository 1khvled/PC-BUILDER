export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Breadcrumb Skeleton */}
      <div className="bg-slate-200 rounded h-4 w-56" />

      {/* Title Skeleton */}
      <div className="bg-white rounded border border-slate-200 p-6 space-y-3">
        <div className="bg-slate-200 rounded h-8 w-2/3" />
        <div className="bg-slate-200 rounded h-4 w-full" />
        <div className="bg-slate-200 rounded h-4 w-5/6" />
      </div>

      {/* Generic Rows Skeleton */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="bg-slate-200 rounded w-12 h-12 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="bg-slate-200 rounded h-4" style={{ width: `${45 + (i % 3) * 12}%` }} />
              <div className="bg-slate-200 rounded h-3 w-1/3" />
            </div>
            <div className="bg-slate-200 rounded h-5 w-24 shrink-0" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Chargement de la page…</span>
      </div>
    </main>
  );
}
