export default function ProductLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-8" aria-busy="true">
      {/* Breadcrumb */}
      <div className="dz-skeleton rounded-md h-4 w-64" aria-hidden="true" />

      {/* Same 12-column split as the real page: the buy box is the element the
          visitor came for, so it is reserved at the right shape from the start
          rather than appearing after a layout shift. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 order-2 lg:order-none space-y-8">
          {/* Hero: badges row, then image + title block */}
          <div className="bg-white rounded border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 mb-6" aria-hidden="true">
              <div className="dz-skeleton rounded-full h-6 w-28" />
              <div className="dz-skeleton rounded-full h-6 w-32" />
              <div className="dz-skeleton rounded-full h-6 w-24" />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              <div className="dz-skeleton rounded w-[132px] h-[132px] shrink-0" />
              <div className="min-w-0 flex-1 w-full space-y-3">
                <div className="dz-skeleton rounded h-3 w-24" />
                <div className="dz-skeleton rounded-lg h-9 w-full max-w-md" />
                <div className="dz-skeleton rounded h-3 w-2/3" />
                <div className="flex flex-wrap gap-1.5">
                  <div className="dz-skeleton rounded h-7 w-24" />
                  <div className="dz-skeleton rounded h-7 w-28" />
                  <div className="dz-skeleton rounded h-7 w-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Spec table */}
          <div className="bg-white rounded border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200">
              <div className="dz-skeleton rounded h-5 w-56" aria-hidden="true" />
            </div>
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 p-4 gap-2">
                  <div className="dz-skeleton rounded h-4 w-32" />
                  <div className="dz-skeleton rounded h-4 w-40" />
                </div>
              ))}
            </div>
          </div>

          {/* Offers table header + a few rows */}
          <section className="space-y-3">
            <div className="dz-skeleton rounded h-6 w-72" aria-hidden="true" />
            <div className="bg-white rounded border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap gap-3">
                <div className="dz-skeleton rounded-full h-10 w-40" />
                <div className="dz-skeleton rounded-full h-10 w-32" />
              </div>
              <div className="p-3 space-y-3 md:hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="dz-skeleton rounded-xl h-28 w-full" />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sticky buy box */}
        <div className="lg:col-span-4 order-1 lg:order-none">
          <div className="bg-white rounded border border-slate-200 shadow-md p-6 space-y-5">
            <div className="space-y-2" aria-hidden="true">
              <div className="dz-skeleton rounded h-3 w-32" />
              <div className="dz-skeleton rounded-lg h-11 w-48" />
              <div className="dz-skeleton rounded h-3 w-56" />
            </div>
            <div className="dz-skeleton rounded h-12 w-full" aria-hidden="true" />
            <div className="dz-skeleton rounded h-10 w-full" aria-hidden="true" />
            <div className="dz-skeleton rounded-lg h-24 w-full" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400" role="status" aria-live="polite">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
        <span>Loading the page…</span>
      </div>
    </main>
  );
}
