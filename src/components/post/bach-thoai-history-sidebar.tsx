"use client";

import { ChevronRight, Clock, ExternalLink, Headphones, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

import { formatTime } from "@/lib/utils";
import { useListeningHistoryList } from "@/stores";

interface BachThoaiHistorySidebarProps {
  currentPostId?: string;
  className?: string;
}

export const BachThoaiHistorySidebar: React.FC<BachThoaiHistorySidebarProps> = ({
  currentPostId,
  className = "",
}) => {
  const history = useListeningHistoryList();

  // Filter out the current post if desired, or show top 5 items
  const recentItems = history.slice(0, 5);

  return (
    <aside
      className={`rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-4 sm:p-5 shadow-xs space-y-4 ${className}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-[#EDE5D8]/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shadow-2xs">
            <Clock className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Lịch sử đã nghe</h3>
        </div>
        {history.length > 0 && (
          <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
            {history.length} bài
          </span>
        )}
      </div>

      {/* List of Recent Items */}
      {recentItems.length > 0 ? (
        <div className="space-y-3">
          {recentItems.map((item) => {
            const isCurrent = item.id === currentPostId;
            const progressPercent =
              item.duration && item.duration > 0
                ? Math.min(Math.round((item.time / item.duration) * 100), 100)
                : 0;

            const targetUrl = `/bach-thoai-phat-phap/${item.slug || item.id}?time=${item.time}`;

            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl border p-2.5 transition-all duration-200 ${
                  isCurrent
                    ? "border-amber-400 bg-amber-50/70 shadow-2xs"
                    : "border-neutral-100 bg-[#FAF7F0]/40 hover:border-amber-200 hover:bg-white hover:shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-amber-100 shadow-2xs">
                    <img
                      src={item.thumbnailUrl || "/images/lotus-thumb.jpg"}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/images/lotus-thumb.jpg";
                      }}
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4
                      className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                        isCurrent
                          ? "text-amber-900"
                          : "text-neutral-800 group-hover:text-amber-900"
                      }`}
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    {/* Progress Bar & Time */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500">
                        <span>Đã nghe {formatTime(item.time)}</span>
                        {item.duration ? (
                          <span>{formatTime(item.duration)}</span>
                        ) : null}
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className="h-full rounded-full bg-amber-600 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redirect Button to Details Page */}
                <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">
                    {progressPercent >= 95 ? "Đã nghe xong" : `Tiến độ ${progressPercent}%`}
                  </span>

                  <Link
                    href={targetUrl}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-amber-600 text-white shadow-2xs hover:bg-amber-700"
                        : "bg-amber-100/70 text-amber-900 hover:bg-amber-200/80"
                    }`}
                  >
                    <span>{isCurrent ? "Đang mở" : "Tiếp tục nghe"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty History State */
        <div className="rounded-2xl border border-dashed border-[#EDE5D8] bg-[#FAF7F0]/40 p-5 text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <Headphones className="h-5 w-5 text-amber-700" />
          </div>
          <p className="text-xs font-semibold text-neutral-700">Chưa có lịch sử nghe</p>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Các bài giảng Bạch thoại bạn nghe sẽ được lưu tại đây để tiện tiếp tục nghe lại.
          </p>
        </div>
      )}

      {/* Footer "Xem thêm" Button */}
      <div className="pt-2">
        <Link
          href="/lich-su-nghe"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-2.5 text-xs font-semibold text-amber-900 shadow-2xs transition hover:bg-amber-100 hover:border-amber-300"
        >
          <span>Xem tất cả lịch sử ({history.length})</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
};
