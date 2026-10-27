"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  isFetching?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  hasPrevPage,
  hasNextPage,
  isFetching = false,
  onPrevPage,
  onNextPage,
  onGoToPage,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 border-t border-[#EDE5D8] pt-6 sm:flex-row ${className}`}
    >
      <div className="order-2 text-xs text-neutral-500 sm:order-1">
        {totalItems ? (
          <span>
            Đang hiển thị trang <strong>{currentPage}</strong> trên tổng số{" "}
            <strong>{totalPages}</strong> trang ({totalItems} bài viết)
          </span>
        ) : (
          <span>
            Trang <strong>{currentPage}</strong>
          </span>
        )}
      </div>

      <div className="order-1 flex items-center gap-2 sm:order-2">
        {/* Prev Button */}
        <button
          type="button"
          onClick={onPrevPage}
          disabled={!hasPrevPage || isFetching}
          className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition ${
            hasPrevPage && !isFetching
              ? "cursor-pointer border-neutral-300 bg-white text-neutral-800 hover:border-amber-300 hover:bg-neutral-50"
              : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 opacity-60"
          }`}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Trang trước</span>
        </button>

        {/* Page Numbers */}
        {totalPages > 1 && (
          <div className="hidden items-center gap-1 sm:flex">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
              const pageNum = index + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onGoToPage(pageNum)}
                  disabled={isFetching}
                  className={`h-8 w-8 cursor-pointer rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-amber-800 text-white shadow-xs"
                      : "border border-neutral-200/80 bg-white text-neutral-700 hover:bg-amber-50 hover:text-amber-900"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-1 text-xs text-neutral-400">...</span>}
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasNextPage || isFetching}
          className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition ${
            hasNextPage && !isFetching
              ? "cursor-pointer border-amber-700 bg-amber-800 text-white hover:bg-amber-900"
              : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 opacity-60"
          }`}
          aria-label="Trang sau"
        >
          <span>Trang sau</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
