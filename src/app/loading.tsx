"use client";

import { FC, useEffect, useState } from "react";

import { LotusLogo } from "@/components/shared/lotus-logo";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  message?: string;
  duration?: number;
}

const Loading: FC<LoadingProps> = ({ className, message, duration }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (typeof duration === "number" && duration > 0) {
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#FAF7F0] text-neutral-800 transition-opacity duration-300",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      {/* Warm Golden Ambient Glow in center */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.09),transparent_65%)]" />
      </div>

      {/* Top Golden Accent Line */}
      <div className="fixed top-0 right-0 left-0 h-0.5 overflow-hidden z-20">
        <div className="h-full w-full animate-[progress_1.6s_ease-in-out_infinite] bg-gradient-to-r from-amber-400 via-amber-600 to-amber-700 shadow-[0_1px_6px_rgba(217,119,6,0.3)]" />
      </div>

      {/* Central Card / Visual */}
      <div className="relative z-10 flex flex-col items-center space-y-5 px-6">
        {/* Lotus Logo with warm glowing aura */}
        <div className="relative flex items-center justify-center">
          {/* Subtle breathing background halo */}
          <div className="absolute h-24 w-24 rounded-full bg-amber-400/20 blur-xl animate-pulse" />

          {/* Decorative spinning aura ring */}
          <div className="absolute h-20 w-20 rounded-full border border-dashed border-amber-300/60 animate-[spin_10s_linear_infinite]" />

          {/* Lotus Logo */}
          <LotusLogo size={56} className="relative z-10 drop-shadow-sm transition-transform hover:scale-105" />
        </div>

        {/* Brand & Loading Message */}
        <div className="text-center space-y-1">
          <h2
            className="font-serif text-lg sm:text-xl font-bold tracking-wide text-amber-950"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Pháp Môn Tâm Linh
          </h2>
          <p className="text-xs font-medium text-amber-800/80">
            {message || "Đang tải dữ liệu..."}
          </p>
        </div>

        {/* Smooth Amber Progress Bar */}
        <div className="h-1 w-36 overflow-hidden rounded-full bg-amber-200/60 shadow-inner">
          <div className="h-full w-full animate-[progress_1.6s_ease-in-out_infinite] bg-gradient-to-r from-amber-400 via-amber-600 to-amber-500 rounded-full" />
        </div>

        {/* Zen Bouncing Dots */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-[bounce_1s_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-[bounce_1s_infinite_0.2s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-[bounce_1s_infinite_0.4s]" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
