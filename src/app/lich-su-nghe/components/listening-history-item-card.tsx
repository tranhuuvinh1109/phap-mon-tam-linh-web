"use client";

import {
  CheckCircle2,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { formatTime } from "@/lib/utils";
import type { ListeningHistoryItem } from "@/stores";

interface ListeningHistoryItemCardProps {
  item: ListeningHistoryItem;
  onRemove: (item: ListeningHistoryItem, e: React.MouseEvent) => void;
}

const formatDateText = (isoString?: string): string => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export const ListeningHistoryItemCard: React.FC<ListeningHistoryItemCardProps> = ({
  item,
  onRemove,
}) => {
  const progressPercent =
    item.duration && item.duration > 0
      ? Math.min(Math.round((item.time / item.duration) * 100), 100)
      : 0;

  const isCompleted = progressPercent >= 95;
  const targetUrl = `/bach-thoai-phat-phap/${item.slug || item.id}?time=${item.time}`;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-4 shadow-xs transition-all duration-200 hover:border-amber-300 hover:shadow-md sm:p-5">
      {/* Top: Thumbnail & Title & Delete */}
      <div className="flex items-start gap-3.5">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-amber-100 shadow-2xs sm:h-20 sm:w-20">
          <img
            src={item.thumbnailUrl || "/images/lotus-thumb.jpg"}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/lotus-thumb.jpg";
            }}
          />
        </div>

        {/* Metadata & Title */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              <Sparkles className="h-2.5 w-2.5 text-amber-600" />
              <span>{item.categoryName || "Bạch thoại"}</span>
            </span>

            <span className="text-[11px] text-neutral-400">
              {formatDateText(item.updateAt)}
            </span>
          </div>

          <h3 className="line-clamp-2 text-xs leading-snug font-bold text-neutral-900 transition-colors group-hover:text-amber-900 sm:text-sm">
            <Link href={targetUrl} title={item.title}>
              {item.title}
            </Link>
          </h3>

          <p className="truncate text-[11px] text-neutral-500">
            {item.authorName || "Bạch thoại Phật pháp"}
          </p>
        </div>

        {/* Single Delete Button */}
        <button
          type="button"
          onClick={(e) => onRemove(item, e)}
          title="Xoá khỏi lịch sử"
          className="shrink-0 cursor-pointer rounded-xl p-1.5 text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Middle: Progress Bar */}
      <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3">
        <div className="flex items-center justify-between text-xs font-medium text-neutral-600">
          <span className="flex items-center gap-1.5">
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-700">
                  Đã nghe xong
                </span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[11px] text-neutral-500">
                  Đã nghe ({progressPercent}%)
                </span>
              </>
            )}
          </span>
          <span className="text-[11px] text-neutral-500">
            {formatTime(item.time)}{" "}
            {item.duration ? `/ ${formatTime(item.duration)}` : ""}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-amber-600 to-amber-700"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom: Direct Redirect Button to Details Page */}
      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-[11px] text-neutral-400">
          Nghe lần đầu: {formatDateText(item.createAt)}
        </span>

        <Link
          href={targetUrl}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:from-amber-800 hover:to-amber-900"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Tiếp tục nghe</span>
          <ExternalLink className="h-3 w-3 opacity-80" />
        </Link>
      </div>
    </div>
  );
};
