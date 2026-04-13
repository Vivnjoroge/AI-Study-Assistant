export function DocumentSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/50 dark:border-white/5 bg-white shadow-sm dark:bg-white/[0.03] p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-lg bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-1/4 rounded-lg bg-slate-100 dark:bg-white/10" />
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        <div className="h-3 w-16 rounded-md bg-slate-100 dark:bg-white/5" />
        <div className="h-3 w-16 rounded-md bg-slate-100 dark:bg-white/5" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-9 flex-1 rounded-xl bg-slate-100 dark:bg-white/5" />
        <div className="h-9 flex-1 rounded-xl bg-slate-100 dark:bg-white/5" />
        <div className="h-9 flex-1 rounded-xl bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/50 dark:border-white/5 bg-white p-6 animate-pulse dark:bg-white/[0.03]">
      <div className="h-8 w-1/2 rounded-lg bg-slate-200 dark:bg-white/10 mb-2" />
      <div className="h-4 w-3/4 rounded-lg bg-slate-100 dark:bg-white/5" />
    </div>
  );
}
