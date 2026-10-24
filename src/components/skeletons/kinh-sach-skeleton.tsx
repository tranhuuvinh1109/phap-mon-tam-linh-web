import React from "react";

interface KinhSachSkeletonProps {
  className?: string;
  count?: number;
}

export const KinhSachSkeleton: React.FC<KinhSachSkeletonProps> = ({
  className = "",
  count = 6,
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-5 shadow-xs animate-pulse space-y-4"
        >
          <div className="space-y-3">
            {/* Book Cover Skeleton */}
            <div className="aspect-[3/4] max-h-52 w-full rounded-2xl bg-amber-100/60" />

            {/* Title & Author Skeleton */}
            <div className="space-y-2 pt-1">
              <div className="h-4 w-4/5 rounded-md bg-neutral-200/80" />
              <div className="h-4 w-3/5 rounded-md bg-neutral-200/60" />
              <div className="h-3 w-1/3 rounded bg-neutral-200/50 pt-1" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <div className="h-3.5 w-20 rounded bg-neutral-200/70" />
            <div className="h-3 w-14 rounded bg-neutral-200/50" />
          </div>
        </div>
      ))}
    </div>
  );
};
