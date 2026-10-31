import React from "react";

interface KhaiThiPostDetailSkeletonProps {
  className?: string;
}

export const KhaiThiPostDetailSkeleton: React.FC<
  KhaiThiPostDetailSkeletonProps
> = ({ className = "" }) => {
  return (
    <article
      className={`overflow-hidden rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-5 shadow-xs sm:p-8 space-y-6 animate-pulse ${className}`}
    >
      {/* 1. Category, Group Badges & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Badge (Khai thị) */}
          <div className="h-6 w-24 rounded-full bg-amber-100/80 border border-amber-200/60" />

          {/* Group / Topic Badge */}
          <div className="h-6 w-28 rounded-md bg-amber-50 border border-amber-200/50" />

          {/* Type Badge */}
          <div className="h-6 w-20 rounded-full bg-emerald-50 border border-emerald-200/50" />
        </div>

        {/* Action buttons: Bookmark & Share */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-20 rounded-xl bg-neutral-100 border border-[#EDE5D8]" />
          <div className="h-7 w-20 rounded-xl bg-neutral-100 border border-[#EDE5D8]" />
        </div>
      </div>

      {/* 2. Article Title */}
      <div className="space-y-2.5">
        <div className="h-8 w-4/5 rounded-lg bg-neutral-200/80" />
        <div className="h-8 w-3/5 rounded-lg bg-neutral-200/60" />

        {/* Author & Publication Meta */}
        <div className="pt-2 flex items-center gap-4 flex-wrap">
          <div className="h-4 w-36 rounded bg-neutral-200/60" />
          <div className="h-3 w-3 rounded-full bg-neutral-200/40" />
          <div className="h-4 w-24 rounded bg-neutral-200/50" />
        </div>
      </div>

      {/* 3. Audio Player Card Placeholder (if applicable) */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-amber-300/60" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded bg-amber-900/20" />
            <div className="h-3 w-20 rounded bg-amber-800/15" />
          </div>
        </div>
        <div className="h-5 w-5 rounded bg-amber-300/50" />
      </div>

      {/* 4. Khai Thi Discourse / Q&A Content Format */}
      <div className="space-y-6 pt-2">
        {/* Question / Context Box */}
        <div className="rounded-2xl border border-amber-200/70 bg-[#FAF7F0]/90 p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-amber-600/40" />
            <div className="h-4 w-20 rounded bg-amber-800/30 font-semibold" />
          </div>
          <div className="space-y-2 pl-6">
            <div className="h-4 w-full rounded bg-neutral-300/50" />
            <div className="h-4 w-11/12 rounded bg-neutral-300/40" />
            <div className="h-4 w-4/5 rounded bg-neutral-300/30" />
          </div>
        </div>

        {/* Master's Answer / Discourse Paragraphs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-amber-700/50" />
            <div className="h-4 w-24 rounded bg-amber-900/35 font-semibold" />
          </div>

          <div className="space-y-2.5 pl-6">
            <div className="h-4 w-full rounded bg-neutral-200/70" />
            <div className="h-4 w-full rounded bg-neutral-200/70" />
            <div className="h-4 w-11/12 rounded bg-neutral-200/60" />
            <div className="h-4 w-5/6 rounded bg-neutral-200/50" />
          </div>

          <div className="space-y-2.5 pl-6 pt-2">
            <div className="h-4 w-full rounded bg-neutral-200/70" />
            <div className="h-4 w-full rounded bg-neutral-200/70" />
            <div className="h-4 w-3/4 rounded bg-neutral-200/60" />
          </div>

          <div className="space-y-2.5 pl-6 pt-2">
            <div className="h-4 w-full rounded bg-neutral-200/70" />
            <div className="h-4 w-4/5 rounded bg-neutral-200/60" />
          </div>
        </div>
      </div>
    </article>
  );
};

export const KhaiThiDetailSkeleton = KhaiThiPostDetailSkeleton;

