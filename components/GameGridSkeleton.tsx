export function GameGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="در حال بارگذاری بازی‌ها"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="aspect-video w-full animate-pulse bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="flex gap-2">
              <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
              <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
