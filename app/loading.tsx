export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="bg-slate-200 rounded h-7 w-48 sm:w-64" />
          <div className="bg-slate-200 rounded h-4 w-72 sm:w-96" />
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-200 rounded h-9 w-28 sm:w-36" />
          <div className="bg-slate-200 rounded h-9 w-24 hidden sm:block" />
        </div>
      </div>

      {/* Compatibility Banner Skeleton */}
      <div className="bg-slate-200 rounded h-14 w-full border border-slate-200/80" />

      {/* Table Skeleton */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden divide-y divide-slate-100">
        <div className="p-3.5 bg-slate-50 flex justify-between">
          <div className="bg-slate-200 rounded h-4 w-28" />
          <div className="bg-slate-200 rounded h-4 w-36" />
        </div>

        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            {/* Component label */}
            <div className="flex items-center gap-2 w-32 shrink-0">
              <div className="bg-slate-200 rounded w-7 h-7 shrink-0" />
              <div className="bg-slate-200 rounded h-4 w-20" />
            </div>

            {/* Thumbnail */}
            <div className="bg-slate-200 rounded w-12 h-12 shrink-0" />

            {/* Title & Spec pills */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="bg-slate-200 rounded h-4" style={{ width: `${40 + (i % 4) * 15}%` }} />
              <div className="flex gap-1.5">
                <div className="bg-slate-200 rounded-full h-4 w-12" />
                <div className="bg-slate-200 rounded-full h-4 w-14" />
                <div className="bg-slate-200 rounded-full h-4 w-10 hidden sm:block" />
              </div>
            </div>

            {/* Price */}
            <div className="bg-slate-200 rounded h-5 w-24 shrink-0 text-right" />

            {/* Where / Button */}
            <div className="bg-slate-200 rounded h-8 w-28 shrink-0 hidden sm:block" />
          </div>
        ))}

        {/* Bottom Total Skeleton */}
        <div className="p-4 bg-slate-900 flex justify-between items-center">
          <div className="bg-slate-700 rounded h-6 w-48" />
          <div className="bg-slate-700 rounded h-9 w-36" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Chargement des composants et des prix live en Algérie…</span>
      </div>
    </main>
  );
}
