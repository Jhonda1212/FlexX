export function FlexSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.07] ${className}`} />;
}

export function FlexSkeletonCard() {
  return (
    <div className="surface rounded-lg p-5">
      <FlexSkeleton className="h-3 w-28" />
      <FlexSkeleton className="mt-5 h-9 w-24" />
      <FlexSkeleton className="mt-4 h-3 w-40" />
    </div>
  );
}
