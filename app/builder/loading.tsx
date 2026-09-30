export default function EnglishBuilderLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="dz-skeleton rounded-lg h-8 w-44 sm:w-60" />
            <div className="dz-skeleton rounded-full h-6 w-32" />
          </div>
          <div className="dz-skeleton rounded-md h-4 w-72 sm:w-96" />
        </div>
        <div className="flex gap-2">
          <div className="dz-skeleton rounded-lg h-9 w-28 sm:w-36" />
          <div className="dz-skeleton rounded-lg h-9 w-24 hidden sm:block" />
        </div>
      </div>

      {/* Compatibility Banner Skeleton */}
      <div className="dz-skeleton rounded-xl h-14 w-full" />

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden divide-y divide-slate-100">
        <div className="p-3.5 bg-slate-50/80 flex justify-between">
          <div className="dz-skeleton rounded-md h-4 w-28" />
          <div className="dz-skeleton rounded-md h-4 w-36" />
        </div>

        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            {/* Component label */}
            <div className="flex items-center gap-2.5 w-32 shrink-0">
              <div className="dz-skeleton rounded-lg w-8 h-8 shrink-0" />
              <div className="dz-skeleton rounded-md h-4 w-20" />
            </div>

            {/* Thumbnail */}
            <div className="dz-skeleton rounded-lg w-12 h-12 shrink-0" />

            {/* Title & Spec pills */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="dz-skeleton rounded-md h-4" style={{ width: `${40 + (i % 4) * 15}%` }} />
              <div className="flex gap-1.5">
                <div className="dz-skeleton rounded-md h-4 w-12" />
                <div className="dz-skeleton rounded-md h-4 w-14" />
                <div className="dz-skeleton rounded-md h-4 w-10 hidden sm:block" />
              </div>
            </div>

            {/* Price */}
            <div className="dz-skeleton rounded-md h-5 w-24 shrink-0 text-right" />

            {/* Where / Button */}
            <div className="dz-skeleton rounded-lg h-8 w-28 shrink-0 hidden sm:block" />
          </div>
        ))}

        {/* Bottom Total Skeleton */}
        <div className="p-4 bg-[#11111c] flex justify-between items-center">
          <div className="dz-skeleton rounded-md h-6 w-48 opacity-70" />
          <div className="dz-skeleton rounded-lg h-9 w-36 opacity-70" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Loading components and live prices in Algeria…</span>
      </div>
    </main>
  );
}
