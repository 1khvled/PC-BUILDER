export default function ProductLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8" aria-busy="true">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60" aria-hidden="true">
        <div className="dz-skeleton rounded-md h-4 w-64" />
        <div className="dz-skeleton rounded-lg h-7 w-20" />
      </div>

      {/* 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 order-2 lg:order-none space-y-8 min-w-0">
          {/* Hero Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Media Stage */}
              <div className="md:col-span-5">
                <div className="dz-skeleton rounded-2xl h-[260px] sm:h-[300px] w-full" />
              </div>
              {/* Identity & Highlights */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-2">
                  <div className="dz-skeleton rounded-md h-4 w-28" />
                  <div className="dz-skeleton rounded-xl h-9 w-full max-w-md" />
                </div>
                {/* 4 Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="dz-skeleton rounded-xl h-14 w-full" />
                  ))}
                </div>
                {/* Highlight chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <div className="dz-skeleton rounded-md h-6 w-24" />
                  <div className="dz-skeleton rounded-md h-6 w-32" />
                  <div className="dz-skeleton rounded-md h-6 w-28" />
                </div>
              </div>
            </div>
          </div>

          {/* Specs Card Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="p-5 bg-slate-50/80 border-b border-slate-200/80">
              <div className="dz-skeleton rounded-md h-5 w-56" />
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="dz-skeleton rounded-lg h-14 w-full" />
                <div className="dz-skeleton rounded-lg h-14 w-full" />
                <div className="dz-skeleton rounded-lg h-14 w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="dz-skeleton rounded-lg h-8 w-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Offers Table Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 space-y-3">
              <div className="dz-skeleton rounded-md h-5 w-64" />
              <div className="flex gap-2">
                <div className="dz-skeleton rounded-lg h-8 w-32" />
                <div className="dz-skeleton rounded-lg h-8 w-28" />
              </div>
            </div>
            <div className="divide-y divide-slate-100 p-3 sm:p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="dz-skeleton rounded-xl h-16 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Buy Box (4 cols) */}
        <div className="lg:col-span-4 order-1 lg:order-none">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 space-y-5">
            <div className="space-y-2">
              <div className="dz-skeleton rounded h-3 w-28" />
              <div className="dz-skeleton rounded-xl h-10 w-44" />
              <div className="dz-skeleton rounded-xl h-12 w-full" />
            </div>
            <div className="dz-skeleton rounded-xl h-12 w-full" />
            <div className="dz-skeleton rounded-xl h-10 w-full" />
            <div className="dz-skeleton rounded-xl h-24 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
