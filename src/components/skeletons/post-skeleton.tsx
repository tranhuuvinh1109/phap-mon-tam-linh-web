import React from "react";

interface PostSkeletonProps {
  className?: string;
  hasImage?: boolean;
}

export const PostSkeleton: React.FC<PostSkeletonProps> = ({
  className = "",
  hasImage = true,
}) => {
  return (
    <article
      className={`overflow-hidden rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-5 shadow-xs sm:p-8 space-y-6 animate-pulse ${className}`}
    >
      {/* Category Badges & Social Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2">
          {/* Category badge */}
          <div className="h-6 w-28 rounded-full bg-amber-100/80" />
          {/* Type badge */}
          <div className="h-6 w-32 rounded-full bg-emerald-100/70" />
        </div>

        {/* Buttons: Bookmark & Share */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-20 rounded-xl bg-neutral-100 border border-[#EDE5D8]" />
          <div className="h-7 w-20 rounded-xl bg-neutral-100 border border-[#EDE5D8]" />
        </div>
      </div>

      {/* Post Title & Meta */}
      <div className="space-y-3">
        <div className="h-8 w-4/5 rounded-lg bg-neutral-200/80" />
        <div className="h-8 w-1/2 rounded-lg bg-neutral-200/60" />

        {/* Author & Meta */}
        <div className="pt-2 flex items-center gap-4">
          <div className="h-4 w-36 rounded bg-neutral-200/60" />
          <div className="h-4 w-24 rounded bg-neutral-200/50" />
        </div>
      </div>

      {/* Featured Image Skeleton */}
      {hasImage && (
        <div className="h-56 sm:h-72 md:h-80 w-full rounded-2xl bg-neutral-200/70 border border-neutral-100/80" />
      )}

      {/* Post Body Content Skeleton (paragraphs) */}
      <div className="space-y-5 pt-2">
        <div className="space-y-2.5">
          <div className="h-4 w-full rounded bg-neutral-200/70" />
          <div className="h-4 w-full rounded bg-neutral-200/70" />
          <div className="h-4 w-11/12 rounded bg-neutral-200/70" />
          <div className="h-4 w-4/5 rounded bg-neutral-200/60" />
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="h-4 w-full rounded bg-neutral-200/70" />
          <div className="h-4 w-full rounded bg-neutral-200/70" />
          <div className="h-4 w-3/4 rounded bg-neutral-200/60" />
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="h-4 w-full rounded bg-neutral-200/70" />
          <div className="h-4 w-5/6 rounded bg-neutral-200/60" />
        </div>
      </div>
    </article>
  );
};

export const NormalPostSkeleton = PostSkeleton;

