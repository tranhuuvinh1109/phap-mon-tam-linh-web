"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import React from "react";

import type { ChapterSummaryItemType } from "@/api/post/post.type";

export interface ChapterBookCardProps {
  chapterItem: ChapterSummaryItemType;
  categoryName?: string;
  isSelected?: boolean;
  onSelect: (chapterNumber: number) => void;
  onPlay?: (chapterNumber: number) => void;
}

export const CHAPTER_COVER_IMAGE =
  "/images/bach-thoai-phat-phap-bg-quyen-widget.png";

/**
 * Returns the illustration for the book cover based on chapter number
 */
export function getBookCoverImage(_chapter?: number): string {
  return CHAPTER_COVER_IMAGE;
}

export const ChapterBookCard: React.FC<ChapterBookCardProps> = ({
  chapterItem,
  categoryName,
  isSelected = false,
  onSelect,
  onPlay,
}) => {
  const chapter = chapterItem.chapter;
  const coverImage = getBookCoverImage(chapter);
  const displayTitle = chapterItem.chapterTitle || `QUYỂN ${chapter}`;
  const displayCategoryName = categoryName || "Bạch Thoại Phật Pháp";

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(chapter);
    } else {
      onSelect(chapter);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(chapter)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(chapter);
        }
      }}
      className={`group relative flex flex-col justify-start rounded-2xl p-2 sm:p-2.5 transition-all duration-300 cursor-pointer text-left outline-none ${isSelected
        ? "border-2 border-amber-600/90 bg-amber-50/50 shadow-md ring-2 ring-amber-400/40"
        : "border border-transparent hover:border-amber-300/60 hover:bg-amber-50/30 hover:shadow-sm"
        }`}
    >
      {/* 3D Hardcover Book Container */}
      <div className="relative aspect-[3/4.1] w-full shrink-0 overflow-hidden rounded-r-lg shadow-md shadow-amber-950/20 transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-amber-950/30 flex">
        {/* Book Spine (Gáy sách 3D bên trái) */}
        <div className="relative flex h-full w-[12%] shrink-0 flex-col items-center justify-between border-r border-[#150B05] bg-gradient-to-r from-[#201208] via-[#3E2516] to-[#1D0F06] py-3 shadow-inner">
          {/* Subtle spine ridge highlights */}
          <div className="absolute inset-y-0 left-0 w-0.5 bg-white/10" />
          <div className="absolute inset-y-0 right-0 w-0.5 bg-black/50" />

          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#D7AF5B] opacity-85 [writing-mode:vertical-rl] rotate-180">
            QUYỂN {chapter}
          </span>
        </div>

        {/* Front Book Cover (Bìa chính) */}
        <div className="relative flex h-full flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4A3020] via-[#331E12] to-[#1C0E07] p-2 sm:p-2.5">
          {/* Paper / leather lighting overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-white/10" />
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/60 to-transparent" />

          {/* Category Name Header on Cover */}
          <div className="relative z-10 pt-1 px-0.5 text-center">
            <span className="font-serif text-[12px] sm:text-[10px] md:text-[10px] font-extrabold uppercase tracking-wider text-[#F7E7CE] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2 leading-tight block">
              {displayCategoryName}
            </span>
          </div>

          {/* Cover Buddhist Artwork Illustration (Kích thước được thu gọn cân đối) */}
          <div className="absolute inset-x-1.5 bottom-1.5 h-[52%] z-0 flex items-center justify-center overflow-hidden rounded-sm">
            <Image
              src={coverImage}
              alt={displayTitle}
              fill
              sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 240px"
              className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
            />
          </div>

          {/* Floating Circular Play Button */}
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={`Nghe Quyển ${chapter}`}
            title={`Nghe ngay Quyển ${chapter}`}
            className="absolute bottom-2 right-2 z-20 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#A85820] text-white shadow-md shadow-black/50 transition-all duration-200 hover:bg-[#BF6828] hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white ml-0.5" />
          </button>
        </div>
      </div>

      {/* Book Metadata below the 3D book */}
      <div className="mt-2.5 space-y-0.5">
        <h4
          title={displayTitle}
          className="text-xs sm:text-[13px] font-bold uppercase leading-tight text-[#2C180E] line-clamp-2 transition-colors group-hover:text-amber-800"
        >
          {displayTitle}
        </h4>

        <p className="text-[11px] sm:text-xs text-neutral-500 font-medium">
          {chapterItem.count} tập
        </p>
      </div>
    </div>
  );
};
