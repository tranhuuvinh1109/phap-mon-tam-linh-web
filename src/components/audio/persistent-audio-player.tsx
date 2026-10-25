"use client";

import { Pause, Play, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { formatTime } from "@/lib/utils";
import { trackAudioClick } from "@/lib/gtm";
import { useEvent } from "@/hooks";
import { useAudioPlayerStore } from "@/stores";

export const PersistentAudioPlayer: React.FC = () => {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [thumbSrc, setThumbSrc] = useState<string>("/images/lotus-thumb.jpg");

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
      setThumbSrc("/images/lotus-thumb.jpg");
    }
  }, [currentTrack?.thumbnailUrl]);

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
    };

    const handlePlay = () => {
      if (currentTrack?.id) {
        trackListen(currentTrack.id);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => { });
      } else {
        pause();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("playing", handlePlay);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("playing", handlePlay);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isRepeat, pause, setCurrentTime, setDuration, currentTrack?.id, trackListen]);

  // Seek bar click handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
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

  const progressPercent =
    duration > 0 ? Math.min(Math.max((currentTime / duration) * 100, 0), 100) : 0;

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
              onError={() => setThumbSrc("/images/lotus-thumb.jpg")}
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
              {formatTime(currentTime)} / {formatTime(duration || currentTrack.duration || 0)}
            </span>

            {/* Mini Progress Bar with Amber Fill */}
            <div
              onClick={handleSeek}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative mt-1.5 h-1 w-full cursor-pointer rounded-full bg-neutral-200/90 overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-[#B86E0E] transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
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
