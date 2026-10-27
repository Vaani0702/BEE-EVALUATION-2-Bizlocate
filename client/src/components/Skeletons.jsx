// Grey shimmering boxes shown while data is loading.
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-64">
      <div className="skeleton md:w-2/5 h-48 md:h-full !rounded-none" />
      <div className="p-6 flex-grow space-y-4">
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return <div className="flex flex-col gap-6">{Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}</div>;
}
