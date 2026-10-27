"use client";

import {
  ArrowLeft,
  Bookmark,
  Clock,
  ExternalLink,
  Pause,
  Play,
  Repeat,
  Share2,
  Shuffle,
  SkipForward,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import type { PostItemType } from "@/api/post/post.type";
import { formatTime } from "@/lib/utils";
import { useAudioPlayerStore, useFavoritesStore, useIsFavorite } from "@/stores";

interface BachThoaiAudioPlayerProps {
  post: PostItemType;
  onBack?: () => void;
  className?: string;
}

export const BachThoaiAudioPlayer: React.FC<BachThoaiAudioPlayerProps> = ({
  post,
  onBack,
  className = "",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSeekedFromParamRef = useRef(false);

  // Global Audio Store (Atomic selectors)
  const currentTrack = useAudioPlayerStore((s) => s.currentTrack);
  const isGlobalPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const globalCurrentTime = useAudioPlayerStore((s) => s.currentTime);
  const globalDuration = useAudioPlayerStore((s) => s.duration);
  const playbackRate = useAudioPlayerStore((s) => s.playbackRate);
  const isRepeat = useAudioPlayerStore((s) => s.isRepeat);
  const sleepTimer = useAudioPlayerStore((s) => s.sleepTimer);
  const isMiniPlayerVisible = useAudioPlayerStore((s) => s.isMiniPlayerVisible);

  const playTrack = useAudioPlayerStore((s) => s.playTrack);
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay);
  const seek = useAudioPlayerStore((s) => s.seek);
  const setPlaybackRate = useAudioPlayerStore((s) => s.setPlaybackRate);
  const setIsRepeat = useAudioPlayerStore((s) => s.setIsRepeat);
  const setSleepTimer = useAudioPlayerStore((s) => s.setSleepTimer);
  const showMiniPlayer = useAudioPlayerStore((s) => s.showMiniPlayer);

  // Favorites Store
  const isBookmarked = useIsFavorite(post.id);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  // Local UI State
  const [isShuffle, setIsShuffle] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio source: prefer post.audio.audioUrl or sample audio
  const audioSource =
    post.audio?.audioUrl ||
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  // Check if this post is currently active in the persistent store
  const isCurrentActive = currentTrack?.id === post.id;
  const isPlaying = isCurrentActive && isGlobalPlaying;
  const currentTime = isCurrentActive ? globalCurrentTime : 0;
  const duration =
    isCurrentActive && globalDuration > 0
      ? globalDuration
      : post.audio?.duration && post.audio.duration > 0
      ? post.audio.duration
      : 1965; // fallback ~32:45

  // Auto seek if arriving from listening history with ?time=...
  useEffect(() => {
    const timeParam = searchParams.get("time") || searchParams.get("t");
    if (!timeParam || hasSeekedFromParamRef.current) return;

    const parsedTime = parseFloat(timeParam);
    if (!isNaN(parsedTime) && parsedTime > 0) {
      hasSeekedFromParamRef.current = true;
      if (!isCurrentActive) {
        playTrack({
          id: post.id,
          title: post.title,
          slug: post.slug || post.id,
          authorName: post.author?.name || "TT. Thích Minh Niệm",
          categoryName: post.category?.name || "Bạch thoại Phật pháp",
          thumbnailUrl: post.thumbnailUrl || "/images/lotus-thumb.jpg",
          audioUrl: audioSource,
          duration: post.audio?.duration || 1965,
        });
      }
      setTimeout(() => {
        seek(parsedTime);
      }, 200);
    }
  }, [searchParams, isCurrentActive, post, audioSource, playTrack, seek]);

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (isCurrentActive) {
      togglePlay();
    } else {
      playTrack({
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        authorName: post.author?.name || "TT. Thích Minh Niệm",
        categoryName: post.category?.name || "Bạch thoại Phật pháp",
        thumbnailUrl: post.thumbnailUrl || "/images/lotus-thumb.jpg",
        audioUrl: audioSource,
        duration: post.audio?.duration || 1965,
      });
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = () => {
    const isSaved = toggleFavorite({
      id: post.id,
      title: post.title,
      slug: post.slug || post.id,
      authorName: post.author?.name || "TT. Thích Minh Niệm",
      categoryName: post.category?.name || "Bạch thoại Phật pháp",
      thumbnailUrl: post.thumbnailUrl || "/images/lotus-thumb.jpg",
      audioUrl: audioSource,
      duration: post.audio?.duration || 1965,
      type: post.type || "AUDIO",
    });
    setToastMessage(
      isSaved
        ? "Đã lưu vào danh sách yêu thích!"
        : "Đã xóa khỏi danh sách yêu thích!"
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Skip forward / backward
  const handleSkip = (seconds: number) => {
    if (!isCurrentActive) {
      handleTogglePlay();
      return;
    }
    const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
    seek(newTime);
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    const newTime = percent * duration;

    if (!isCurrentActive) {
      playTrack({
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        authorName: post.author?.name || "TT. Thích Minh Niệm",
        categoryName: post.category?.name || "Bạch thoại Phật pháp",
        thumbnailUrl: post.thumbnailUrl || "/images/lotus-thumb.jpg",
        audioUrl: audioSource,
        duration: post.audio?.duration || 1965,
      });
    }
    seek(newTime);
  };

  // Change playback speed
  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  // Toggle sleep timer
  const cycleSleepTimer = () => {
    const timers = [null, 15, 30, 45, 60];
    const currentIndex = timers.indexOf(sleepTimer);
    const nextTimer = timers[(currentIndex + 1) % timers.length];
    setSleepTimer(nextTimer);
  };

  // Handle share
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Toggle persistent mini player
  const handlePopOutMiniPlayer = () => {
    if (!isCurrentActive) {
      playTrack({
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        authorName: post.author?.name || "TT. Thích Minh Niệm",
        categoryName: post.category?.name || "Bạch thoại Phật pháp",
        thumbnailUrl: post.thumbnailUrl || "/images/lotus-thumb.jpg",
        audioUrl: audioSource,
        duration: post.audio?.duration || 1965,
      });
    }
    showMiniPlayer();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const coverImage = post.thumbnailUrl || "/images/lotus-thumb.jpg";
  const subtitle = `${post.category?.name || "Kinh tụng và niệm Phật"} | ${
    post.author?.name || "TT. Thích Minh Niệm"
  }`;

  return (
    <div
      className={`relative w-full rounded-3xl bg-white/95 text-neutral-800 flex flex-col justify-between overflow-hidden shadow-xs border border-[#EDE5D8]/90 select-none min-h-[620px] sm:min-h-[680px] ${className}`}
    >
      {/* Background Soft Warm Light Tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F0] via-white to-[#FAF4EB]/50 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-amber-100/35 to-transparent pointer-events-none" />

      {/* Main Container - Full Width & Responsive */}
      <div className="relative z-10 flex w-full flex-1 flex-col justify-between p-5 sm:p-7 md:p-8 lg:p-10">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between w-full max-w-3xl mx-auto pt-1">
          {/* Back Button */}
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            aria-label="Quay lại"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-[#FAF4EB] hover:text-amber-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Pop-out / Floating Mini Player button to allow continuous playback */}
            <button
              type="button"
              onClick={handlePopOutMiniPlayer}
              aria-label="Phát thu nhỏ / tiếp tục phát khi đổi trang"
              title="Mở trình phát thu nhỏ (tiếp tục nghe khi đổi trang)"
              className={`flex items-center gap-1.5 px-3 h-10 rounded-xl transition text-xs font-semibold cursor-pointer ${
                isMiniPlayerVisible
                  ? "bg-amber-100/90 text-amber-900 border border-amber-300/80 shadow-2xs"
                  : "text-neutral-600 bg-neutral-100/80 hover:bg-[#FAF4EB] hover:text-amber-800"
              }`}
            >
              <ExternalLink className="h-4 w-4 text-amber-700" />
              <span className="hidden sm:inline">Phát khi chuyển trang</span>
            </button>

            {/* Bookmark Toggle */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={isBookmarked ? "Bỏ lưu bài viết" : "Lưu vào yêu thích"}
              title={isBookmarked ? "Bỏ lưu bài viết" : "Lưu vào yêu thích"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition cursor-pointer ${
                isBookmarked
                  ? "text-amber-700 bg-amber-50"
                  : "text-neutral-500 hover:bg-[#FAF4EB] hover:text-amber-800"
              }`}
            >
              <Bookmark
                className={`h-5 w-5 ${isBookmarked ? "fill-amber-600 text-amber-600" : ""}`}
              />
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Chia sẻ"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-[#FAF4EB] hover:text-amber-800"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Center Artwork Cover Card */}
        <div className="my-auto py-6 sm:py-8 flex flex-col items-center w-full">
          <div className="relative h-60 w-60 sm:h-72 sm:w-72 md:h-80 md:w-80 overflow-hidden rounded-[32px] border border-amber-900/10 bg-amber-50 shadow-xl transition-all duration-300">
            <img
              src={coverImage}
              alt={post.title}
              className="h-full w-full object-cover object-center"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/lotus-thumb.jpg";
              }}
            />
            {/* Subtle inner ring */}
            <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-black/5 pointer-events-none" />
          </div>

          {/* Title & Subtitle */}
          <div className="mt-6 sm:mt-7 w-full max-w-xl text-center px-4 space-y-1.5">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 tracking-wide line-clamp-2 leading-snug"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {post.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 font-medium line-clamp-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Player Controls & Scrubber Section - Spans Full Responsive Width */}
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-2">
          {/* Progress Bar & Timestamps */}
          <div className="space-y-2">
            {/* Track Bar */}
            <div
              onClick={handleSeek}
              className="group relative h-2 w-full cursor-pointer rounded-full bg-neutral-200/80 transition-all hover:h-2.5"
            >
              {/* Active Fill */}
              <div
                className="h-full rounded-full bg-[#B86E0E] transition-all"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Thumb Scrubber */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#B86E0E] ring-2 ring-white shadow-sm transition-transform group-hover:scale-125"
                style={{
                  left: `calc(${progressPercent}% - 8px)`,
                }}
              />
            </div>

            {/* Timestamps */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-400 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Audio Controls Row */}
          <div className="flex items-center justify-between sm:justify-center sm:gap-10 md:gap-14 px-2 sm:px-6">
            {/* Shuffle Toggle */}
            <button
              type="button"
              onClick={() => setIsShuffle((prev) => !prev)}
              aria-label="Phát ngẫu nhiên"
              className={`p-2.5 rounded-xl transition ${
                isShuffle ? "text-amber-700 bg-amber-50" : "text-neutral-400 hover:text-amber-800"
              }`}
            >
              <Shuffle className="h-5 w-5" />
            </button>

            {/* Replay -15s Button */}
            <button
              type="button"
              onClick={() => handleSkip(-15)}
              aria-label="Lùi 15 giây"
              className="group relative flex h-11 w-11 items-center justify-center text-neutral-700 hover:text-amber-800 transition active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 sm:h-8 sm:w-8 fill-none stroke-current stroke-2"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span className="absolute text-[9px] sm:text-[10px] font-bold text-neutral-800 top-[11px] sm:top-[12px]">
                15
              </span>
            </button>

            {/* Big Golden Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Tạm dừng" : "Phát bài giảng"}
              className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-[24px] bg-[#B86E0E] text-white shadow-lg transition-all hover:bg-[#A05C08] hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 fill-current stroke-none" />
              ) : (
                <Play className="ml-1 h-7 w-7 fill-current stroke-none" />
              )}
            </button>

            {/* Forward +30s Button */}
            <button
              type="button"
              onClick={() => handleSkip(30)}
              aria-label="Tua tới 30 giây"
              className="group relative flex h-11 w-11 items-center justify-center text-neutral-700 hover:text-amber-800 transition active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 sm:h-8 sm:w-8 fill-none stroke-current stroke-2"
              >
                <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              <span className="absolute text-[9px] sm:text-[10px] font-bold text-neutral-800 top-[11px] sm:top-[12px]">
                30
              </span>
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={() => handleSkip(60)}
              aria-label="Bài tiếp theo"
              className="p-2.5 rounded-xl text-neutral-400 transition hover:text-amber-800"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom Secondary Controls Row (NO download button as requested) */}
          <div className="flex items-center justify-around sm:justify-center sm:gap-16 border-t border-[#EDE5D8]/80 pt-5 text-xs text-neutral-500">
            {/* Speed Control */}
            <button
              type="button"
              onClick={cyclePlaybackRate}
              className="flex flex-col items-center gap-1 transition hover:text-amber-800"
            >
              <span className="text-sm font-bold text-neutral-800">
                {playbackRate}x
              </span>
              <span className="text-[11px] text-neutral-500">Tốc độ</span>
            </button>

            {/* Sleep Timer */}
            <button
              type="button"
              onClick={cycleSleepTimer}
              className={`flex flex-col items-center gap-1 transition hover:text-amber-800 ${
                sleepTimer ? "text-amber-700 font-semibold" : ""
              }`}
            >
              <Clock className="h-5 w-5 text-neutral-600" />
              <span className="text-[11px]">
                {sleepTimer ? `${sleepTimer}p` : "Hẹn giờ"}
              </span>
            </button>

            {/* Repeat Toggle */}
            <button
              type="button"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`flex flex-col items-center gap-1 transition hover:text-amber-800 ${
                isRepeat ? "text-amber-700 font-semibold" : ""
              }`}
            >
              <Repeat
                className={`h-5 w-5 ${
                  isRepeat ? "text-amber-700" : "text-neutral-600"
                }`}
              />
              <span className="text-[11px]">Lặp lại</span>
            </button>
          </div>
        </div>


        {/* Toast Alert */}
        {(isCopied || toastMessage) && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900/90 text-white border border-neutral-700 px-4 py-2 text-xs font-semibold shadow-xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-bottom-2">
            {toastMessage || "Đã sao chép liên kết bài giảng!"}
          </div>
        )}
      </div>
    </div>
  );
};
