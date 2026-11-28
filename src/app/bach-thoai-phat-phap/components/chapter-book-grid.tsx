"use client";

import React from "react";

import type { ChapterSummaryItemType } from "@/api/post/post.type";

import { ChapterBookCard } from "./chapter-book-card";

export interface ChapterBookGridProps {
  chapters: ChapterSummaryItemType[];
  categoryName?: string;
  totalAllPosts?: number;
  selectedChapter?: number | null;
  onSelectChapter: (chapterNumber: number) => void;
  onPlayChapter?: (chapterNumber: number) => void;
  isLoading?: boolean;
}

export const ChapterBookGrid: React.FC<ChapterBookGridProps> = ({
  chapters,
  categoryName,
  totalAllPosts = 0,
  selectedChapter = null,
  onSelectChapter,
  onPlayChapter,
  isLoading = false,
}) => {
  // Filter out any 0 or invalid chapters, sort strictly ascending
  const validChapters = chapters
    .filter((c) => c.chapter > 0)
    .sort((a, b) => a.chapter - b.chapter);

  if (isLoading && validChapters.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl p-2 sm:p-2.5 animate-pulse"
          >
            <div className="relative aspect-[3/4.1] w-full shrink-0 overflow-hidden rounded-r-lg bg-neutral-200/80 flex shadow-sm">
              <div className="h-full w-[12%] bg-neutral-300/80" />
              <div className="flex-1 bg-neutral-200/60" />
            </div>
            <div className="mt-2.5 space-y-1.5">
              <div className="h-3.5 w-3/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/3 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && validChapters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 3D Bookshelf Grid: 2 cols on mobile, 3 on tablet, 4 on small desktop, 6 on large desktop */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
        {validChapters.map((chap) => (
          <ChapterBookCard
            key={chap.chapter}
            chapterItem={chap}
            categoryName={categoryName}
            isSelected={selectedChapter === chap.chapter}
            onSelect={onSelectChapter}
            onPlay={onPlayChapter}
          />
        ))}
      </div>
    </div>
  );
};
