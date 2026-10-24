"use client";

import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePdfDocument } from "@/hooks/use-pdf-document";
import { usePdfPageRenderer } from "@/hooks/use-pdf-page-renderer";
import { FlipbookPage } from "./flipbook-page";
import { FlipbookToolbar } from "./flipbook-toolbar";

export interface PdfFlipbookReaderProps {
  fileUrl: string;
  bookTitle?: string;
  authorName?: string;
  className?: string;
}

export const PdfFlipbookReader: React.FC<PdfFlipbookReaderProps> = ({
  fileUrl,
  bookTitle,
  authorName,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookContainerRef = useRef<HTMLDivElement | null>(null);
  const pageFlipInstanceRef = useRef<any>(null);

  // PDF.js document loader
  const { pdfDoc, numPages, isLoading, error, pageSize } = usePdfDocument(fileUrl);
  const { renderPage, cancelCanvas } = usePdfPageRenderer(pdfDoc);

  // Flipbook state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(0.8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBookReady, setIsBookReady] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect responsive screen width
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Compute page dimensions based on PDF aspect ratio & available container
  const bookDimensions = useMemo(() => {
    const ratio = pageSize?.aspectRatio || 595 / 842; // standard A4 ratio ~0.706

    if (isMobile) {
      // Mobile: single page layout
      const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 32, 440) : 360;
      const h = Math.round(maxW / ratio);
      return {
        pageWidth: Math.round(maxW),
        pageHeight: Math.min(h, 640),
        isTwoPage: false,
      };
    } else {
      // Desktop: two-page spread layout
      // Target each page width ~ 380 - 450px
      const availableW = 920;
      const singlePageW = Math.round(availableW / 2);
      const singlePageH = Math.round(singlePageW / ratio);
      return {
        pageWidth: singlePageW,
        pageHeight: Math.min(singlePageH, 650),
        isTwoPage: true,
      };
    }
  }, [pageSize, isMobile]);

  // Initialize StPageFlip instance
  useEffect(() => {
    if (!pdfDoc || numPages <= 0 || !bookContainerRef.current) return;

    let isMounted = true;
    let pageFlip: any = null;

    const initFlip = async () => {
      try {
        const { PageFlip } = await import("page-flip");

        if (!isMounted || !bookContainerRef.current) return;

        // Clean up previous instance
        if (pageFlipInstanceRef.current) {
          try {
            pageFlipInstanceRef.current.destroy();
          } catch {
            // ignore
          }
          pageFlipInstanceRef.current = null;
        }

        const { pageWidth, pageHeight, isTwoPage } = bookDimensions;

        pageFlip = new PageFlip(bookContainerRef.current, {
          width: pageWidth,
          height: pageHeight,
          size: "fixed",
          minWidth: 260,
          maxWidth: 600,
          minHeight: 380,
          maxHeight: 800,
          maxShadowOpacity: 0.5,
          showCover: isTwoPage,
          mobileScrollSupport: false,
          usePortrait: !isTwoPage,
          startPage: 0,
          drawShadow: true,
          flippingTime: 700,
          useMouseEvents: false,
          showPageCorners: false,
          disableFlipByClick: true,
          swipeDistance: 30,
          clickEventForward: false,
        });

        // Load existing DOM page elements
        const pageElements = bookContainerRef.current.querySelectorAll(".page");
        if (pageElements.length > 0) {
          pageFlip.loadFromHTML(pageElements);
        }

        pageFlip.on("flip", (e: { data: number }) => {
          if (!isMounted) return;
          // StPageFlip uses 0-based page index, we display 1-based page
          setCurrentPage(e.data + 1);
        });

        pageFlipInstanceRef.current = pageFlip;
        setIsBookReady(true);
      } catch (e) {
        console.error("Failed to initialize PageFlip:", e);
      }
    };

    initFlip();

    return () => {
      isMounted = false;
      if (pageFlipInstanceRef.current) {
        try {
          pageFlipInstanceRef.current.destroy();
        } catch {
          // ignore
        }
        pageFlipInstanceRef.current = null;
      }
    };
  }, [pdfDoc, numPages, bookDimensions]);

  // Navigation handlers
  const handlePrevPage = useCallback(() => {
    if (pageFlipInstanceRef.current) {
      pageFlipInstanceRef.current.flipPrev();
    }
  }, []);

  const handleNextPage = useCallback(() => {
    if (pageFlipInstanceRef.current) {
      pageFlipInstanceRef.current.flipNext();
    }
  }, []);

  const handleJumpToPage = useCallback(
    (targetPage: number) => {
      if (pageFlipInstanceRef.current && targetPage >= 1 && targetPage <= numPages) {
        pageFlipInstanceRef.current.flip(targetPage - 1);
      }
    },
    [numPages]
  );

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevPage, handleNextPage]);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.5));
  const handleResetZoom = () => setZoom(0.8);

  // Fullscreen handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {
        setIsFullscreen(true);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => { });
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Generate page array for rendering
  const pagesArray = useMemo(() => {
    return Array.from({ length: numPages }, (_, i) => i + 1);
  }, [numPages]);

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative flex flex-col rounded-3xl border border-[#EDE5D8]/90 bg-[#F5EFEB]/90 p-3 sm:p-6 shadow-sm backdrop-blur-xs transition-all select-none ${isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none p-4 sm:p-6 bg-neutral-950 w-screen h-screen overflow-auto"
          : "w-full"
        } ${className}`}
    >
      {/* 1. Header Information */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-900/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-2xs border border-amber-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3
              className={`text-sm sm:text-base font-bold truncate ${isFullscreen ? "text-amber-100" : "text-amber-950"
                }`}
            >
              {bookTitle || "Kinh Sách Phật Giáo"}
            </h3>
            <p className="text-xs text-neutral-500 truncate">
              {authorName ? `Tác giả: ${authorName}` : "Kinh điển Đại Thừa"} • {numPages} trang
            </p>
          </div>
        </div>
      </div>

      {/* 2. Loading & Error States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[460px] sm:min-h-[580px] gap-3 text-neutral-600">
          <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
          <p className="text-sm font-semibold text-amber-950">Đang chuẩn bị trang kinh sách...</p>
          <p className="text-xs text-neutral-400">Vui lòng đợi trong giây lát</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[420px] gap-3 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-neutral-800">Không thể mở tài liệu</h4>
          <p className="text-xs text-neutral-500 max-w-md">{error}</p>
        </div>
      )}

      {/* 3. Flipbook Stage Canvas Area */}
      {!isLoading && !error && numPages > 0 && (
        <div className="relative flex-1 flex flex-col items-center justify-center py-4 overflow-hidden">
          {/* Previous Page Side Button */}
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            title="Trang trước"
            className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 text-amber-950 shadow-md border border-amber-900/15 hover:bg-amber-50 hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition cursor-pointer backdrop-blur-xs"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-amber-900" />
          </button>

          {/* Next Page Side Button */}
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            title="Trang sau"
            className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 text-amber-950 shadow-md border border-amber-900/15 hover:bg-amber-50 hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none transition cursor-pointer backdrop-blur-xs"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-amber-900" />
          </button>

          {/* Zoom scale wrapper */}
          <div
            className="transition-transform duration-200 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* The container required by StPageFlip */}
            <div
              ref={bookContainerRef}
              className="flipbook-wrapper shadow-2xl rounded-lg overflow-hidden"
              style={{
                width: bookDimensions.isTwoPage
                  ? bookDimensions.pageWidth * 2
                  : bookDimensions.pageWidth,
                height: bookDimensions.pageHeight,
              }}
            >
              {pagesArray.map((pageNum, idx) => {
                // Windowed lazy rendering: render active page +/- 3 pages
                const isVisible = Math.abs(pageNum - currentPage) <= 3;
                const isCover = idx === 0;
                const isBackCover = idx === numPages - 1;

                return (
                  <FlipbookPage
                    key={pageNum}
                    pageNumber={pageNum}
                    pdfDoc={pdfDoc}
                    renderPage={renderPage}
                    cancelCanvas={cancelCanvas}
                    isVisible={isVisible}
                    isCover={isCover}
                    isBackCover={isBackCover}
                    totalPages={numPages}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Controls Toolbar */}
      {!isLoading && !error && numPages > 0 && (
        <div className="pt-3">
          <FlipbookToolbar
            currentPage={currentPage}
            totalPages={numPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onJumpToPage={handleJumpToPage}
            canPrev={currentPage > 1}
            canNext={currentPage < numPages}
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            isTwoPage={bookDimensions.isTwoPage}
          />
        </div>
      )}
    </div>
  );
};
