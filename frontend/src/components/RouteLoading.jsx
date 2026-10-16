export default function RouteLoading() {
  return (
    <div className="space-y-5 py-2" role="status" aria-label="Loading page">
      <span className="sr-only">Loading page</span>
      <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
