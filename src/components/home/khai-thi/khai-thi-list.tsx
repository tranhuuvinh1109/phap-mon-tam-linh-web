"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

import type { PostItemType } from "@/api/post/post.type";
import { KhaiThiSkeleton } from "@/components/skeletons";
import { KhaiThiItem } from "./khai-thi-item";

export interface KhaiThiListProps {
  className?: string;
  limit?: number;
  posts?: PostItemType[];
  isLoading?: boolean;
}

export const KhaiThiList: React.FC<KhaiThiListProps> = ({
  className = "",
  limit = 3,
  posts = [],
  isLoading = false,
}) => {
  const displayPosts = useMemo<PostItemType[]>(() => {
    return posts.slice(0, limit);
  }, [posts, limit]);

  // If loading finished and no Khai Thi posts exist from API, hide the section
  if (!isLoading && displayPosts.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-3.5 sm:space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-100/90 text-amber-800 shadow-2xs border border-amber-200/60">
            <Sparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Khai thị
              </h3>
              <span className="rounded-full hidden md:block bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-800">
                Lời vàng Phật pháp
              </span>
            </div>
            <p className="hidden text-xs text-neutral-500 sm:block">
              Lời khai thị sâu sắc, soi sáng trí tuệ và mở lối an lạc
            </p>
          </div>
        </div>

        {/* View All Action */}
        <Link
          href="/khai-thi"
          className="group flex items-center gap-1 text-xs sm:text-sm font-semibold text-amber-800 transition hover:text-amber-900"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <KhaiThiSkeleton count={limit} />
      ) : (
        /* Render Real Items from Props */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPosts.map((post) => (
            <KhaiThiItem key={post.id || post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  );
};
