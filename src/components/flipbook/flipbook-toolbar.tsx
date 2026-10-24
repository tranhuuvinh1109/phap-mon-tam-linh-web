"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export interface FlipbookToolbarProps {
  currentPage: number; // 0-based or 1-based index
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (page: number) => void;
  canPrev: boolean;
  canNext: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isTwoPage: boolean;
  className?: string;
}

export const FlipbookToolbar: React.FC<FlipbookToolbarProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  canPrev,
  canNext,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isFullscreen,
  onToggleFullscreen,
  isTwoPage,
  className = "",
}) => {
  const [pageInput, setPageInput] = useState<string>(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      onJumpToPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-amber-900/10 bg-white/90 px-3 py-2 shadow-xs backdrop-blur-md transition ${className}`}
    >
      {/* 1. Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={!canPrev}
          title="Trang trước (Phím ←)"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Direct page input form */}
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1.5 text-xs text-neutral-600">
          <span className="hidden sm:inline font-medium text-neutral-500">Trang</span>
          <input
            type="text"
            inputMode="numeric"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handleInputSubmit}
            aria-label="Số trang hiện tại"
            className="h-7 w-11 rounded-lg border border-neutral-200 bg-neutral-50 px-1 text-center font-semibold text-neutral-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-500"
          />
          <span className="font-medium text-neutral-400">/</span>
          <span className="font-semibold text-neutral-700">{totalPages || 1}</span>
        </form>

        <button
          type="button"
          onClick={onNextPage}
          disabled={!canNext}
          title="Trang sau (Phím →)"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {isTwoPage && (
          <span className="hidden md:inline-block ml-1 text-[11px] font-medium text-amber-800/80 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
            Trang đôi
          </span>
        )}
      </div>

      {/* 2. Zoom & Fullscreen Controls */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50/60 p-0.5">
          <button
            type="button"
            onClick={onZoomOut}
            disabled={zoom <= 0.5}
            title="Thu nhỏ"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            title="Đặt lại cỡ chuẩn 80%"
            className="px-1.5 text-[11px] font-bold text-neutral-600 hover:text-amber-900 transition cursor-pointer"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            disabled={zoom >= 1.8}
            title="Phóng to"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 hover:bg-white hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {Math.abs(zoom - 0.8) > 0.01 && (
          <button
            type="button"
            onClick={onResetZoom}
            title="Khôi phục mặc định (80%)"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition cursor-pointer shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Thoát toàn màn hình (ESC)" : "Đọc toàn màn hình"}
          className={`flex h-8 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold shadow-2xs transition cursor-pointer ${
            isFullscreen
              ? "border-amber-400 bg-amber-50 text-amber-900"
              : "border-neutral-200 bg-white text-neutral-700 hover:bg-amber-50 hover:text-amber-900"
          }`}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Thu nhỏ</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Toàn màn hình</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
