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
import React, { useState } from "react";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      onContextMenu={(e) => e.preventDefault()}
      className={`relative flex flex-col rounded-3xl border border-[#EDE5D8]/90 bg-white/95 shadow-xs overflow-hidden transition-all select-none ${isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen bg-neutral-900"
          : "w-full"
        } ${className}`}
    >
      {/* Top Header Toolbar */}
      <div
        className={`flex items-center justify-between gap-3 px-5 py-3.5 border-b transition-colors ${isFullscreen
            ? "border-neutral-800 bg-neutral-900 text-white"
            : "border-amber-100/80 bg-linear-to-r from-amber-50/70 via-white to-amber-50/40 text-neutral-800"
          }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs ${isFullscreen
                ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                : "bg-rose-100 text-rose-700 border border-rose-200"
              }`}
          >
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold truncate" title={displayName}>
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
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Mở sách</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Thu nhỏ giao diện" : "Đọc toàn màn hình"}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer ${isFullscreen
                ? "border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                : "border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
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

      {/* PDF Viewport */}
      <div
        className={`relative w-full ${isFullscreen
            ? "flex-1 h-[calc(100vh-60px)] bg-neutral-900"
            : "h-[620px] sm:h-[780px] bg-neutral-100"
          }`}
      >
        <iframe
          src={secureEmbedUrl}
          title={displayName}
          className="w-full h-full border-none"
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
