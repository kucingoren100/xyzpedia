export default function GlobalLoading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-8 animate-pulse">
      {/* Top indeterminate loader bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffd731] via-[#55db9c] to-[#38bdf8] z-50 animate-pulse" />

      {/* Hero Skeleton */}
      <div className="w-full h-48 sm:h-64 rounded-3xl bg-gray-200 dark:bg-[#1a1a28] ink-border" />

      {/* Categories skeleton */}
      <div className="flex gap-3 overflow-hidden py-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-28 h-10 rounded-xl bg-gray-200 dark:bg-[#20202e] shrink-0 ink-border"
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div
            key={i}
            className="aspect-[4/5] rounded-2xl bg-gray-200 dark:bg-[#1a1a28] ink-border"
          />
        ))}
      </div>
    </div>
  );
}
