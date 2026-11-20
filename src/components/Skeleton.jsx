export function SkeletonRows({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-4">
          <div className="skeleton h-3.5 w-1/3" />
          <div className="skeleton mt-3 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="skeleton mt-4 h-6 w-20" />
          <div className="skeleton mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3">
        <div className="skeleton h-3 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-5 py-4 last:border-0">
          <div className="skeleton h-3 w-1/4" />
          <div className="skeleton h-3 w-1/5" />
          <div className="skeleton h-3 w-1/6" />
          <div className="skeleton ml-auto h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
