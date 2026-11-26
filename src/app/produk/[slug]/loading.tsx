export default function ProductLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 animate-pulse">
      {/* Top indeterminate loader bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffd731] via-[#55db9c] to-[#38bdf8] z-50" />

      {/* Back button skeleton */}
      <div className="w-40 h-8 rounded-full bg-gray-200 dark:bg-[#20202e] ink-border" />

      {/* Header bar skeleton */}
      <div className="h-36 sm:h-44 rounded-3xl bg-gray-200 dark:bg-[#1a1a28] ink-border" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-48 rounded-2xl bg-gray-200 dark:bg-[#1a1a28] ink-border" />
          <div className="h-96 rounded-2xl bg-gray-200 dark:bg-[#1a1a28] ink-border" />
        </div>
        <div className="lg:col-span-4 hidden lg:block">
          <div className="h-80 rounded-2xl bg-gray-200 dark:bg-[#1a1a28] ink-border" />
        </div>
      </div>
    </div>
  );
}
