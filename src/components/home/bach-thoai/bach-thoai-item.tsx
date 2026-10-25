"use client";

import {
  BookOpen,
  Clock,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { ContentType } from "@/enums";
import { getGroupBadgeStyle } from "@/lib/color-badge";
import { useAudioPlayerStore } from "@/stores";

export interface BachThoaiDisplayItem {
  id: string;
  title: string;
  slug: string;
  authorName: string;
  durationText: string;
  thumbnailUrl: string;
  type: ContentType;
  audioUrl?: string;
  snippet?: string;
  groupId?: string;
  groupName?: string;
}

export interface BachThoaiItemProps {
  item: BachThoaiDisplayItem;
}

export const BachThoaiItem: React.FC<BachThoaiItemProps> = ({ item }) => {
  const currentTrack = useAudioPlayerStore((s) => s.currentTrack);
  const isAudioPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const playTrack = useAudioPlayerStore((s) => s.playTrack);
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay);

  const isCurrentPlaying = currentTrack?.id === item.id && isAudioPlaying;
  const isAudio = item.type === ContentType.AUDIO || !!item.audioUrl;
  const postUrl = `/bach-thoai-phat-phap/${encodeURIComponent(item.slug || item.id)}`;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!item.audioUrl) {
      return;
    }

    if (currentTrack?.id === item.id) {
      togglePlay();
    } else {
      playTrack({
        id: item.id,
        title: item.title,
        slug: item.slug,
        authorName: item.authorName,
        categoryName: "Bạch thoại Phật pháp",
        categorySlug: "bach-thoai-phat-phap",
        postUrl,
        thumbnailUrl: item.thumbnailUrl,
        audioUrl: item.audioUrl,
      });
    }
  };

  return (
    <Link
      href={postUrl}
      className={`group relative flex items-center justify-between gap-3.5 sm:gap-4 rounded-2xl border p-3 sm:p-4 backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer ${
        isCurrentPlaying
          ? "border-amber-300 bg-[#FAF3E8] ring-1 ring-amber-300/80 shadow-xs"
          : "border-[#EDE5D8]/90 bg-white/90 hover:border-amber-200 hover:bg-white"
      }`}
    >
      {/* Left: Thumbnail with Play Hover */}
      <div className="relative h-18 w-18 sm:h-20 sm:w-20 md:h-22 md:w-22 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-amber-900/10 bg-amber-50 shadow-2xs">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/lotus-thumb.jpg";
          }}
        />

        {/* Floating audio indicator overlay */}
        {isCurrentPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
            <span className="flex items-center gap-0.5">
              <span className="h-3 w-1 animate-pulse rounded-full bg-white" />
              <span className="h-4.5 w-1 animate-pulse rounded-full bg-white [animation-delay:150ms]" />
              <span className="h-2 w-1 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
            </span>
          </div>
        )}
      </div>

      {/* Middle: Rich Info for Center Dashboard Stream */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Meta badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.groupName &&
            item.groupName.toLowerCase() !== "undefined" &&
            item.groupName.toLowerCase() !== "không xác định" && (
              <span
                title={item.groupName}
                className={`inline-block max-w-[150px] truncate rounded-md border px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold leading-tight shadow-2xs ${getGroupBadgeStyle(
                  item.groupName
                )}`}
              >
                {item.groupName}
              </span>
            )}

          {isAudio ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-800">
              <Volume2 className="h-3 w-3 text-amber-700" />
              <span>Audio</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700">
              <BookOpen className="h-3 w-3 text-emerald-600" />
              <span>Bài đọc</span>
            </span>
          )}

          {isAudio && item.durationText && item.durationText !== "--:--" && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
              <Clock className="h-3 w-3" />
              <span>{item.durationText}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug line-clamp-2 transition-colors group-hover:text-amber-800">
          {item.title}
        </h4>

        {/* Author / Teacher Name */}
        <div className="flex items-center gap-2 text-xs">
          <span className="truncate font-medium text-amber-900/80">
            {item.authorName}
          </span>
          {item.snippet && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="truncate text-neutral-500 hidden sm:inline">
                {item.snippet}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Dedicated Golden Audio Action Button */}
      <div className="shrink-0 self-center pl-1">
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={
            !isAudio
              ? `Đọc ${item.title}`
              : isCurrentPlaying
              ? `Tạm dừng ${item.title}`
              : `Nghe ${item.title}`
          }
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
            isCurrentPlaying
              ? "bg-amber-600 text-white shadow-md shadow-amber-900/20 ring-4 ring-amber-200"
              : "bg-gradient-to-r from-[#C27803] to-[#B36B00] text-white shadow-xs hover:scale-105 hover:from-[#B36B00] hover:to-[#A35E00]"
          }`}
        >
          {!isAudio ? (
            <BookOpen className="h-4 w-4" />
          ) : isCurrentPlaying ? (
            <Pause className="h-4.5 w-4.5 fill-current" />
          ) : (
            <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />
          )}
        </button>
      </div>
    </Link>
  );
};
