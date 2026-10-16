export default function DealsLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-4" aria-busy="true">
      <div className="space-y-1.5 pb-2 border-b border-slate-200/80">
        <div className="dz-skeleton rounded-lg h-8 w-48" />
        <div className="dz-skeleton rounded-md h-3.5 w-64" />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#121623] rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 flex gap-3 items-center"
          >
            <div className="dz-skeleton rounded-lg w-13 h-13 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="dz-skeleton rounded-md h-4 w-3/4" />
              <div className="dz-skeleton rounded-md h-3 w-1/2" />
            </div>
            <div className="text-right shrink-0 space-y-1.5">
              <div className="dz-skeleton rounded-md h-5 w-20 ml-auto" />
              <div className="dz-skeleton rounded-full h-4 w-16 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
