"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

import type { PostItemType } from "@/api/post/post.type";
import { BachThoaiSkeleton } from "@/components/skeletons";
import { ContentType } from "@/enums";
import { formatTime, stripHtml } from "@/lib/utils";
import { BachThoaiDisplayItem, BachThoaiItem } from "./bach-thoai-item";

export interface BachThoaiSectionProps {
  className?: string;
  limit?: number;
  posts?: PostItemType[];
  isLoading?: boolean;
}

export const BachThoaiSection: React.FC<BachThoaiSectionProps> = ({
  className = "",
  limit = 4,
  posts = [],
  isLoading = false,
}) => {
  const displayItems = useMemo<BachThoaiDisplayItem[]>(() => {
    return posts.slice(0, limit).map((post) => {
      let durationText = "--:--";
      if (post.audio?.duration && post.audio.duration > 0) {
        durationText = formatTime(post.audio.duration);
      } else if (post.video?.duration && post.video.duration > 0) {
        durationText = formatTime(post.video.duration);
      }

      const snippet = post.content ? stripHtml(post.content).slice(0, 70) : undefined;

      return {
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        authorName: post.author?.name || "Đại sư Lư Quân Hoành",
        durationText,
        thumbnailUrl: post.thumbnailUrl || "/images/lotus-thumb.jpg",
        type: post.type || (post.audio?.audioUrl ? ContentType.AUDIO : ContentType.NORMAL),
        audioUrl: post.audio?.audioUrl,
        snippet,
        groupId: post.groupId || post.group?.id,
        groupName: post.group?.name,
      };
    });
  }, [posts, limit]);

  // If loading finished and no Bach Thoai posts exist, hide the section
  if (!isLoading && displayItems.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-3.5 sm:space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-100/90 text-amber-800 shadow-2xs border border-amber-200/60">
            <BookOpen className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Bạch thoại Phật pháp
              </h3>
              <span className="rounded-full hidden md:block bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-800">
                Pháp âm mới
              </span>
            </div>
            <p className="hidden text-xs text-neutral-500 sm:block">
              Lời dạy giản dị, thấu triệt nhân quả và soi sáng tâm bồ đề
            </p>
          </div>
        </div>

        {/* View All Link */}
        <Link
          href="/bach-thoai-phat-phap"
          className="group flex items-center gap-1 text-xs sm:text-sm font-semibold text-amber-800 transition hover:text-amber-900"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <BachThoaiSkeleton count={limit} />
      ) : (
        /* Responsive 2-Column Grid for Middle Stream Content */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {displayItems.map((item) => (
            <BachThoaiItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
};
