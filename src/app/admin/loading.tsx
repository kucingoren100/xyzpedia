export default function AdminLoading() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      {/* Top indeterminate loader bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffd731] via-[#55db9c] to-[#38bdf8] z-50" />

      {/* Topbar skeleton */}
      <div className="h-16 bg-white dark:bg-[#161622] border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
        <div className="space-y-1">
          <div className="w-36 h-4 bg-gray-200 dark:bg-[#20202e] rounded" />
          <div className="w-64 h-3 bg-gray-100 dark:bg-[#1a1a24] rounded" />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#20202e]" />
      </div>

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white dark:bg-[#181824] ink-border dark:border-[#38384a]"
            />
          ))}
        </div>

        {/* Big content box skeleton */}
        <div className="h-96 rounded-3xl bg-white dark:bg-[#181824] ink-border dark:border-[#38384a]" />
      </main>
    </div>
  );
}
