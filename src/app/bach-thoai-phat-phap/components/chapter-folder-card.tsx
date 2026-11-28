"use client";

import { Folder, FolderOpen, Headphones, Sparkles } from "lucide-react";
import React from "react";

import type { ChapterSummaryItemType } from "@/api/post/post.type";

export interface ChapterFolderCardProps {
  chapterItem: ChapterSummaryItemType;
  isSelected: boolean;
  onSelect: (chapterNumber: number | null) => void;
}

export const ChapterFolderCard: React.FC<ChapterFolderCardProps> = ({
  chapterItem,
  isSelected,
  onSelect,
}) => {
  const isAll = chapterItem.chapter === 0;
  const displayName = isAll
    ? "Tất cả các quyển"
    : chapterItem.chapterTitle || `Quyển ${chapterItem.chapter}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(isAll ? null : chapterItem.chapter)}
      aria-pressed={isSelected}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-3.5 text-left transition-all duration-200 cursor-pointer sm:p-4 ${
        isSelected
          ? "border-2 border-amber-700 bg-gradient-to-br from-amber-800 via-amber-850 to-amber-900 text-white shadow-md shadow-amber-950/20 ring-2 ring-amber-400/40 -translate-y-0.5"
          : "border border-amber-900/10 bg-white/90 text-neutral-800 shadow-2xs hover:-translate-y-0.5 hover:border-amber-400/70 hover:bg-amber-50/50 hover:shadow-sm"
      }`}
    >
      {/* Folder Tab Shape Decorator */}
      <div
        className={`absolute -top-3 left-6 h-3 w-16 rounded-t-lg transition-colors ${
          isSelected
            ? "bg-amber-700/80"
            : "border-t border-x border-amber-900/10 bg-amber-100/60 group-hover:bg-amber-200/60"
        }`}
      />

      {/* Header Row: Icon & Badge */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isSelected
              ? "bg-white/20 text-white"
              : "bg-amber-100/80 text-amber-800 group-hover:bg-amber-200/70"
          }`}
        >
          {isAll ? (
            <Sparkles className="h-5 w-5" />
          ) : isSelected ? (
            <FolderOpen className="h-5 w-5" />
          ) : (
            <Folder className="h-5 w-5" />
          )}
        </div>

        <span
          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold tracking-tight ${
            isSelected
              ? "bg-white/25 text-white"
              : isAll
                ? "bg-amber-100 text-amber-900 border border-amber-200/80"
                : "bg-amber-50 text-amber-800 border border-amber-200/80"
          }`}
        >
          {isAll ? "TỔNG QUAN" : `QUYỂN ${chapterItem.chapter}`}
        </span>
      </div>

      {/* Title & Count */}
      <div className="mt-3 space-y-1">
        <h4
          title={displayName}
          className={`text-sm font-bold line-clamp-1 leading-snug sm:text-base ${
            isSelected ? "text-white" : "text-neutral-900 group-hover:text-amber-900"
          }`}
        >
          {displayName}
        </h4>

        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            isSelected ? "text-amber-200" : "text-neutral-500"
          }`}
        >
          <Headphones className="h-3 w-3 shrink-0 opacity-70" />
          <span>{chapterItem.count} bài giảng audio</span>
        </div>
      </div>

      {/* Active Indicator Bar */}
      {isSelected && (
        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-amber-200">
          <span className="flex h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
          <span>Đang xem</span>
        </div>
      )}
    </button>
  );
};
