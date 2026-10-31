"use client";

import { ArrowLeft, Home, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

import { LotusLogo } from "@/components/shared/lotus-logo";

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-[#FAF7F0] text-neutral-800 px-6 py-12"
      role="main"
      aria-label="Trang không tồn tại"
    >
      {/* Warm Golden Ambient Glow in center */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_65%)]" />
      </div>

      {/* Top Golden Accent Line */}
      <div className="fixed top-0 right-0 left-0 h-0.5 overflow-hidden z-20">
        <div className="h-full w-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-700 shadow-[0_1px_6px_rgba(217,119,6,0.3)]" />
      </div>

      {/* Central Card / Visual */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center space-y-6">
        {/* Lotus Logo with warm glowing aura */}
        <div className="relative flex items-center justify-center">
          {/* Subtle breathing background halo */}
          <div className="absolute h-28 w-28 rounded-full bg-amber-400/20 blur-xl animate-pulse" />

          {/* Decorative spinning aura ring */}
          <div className="absolute h-24 w-24 rounded-full border border-dashed border-amber-300/60 animate-[spin_20s_linear_infinite]" />

          {/* Lotus Logo */}
          <Link
            href="/"
            title="Về trang chủ"
            className="relative z-10 cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <LotusLogo
              size={60}
              className="drop-shadow-sm"
            />
          </Link>
        </div>

        {/* 404 Pill Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-100/70 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-2xs backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-700" />
          <span>Mã lỗi 404 • Không tìm thấy</span>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-wide text-amber-950"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Trang không tồn tại
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
            Đường dẫn quý vị đang tìm kiếm có thể đã được thay đổi, di chuyển hoặc không
            còn tồn tại trên hệ thống Pháp Môn Tâm Linh.
          </p>
        </div>

        {/* Action Button: Return to Home */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-6 py-3 text-xs sm:text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 px-5 py-3 text-xs sm:text-sm font-medium shadow-2xs transition hover:border-amber-300 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại trang trước</span>
          </button>
        </div>

        {/* Zen Bouncing Dots */}
        <div className="flex items-center gap-1.5 pt-4">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-[bounce_1s_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-[bounce_1s_infinite_0.2s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-[bounce_1s_infinite_0.4s]" />
        </div>
      </div>
    </div>
  );
}
