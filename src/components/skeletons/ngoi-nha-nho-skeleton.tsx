import React from "react";

export interface NgoiNhaNhoItemSkeletonProps {
  className?: string;
}

export const NgoiNhaNhoItemSkeleton: React.FC<NgoiNhaNhoItemSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#EDE5D8]/80 bg-white/70 p-4 sm:p-5 shadow-2xs animate-pulse ${className}`}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0 w-full">
        {/* Number placeholder */}
        <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-neutral-200" />
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 rounded-full bg-neutral-200" />
            <div className="h-3 w-16 rounded bg-neutral-200" />
          </div>
          <div className="h-5 w-3/4 rounded bg-neutral-200" />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <div className="h-14 w-18 rounded-xl bg-neutral-200" />
        <div className="h-4 w-14 rounded bg-neutral-200" />
      </div>
    </div>
  );
};

export interface NgoiNhaNhoSkeletonProps {
  className?: string;
  count?: number;
}

export const NgoiNhaNhoSkeleton: React.FC<NgoiNhaNhoSkeletonProps> = ({
  className = "",
  count = 6,
}) => {
  return (
    <div className={`flex flex-col space-y-3.5 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <NgoiNhaNhoItemSkeleton key={index} />
      ))}
    </div>
  );
};
