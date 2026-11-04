"use client";

import { Pause, Play, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { formatTime } from "@/lib/utils";
import { trackAudioClick } from "@/lib/gtm";
import { useEvent } from "@/hooks";
import { useAudioPlayerStore, useListeningHistoryStore } from "@/stores";

export const PersistentAudioPlayer: React.FC = () => {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [thumbSrc, setThumbSrc] = useState<string>("/images/lotus-thumb.jpg");
  const lastSavedTimeRef = useRef<number>(0);

  // Scrubber Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const miniProgressBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragProgressRef = useRef<number | null>(null);

  // Listening History Store
  const recordListening = useListeningHistoryStore((s) => s.recordListening);
  const updateProgress = useListeningHistoryStore((s) => s.updateProgress);

  // Atomic selectors from Zustand store (Rule 1 & Rule 4)
  const currentTrack = useAudioPlayerStore((s) => s.currentTrack);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const currentTime = useAudioPlayerStore((s) => s.currentTime);
  const duration = useAudioPlayerStore((s) => s.duration);
  const playbackRate = useAudioPlayerStore((s) => s.playbackRate);
  const isRepeat = useAudioPlayerStore((s) => s.isRepeat);
  const isMiniPlayerVisible = useAudioPlayerStore((s) => s.isMiniPlayerVisible);
  const seekTarget = useAudioPlayerStore((s) => s.seekTarget);
  const sleepTimer = useAudioPlayerStore((s) => s.sleepTimer);

  const togglePlay = useAudioPlayerStore((s) => s.togglePlay);
  const pause = useAudioPlayerStore((s) => s.pause);
  const setCurrentTime = useAudioPlayerStore((s) => s.setCurrentTime);
  const setDuration = useAudioPlayerStore((s) => s.setDuration);
  const clearSeekTarget = useAudioPlayerStore((s) => s.clearSeekTarget);
  const closeMiniPlayer = useAudioPlayerStore((s) => s.closeMiniPlayer);

  // Track LISTEN interaction event immediately when audio starts playing
  const { trackListen } = useEvent();

  // Sync image when track changes
  useEffect(() => {
    if (currentTrack?.thumbnailUrl) {
      setThumbSrc(currentTrack.thumbnailUrl);
    } else {
      const isBachThoai =
        currentTrack?.categorySlug === "bach-thoai-phat-phap" ||
        currentTrack?.categoryName?.toLowerCase().includes("bạch thoại");
      setThumbSrc(isBachThoai ? "/images/bach-thoai-phat-phap.png" : "/images/lotus-thumb.jpg");
    }
  }, [currentTrack]);

  // Handle source & play state updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn("Persistent audio playback auto-play prevented:", err);
        pause();
      });
    } else {
      audio.pause();
    }
  }, [currentTrack?.audioUrl, isPlaying, pause]);

  // Handle seekTarget changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || seekTarget === null) return;
    audio.currentTime = seekTarget;
    clearSeekTarget();
  }, [seekTarget, clearSeekTarget]);

  // Handle playback rate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  // Handle sleep timer
  useEffect(() => {
    if (!sleepTimer) return;
    const timerId = setTimeout(() => {
      pause();
    }, sleepTimer * 60 * 1000);
    return () => clearTimeout(timerId);
  }, [sleepTimer, pause]);

  // Event listeners on HTML5 audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Throttle updating listening history progress to localStorage every 4 seconds
      if (
        currentTrack?.id &&
        Math.abs(audio.currentTime - lastSavedTimeRef.current) >= 4
      ) {
        lastSavedTimeRef.current = audio.currentTime;
        updateProgress(currentTrack.id, audio.currentTime);
      }
    };

    const handlePlay = () => {
      if (currentTrack?.id) {
        trackListen(currentTrack.id);
        recordListening({
          id: currentTrack.id,
          title: currentTrack.title,
          slug: currentTrack.slug || currentTrack.id,
          authorName: currentTrack.authorName,
          categoryName: currentTrack.categoryName,
          thumbnailUrl: currentTrack.thumbnailUrl,
          audioUrl: currentTrack.audioUrl,
          duration: currentTrack.duration,
          time: audio.currentTime,
        });
        lastSavedTimeRef.current = audio.currentTime;
      }
    };

    const handlePause = () => {
      if (currentTrack?.id) {
        updateProgress(currentTrack.id, audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (currentTrack?.id) {
        updateProgress(currentTrack.id, audio.duration || audio.currentTime);
      }
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        pause();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("playing", handlePlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("playing", handlePlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [
    isRepeat,
    pause,
    setCurrentTime,
    setDuration,
    currentTrack,
    trackListen,
    recordListening,
    updateProgress,
  ]);

  // Calculate seek percentage from pointer event clientX
  const getPercentFromClientX = (clientX: number): number => {
    if (!miniProgressBarRef.current) return 0;
    const rect = miniProgressBarRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const offsetX = clientX - rect.left;
    return Math.min(Math.max(offsetX / rect.width, 0), 1);
  };

  // Pointer drag events for real-time scrubber movement
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!audioRef.current || !duration) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const percent = getPercentFromClientX(e.clientX);
    isDraggingRef.current = true;
    dragProgressRef.current = percent;
    setIsDragging(true);
    setDragProgress(percent);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    const percent = getPercentFromClientX(e.clientX);
    dragProgressRef.current = percent;
    setDragProgress(percent);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    const finalPercent = dragProgressRef.current !== null ? dragProgressRef.current : getPercentFromClientX(e.clientX);
    isDraggingRef.current = false;
    dragProgressRef.current = null;
    setIsDragging(false);
    setDragProgress(null);

    const newTime = finalPercent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    isDraggingRef.current = false;
    dragProgressRef.current = null;
    setIsDragging(false);
    setDragProgress(null);
  };

  const handleNavigateToTrack = () => {
    if (!currentTrack) return;

    if (currentTrack.postUrl) {
      router.push(currentTrack.postUrl);
      return;
    }

    const targetSlug = currentTrack.slug || currentTrack.id;
    if (!targetSlug) return;

    const encoded = encodeURIComponent(targetSlug);

    if (currentTrack.categorySlug) {
      router.push(`/${currentTrack.categorySlug}/${encoded}`);
      return;
    }

    if (currentTrack.categoryName) {
      const lower = currentTrack.categoryName.toLowerCase();
      if (lower.includes("bạch thoại") || lower.includes("bach-thoai")) {
        router.push(`/bach-thoai-phat-phap/${encoded}`);
        return;
      }
    }

    // Fallback to Bach thoai phat phap
    router.push(`/bach-thoai-phat-phap/${encoded}`);
  };

  const effectivePercent =
    isDragging && dragProgress !== null
      ? dragProgress * 100
      : duration > 0
      ? Math.min(Math.max((currentTime / duration) * 100, 0), 100)
      : 0;
  const displayCurrentTime =
    isDragging && dragProgress !== null ? dragProgress * duration : currentTime;

  return (
    <>
      {/* Global persistent HTML5 Audio Element - NEVER unmounts during page route transitions */}
      <audio ref={audioRef} preload="metadata" className="hidden" />

      {/* Floating Mini Player Widget matching user screenshot */}
      {currentTrack && isMiniPlayerVisible && (
        <aside
          role="region"
          aria-label="Trình phát âm thanh thu nhỏ"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-[#EDE5D8] bg-white/95 px-3.5 py-3 shadow-xl backdrop-blur-md select-none transition-all duration-300 hover:shadow-2xl sm:bottom-6 sm:right-6 sm:px-4 sm:py-3.5"
        >
          {/* Close Button to dismiss mini player when desired */}
          <button
            type="button"
            data-track-click="audio_close_mini_player"
            data-track-category="audio_player"
            onClick={(e) => {
              e.stopPropagation();
              trackAudioClick({
                action: "close",
                trackTitle: currentTrack.title,
                trackId: currentTrack.id,
              });
              closeMiniPlayer();
            }}
            aria-label="Tắt trình phát thu nhỏ"
            title="Tắt và dừng phát"
            className="absolute -top-2.5 -right-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#EDE5D8] bg-white text-neutral-400 shadow-xs transition hover:scale-110 hover:text-neutral-900 active:scale-95 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Thumbnail */}
          <div
            onClick={handleNavigateToTrack}
            role="button"
            tabIndex={0}
            data-track-click="audio_open_track_detail"
            data-track-category="audio_player"
            aria-label={`Mở bài viết ${currentTrack.title}`}
            onKeyDown={(e) => e.key === "Enter" && handleNavigateToTrack()}
            className="group relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-amber-900/10 bg-amber-50 shadow-2xs sm:h-13 sm:w-13"
          >
            {/* Safe <img> to prevent Next Image external hostname restrictions */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbSrc}
              alt={currentTrack.title}
              onError={() => {
                const isBachThoai =
                  currentTrack?.categorySlug === "bach-thoai-phat-phap" ||
                  currentTrack?.categoryName?.toLowerCase().includes("bạch thoại");
                setThumbSrc(isBachThoai ? "/images/bach-thoai-phat-phap.png" : "/images/lotus-thumb.jpg");
              }}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>

          {/* Track Details & Mini Progress */}
          <div className="flex min-w-[140px] max-w-[180px] flex-col justify-center sm:min-w-[170px] sm:max-w-[210px]">
            <p
              onClick={handleNavigateToTrack}
              role="button"
              tabIndex={0}
              data-track-click="audio_open_track_detail"
              data-track-category="audio_player"
              onKeyDown={(e) => e.key === "Enter" && handleNavigateToTrack()}
              title={currentTrack.title}
              className="cursor-pointer truncate text-sm font-bold text-neutral-900 leading-tight transition hover:text-amber-800"
            >
              {currentTrack.title}
            </p>

            <span className="mt-0.5 font-mono text-xs font-medium text-neutral-500">
              {formatTime(displayCurrentTime)} / {formatTime(duration || currentTrack.duration || 0)}
            </span>

            {/* Mini Progress Bar with Pointer Drag Support */}
            <div
              ref={miniProgressBarRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              role="progressbar"
              aria-valuenow={effectivePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`relative mt-1.5 h-1.5 w-full cursor-pointer rounded-full bg-neutral-200/90 touch-none select-none transition-all ${
                isDragging ? "h-2" : "hover:h-2"
              }`}
            >
              <div
                className={`h-full rounded-full bg-[#B86E0E] ${
                  isDragging ? "transition-none" : "transition-all duration-75"
                }`}
                style={{ width: `${effectivePercent}%` }}
              />
            </div>
          </div>

          {/* Amber Circle Play/Pause Button */}
          <button
            type="button"
            data-track-click={isPlaying ? "audio_pause" : "audio_play"}
            data-track-category="audio_player"
            onClick={(e) => {
              e.stopPropagation();
              trackAudioClick({
                action: isPlaying ? "pause" : "play",
                trackTitle: currentTrack.title,
                trackId: currentTrack.id,
              });
              togglePlay();
            }}
            aria-label={isPlaying ? "Tạm dừng phát" : "Tiếp tục phát"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B86E0E] text-white shadow-sm transition hover:bg-[#9E5E0C] active:scale-95 sm:h-10 sm:w-10 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-white" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-white" />
            )}
          </button>
        </aside>
      )}
    </>
  );
};
