"use client";

import {
  BookOpen,
  FileText,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface PdfViewerProps {
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  slug?: string | null;
  className?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  fileUrl,
  fileName,
  fileSize,
  slug,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper to check if currently in native browser fullscreen
  const isNativeFullscreenActive = (): boolean => {
    if (typeof document === "undefined") return false;
    return Boolean(
      document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
    );
  };

  // Cross-browser & cross-device Fullscreen Toggle
  const handleToggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      // 1. Activate CSS fullscreen immediately (ensures mobile iOS Safari fallback works instantly)
      setIsFullscreen(true);

      // 2. Request native HTML5 Fullscreen (supported on Desktop & Android Chrome / tablet)
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          await (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        }
      } catch (err) {
        // Native requestFullscreen may be rejected or unsupported on iOS iPhone Safari.
        // CSS fullscreen fallback (fixed inset-0 z-[99999] h-[100dvh]) is already active.
        console.info(
          "Native fullscreen not available or blocked, using CSS fullscreen fallback:",
          err
        );
      }
    } else {
      // Exit fullscreen mode
      setIsFullscreen(false);
      try {
        if (isNativeFullscreenActive()) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            await (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          }
        }
      } catch (err) {
        console.warn("Error exiting native fullscreen:", err);
      }
    }
  }, [isFullscreen]);

  // Sync state when native fullscreen is exited via ESC key or mobile gesture
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = isNativeFullscreenActive();
      if (!isNative && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [isFullscreen]);

  // ESC key listener for CSS-only fullscreen (e.g. on iOS Safari)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        handleToggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, handleToggleFullscreen]);

  // Lock body scroll when fullscreen is active to prevent page bounce behind PDF viewer
  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isFullscreen]);

  // Format file size
  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes || bytes <= 0) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const displayName = fileName || "Tài liệu Phật Pháp";
  const sizeText = formatFileSize(fileSize);

  // Construct secure embed URL: disable browser download/print toolbar & navpanes
  const secureEmbedUrl = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative flex flex-col rounded-3xl border border-[#EDE5D8]/90 bg-white/95 shadow-xs overflow-hidden transition-all select-none ${
        isFullscreen
          ? "fixed inset-0 z-[99999] h-[100dvh] w-screen max-w-[100vw] rounded-none border-none bg-neutral-900"
          : "w-full"
      } ${className}`}
    >
      {/* Top Header Toolbar */}
      <div
        className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b transition-colors shrink-0 ${
          isFullscreen
            ? "border-neutral-800 bg-neutral-900 text-white pt-[max(0.75rem,env(safe-area-inset-top))]"
            : "border-amber-100/80 bg-linear-to-r from-amber-50/70 via-white to-amber-50/40 text-neutral-800"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs ${
              isFullscreen
                ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                : "bg-rose-100 text-rose-700 border border-rose-200"
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className="text-xs sm:text-sm font-bold truncate"
              title={displayName}
            >
              {displayName}
            </h4>
            <div className="flex items-center gap-2 text-[11px] opacity-75">
              <span className="flex items-center gap-1 font-medium">
                <BookOpen className="h-3 w-3" />
                Đọc trực tuyến
              </span>
              {sizeText && (
                <>
                  <span>•</span>
                  <span>{sizeText}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: 3D Flipbook reader link & Fullscreen toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {slug && (
            <Link
              href={`/kinh-sach/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden xs:inline sm:inline">Mở sách</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Thu nhỏ giao diện (ESC)" : "Đọc toàn màn hình"}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer min-h-[36px] ${
              isFullscreen
                ? "border-neutral-700 bg-neutral-800 text-amber-300 hover:bg-neutral-700 hover:text-amber-200"
                : "border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Toàn màn hình</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div
        className={`relative w-full flex-1 ${
          isFullscreen
            ? "h-[calc(100dvh-56px)] pb-[env(safe-area-inset-bottom)] bg-neutral-900"
            : "h-[620px] sm:h-[780px] bg-neutral-100"
        }`}
      >
        <iframe
          src={secureEmbedUrl}
          title={displayName}
          className="w-full h-full border-none block"
          allow="fullscreen"
          allowFullScreen
        />

        {/* Floating subtle security badge */}
        <div className="pointer-events-none absolute bottom-3 right-4 hidden sm:flex items-center gap-1.5 rounded-full bg-neutral-900/60 backdrop-blur-md px-3 py-1 text-[10px] text-white/80 shadow-md">
          <ShieldAlert className="h-3 w-3 text-amber-400" />
          <span>Tài liệu nội bộ • Chỉ đọc trực tuyến</span>
        </div>
      </div>
    </div>
  );
};
