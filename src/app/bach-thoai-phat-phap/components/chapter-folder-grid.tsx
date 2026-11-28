"use client";

import { ChevronRight, FolderTree, Layers, Sparkles } from "lucide-react";
import React from "react";

import type { ChapterSummaryItemType } from "@/api/post/post.type";

import { ChapterFolderCard } from "./chapter-folder-card";

export interface ChapterFolderGridProps {
  chapters: ChapterSummaryItemType[];
  totalAllPosts?: number;
  selectedChapter: number | null;
  onSelectChapter: (chapterNumber: number | null) => void;
  isLoading?: boolean;
}

export const ChapterFolderGrid: React.FC<ChapterFolderGridProps> = ({
  chapters,
  totalAllPosts = 0,
  selectedChapter,
  onSelectChapter,
  isLoading = false,
}) => {
  // If there are no chapters and not loading, don't show the folder section
  if (!isLoading && chapters.length === 0) {
    return null;
  }

  // Create virtual "All Chapters" item
  const allItem: ChapterSummaryItemType = {
    chapter: 0,
    chapterTitle: "Tất cả các quyển",
    count: totalAllPosts,
  };

  return (
    <div className="space-y-3.5 rounded-3xl border border-amber-900/10 bg-gradient-to-b from-amber-50/60 via-white/80 to-white/90 p-4 shadow-xs backdrop-blur-xs sm:p-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-800 text-white shadow-2xs">
            <FolderTree className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 sm:text-base">
                Thư mục theo Quyển / Chương
              </h3>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {chapters.length} quyển
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Chọn từng thư mục để nghe trọn bộ các bài giảng theo quyển
            </p>
          </div>
        </div>

        {selectedChapter !== null && (
          <button
            type="button"
            onClick={() => onSelectChapter(null)}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-amber-800 underline hover:text-amber-950"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Xem tất cả các quyển</span>
          </button>
        )}
      </div>

      {/* Grid of Folder Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4">
        {/* All Folders Card */}
        <ChapterFolderCard
          chapterItem={allItem}
          isSelected={selectedChapter === null}
          onSelect={() => onSelectChapter(null)}
        />

        {/* Individual Chapter Folder Cards */}
        {chapters.map((chap) => (
          <ChapterFolderCard
            key={chap.chapter}
            chapterItem={chap}
            isSelected={selectedChapter === chap.chapter}
            onSelect={onSelectChapter}
          />
        ))}
      </div>
    </div>
  );
};
