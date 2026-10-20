import React from "react";

interface KhaiThiSkeletonProps {
  className?: string;
  count?: number;
}

export const KhaiThiSkeleton: React.FC<KhaiThiSkeletonProps> = ({
  className = "",
  count = 3,
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-2xl border border-[#EDE5D8]/90 bg-white/80 p-5 shadow-2xs animate-pulse space-y-4"
        >
          <div className="space-y-3">
            {/* Header badge & date skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded-full bg-neutral-200/80" />
              <div className="h-3.5 w-16 rounded bg-neutral-200/60" />
            </div>

            {/* Title skeleton */}
            <div className="h-5 w-4/5 rounded-md bg-neutral-200/80" />

            {/* Content snippet skeleton */}
            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full rounded bg-neutral-200/60" />
              <div className="h-3.5 w-full rounded bg-neutral-200/60" />
              <div className="h-3.5 w-3/4 rounded bg-neutral-200/50" />
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <div className="h-3.5 w-28 rounded bg-neutral-200/60" />
            <div className="h-3.5 w-16 rounded bg-neutral-200/60" />
          </div>
        </div>
      ))}
    </div>
  );
};

