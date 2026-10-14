import React from "react";

interface NiemKinhSkeletonProps {
  className?: string;
  stepCount?: number;
}

export const NiemKinhSkeleton: React.FC<NiemKinhSkeletonProps> = ({
  className = "",
  stepCount = 3,
}) => {
  return (
    <article
      className={`overflow-hidden rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-5 shadow-xs sm:p-8 space-y-6 animate-pulse ${className}`}
    >
      {/* Category Badges & Social Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 rounded-full bg-amber-200/70" />
          <div className="h-6 w-36 rounded-full bg-emerald-200/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-20 rounded-xl bg-neutral-200/60" />
          <div className="h-7 w-20 rounded-xl bg-neutral-200/60" />
        </div>
      </div>

      {/* Post Title */}
      <div className="space-y-2.5">
        <div className="h-8 w-4/5 rounded-lg bg-neutral-200/80" />
        <div className="h-8 w-1/2 rounded-lg bg-neutral-200/60" />

        {/* Author & Meta */}
        <div className="pt-2 flex items-center gap-4">
          <div className="h-4 w-36 rounded bg-neutral-200/60" />
          <div className="h-4 w-24 rounded bg-neutral-200/50" />
        </div>
      </div>

      {/* Steps Accordion Skeleton */}
      <div className="space-y-3.5 pt-2">
        {/* Step 1: Expanded Bar + Content */}
        <div className="overflow-hidden rounded-2xl border border-amber-300/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between bg-[#FEDA7A]/80 px-4 py-3.5 sm:px-5">
            <div className="h-5 w-48 rounded bg-amber-900/20" />
            <div className="h-6 w-6 rounded-md bg-amber-900/20" />
          </div>
          <div className="bg-[#FEF9EE]/90 p-4 sm:p-6 space-y-2.5">
            <div className="h-4 w-full rounded bg-amber-900/10" />
            <div className="h-4 w-11/12 rounded bg-amber-900/10" />
            <div className="h-4 w-4/5 rounded bg-amber-900/10" />
            <div className="h-4 w-2/3 rounded bg-amber-900/10" />
          </div>
        </div>

        {/* Collapsed Steps */}
        {Array.from({ length: Math.max(1, stepCount - 1) }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-amber-300/80 bg-white shadow-2xs"
          >
            <div className="flex items-center justify-between bg-[#FEDA7A]/60 px-4 py-3.5 sm:px-5">
              <div
                className="h-5 rounded bg-amber-900/20"
                style={{ width: `${Math.min(260, 180 + i * 40)}px` }}
              />
              <div className="h-6 w-6 rounded-md bg-amber-900/20" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Dedication Blessing Note Skeleton */}
      <div className="border-t border-[#EDE5D8] pt-6 flex justify-center">
        <div className="h-3.5 w-72 rounded bg-neutral-200/50" />
      </div>
    </article>
  );
};
