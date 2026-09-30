export default function CategoryLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6" aria-busy="true">
      {/* Breadcrumb — matches the real breadcrumb row */}
      <div className="dz-skeleton rounded-md h-4 w-56" aria-hidden="true" />

      {/* h1 + model-count pill */}
      <div className="flex items-center gap-2.5" aria-hidden="true">
        <div className="dz-skeleton rounded-lg h-8 w-52" />
        <div className="dz-skeleton rounded-full h-6 w-20" />
      </div>

      {/* Toolbar: search + view toggle, then the filter/sort row */}
      <div className="panel p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="dz-skeleton rounded-full h-11 w-full max-w-sm" />
          <div className="dz-skeleton rounded-full h-10 w-32" />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100">
          <div className="dz-skeleton rounded-full h-10 w-32" />
          <div className="dz-skeleton rounded-full h-10 w-24" />
          <div className="dz-skeleton rounded-full h-10 w-40" />
        </div>
      </div>

      {/* Card grid — same 1-col-below-md / 3-col-above shape as the real list,
          so nothing jumps when the data lands. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 border border-slate-200/90 bg-white flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <div className="dz-skeleton rounded-md h-5 w-16" />
              <div className="dz-skeleton rounded-full h-5 w-14" />
            </div>
            <div className="flex items-start gap-3.5">
              <div className="dz-skeleton rounded-xl w-14 h-14 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="dz-skeleton rounded-md h-4 w-full" />
                <div className="flex gap-1">
                  <div className="dz-skeleton rounded-md h-4 w-16" />
                  <div className="dz-skeleton rounded-md h-4 w-20" />
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
              <div className="space-y-1.5">
                <div className="dz-skeleton rounded h-3 w-14" />
                <div className="dz-skeleton rounded-md h-5 w-24" />
              </div>
              <div className="dz-skeleton rounded-lg h-11 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400" role="status" aria-live="polite">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
        <span>Loading the page…</span>
      </div>
    </main>
  );
}
