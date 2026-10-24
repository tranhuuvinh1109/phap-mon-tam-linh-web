"use client";

import { Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";

export interface FlipbookPageProps {
  pageNumber: number;
  pdfDoc: PDFDocumentProxy | null;
  renderPage: (opts: {
    pageNumber: number;
    canvas: HTMLCanvasElement;
    scale?: number;
  }) => Promise<boolean>;
  cancelCanvas?: (canvas: HTMLCanvasElement) => void;
  isVisible: boolean;
  isCover?: boolean;
  isBackCover?: boolean;
  totalPages?: number;
  className?: string;
}

export const FlipbookPage = forwardRef<HTMLDivElement, FlipbookPageProps>(
  (
    {
      pageNumber,
      pdfDoc,
      renderPage,
      cancelCanvas,
      isVisible,
      isCover = false,
      isBackCover = false,
      totalPages,
      className = "",
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isRendered, setIsRendered] = useState(false);
    const isRenderingRef = useRef(false);

    useEffect(() => {
      // Lazy render: only render when page is visible or near visible window
      if (!isVisible) {
        // Release canvas memory if page has moved far away
        if (isRendered && canvasRef.current) {
          cancelCanvas?.(canvasRef.current);
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
          canvasRef.current.width = 1;
          canvasRef.current.height = 1;
          setIsRendered(false);
        }
        isRenderingRef.current = false;
        return;
      }

      if (isRendered || isRenderingRef.current || !canvasRef.current || !pdfDoc) return;

      let isMounted = true;
      isRenderingRef.current = true;

      renderPage({
        pageNumber,
        canvas: canvasRef.current,
        scale: 1.6,
      }).then((success) => {
        isRenderingRef.current = false;
        if (!isMounted) return;
        if (success) {
          setIsRendered(true);
        }
      });

      return () => {
        isMounted = false;
        isRenderingRef.current = false;
        if (canvasRef.current) {
          cancelCanvas?.(canvasRef.current);
        }
      };
    }, [isVisible, isRendered, pageNumber, pdfDoc, renderPage, cancelCanvas]);

    // Page density attribute for page-flip library ("hard" for cover, "soft" for inner pages)
    const density = isCover || isBackCover ? "hard" : "soft";

    return (
      <div
        ref={ref}
        data-density={density}
        className={`page relative w-full h-full bg-[#FCFBF8] overflow-hidden select-none shadow-xs border border-amber-950/5 ${
          isCover
            ? "border-amber-900/30 bg-gradient-to-br from-amber-900 via-amber-950 to-neutral-900 text-amber-100"
            : ""
        } ${className}`}
      >
        {/* Book gutter shadow gradient (gives depth to the center spine) */}
        {!isCover && !isBackCover && (
          <div
            className={`pointer-events-none absolute inset-y-0 w-8 z-10 opacity-30 ${
              pageNumber % 2 === 0
                ? "right-0 bg-gradient-to-l from-black/20 to-transparent" // Left page spine shadow
                : "left-0 bg-gradient-to-r from-black/20 to-transparent" // Right page spine shadow
            }`}
          />
        )}

        {/* Loading Spinner / Skeleton */}
        {isVisible && !isRendered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#FBF9F4] text-neutral-400 z-5">
            <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
            <span className="text-[11px] font-medium text-amber-800/70">
              Đang tải trang {pageNumber}...
            </span>
          </div>
        )}

        {/* Canvas Display */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isRendered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Bottom Page Number Badge */}
        {!isCover && !isBackCover && (
          <div
            className={`absolute bottom-2 text-[10px] font-serif text-neutral-400 select-none z-10 ${
              pageNumber % 2 === 0 ? "left-4" : "right-4"
            }`}
          >
            {pageNumber}
          </div>
        )}
      </div>
    );
  }
);

FlipbookPage.displayName = "FlipbookPage";
