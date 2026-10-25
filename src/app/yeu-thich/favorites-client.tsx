"use client";

import {
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Home,
  Pause,
  Play,
  Search,
  Trash2,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { MainLayout } from "@/components/layout";
import { trackSearch } from "@/lib/gtm";
import { formatTime } from "@/lib/utils";
import {
  type FavoriteItem,
  useAudioPlayerStore,
  useFavoritesList,
  useFavoritesStore,
} from "@/stores";

type FilterTab = "ALL" | "AUDIO" | "ARTICLE";

export const FavoritesClient: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Favorites store
  const favorites = useFavoritesList();
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);

  // Global Audio store
  const currentTrack = useAudioPlayerStore((s) => s.currentTrack);
  const isAudioPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const playTrack = useAudioPlayerStore((s) => s.playTrack);
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay);

  // Filter items by tab and search
  const filteredItems = useMemo(() => {
    return favorites.filter((item) => {
      // Tab filter
      const isAudio = Boolean(item.audioUrl) || item.type === "AUDIO";
      if (activeTab === "AUDIO" && !isAudio) return false;
      if (activeTab === "ARTICLE" && isAudio) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = item.title.toLowerCase().includes(query);
        const authorMatch = (item.authorName || "").toLowerCase().includes(query);
        const categoryMatch = (item.categoryName || "").toLowerCase().includes(query);
        return titleMatch || authorMatch || categoryMatch;
      }

      return true;
    });
  }, [favorites, activeTab, searchQuery]);

  // Debounced search tracking for GTM & GA4
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timeoutId = setTimeout(() => {
      trackSearch({
        searchTerm: searchQuery,
        searchLocation: "favorites",
        resultsCount: filteredItems.length,
      });
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filteredItems.length]);

  const audioCount = useMemo(
    () => favorites.filter((f) => Boolean(f.audioUrl) || f.type === "AUDIO").length,
    [favorites]
  );
  const articleCount = favorites.length - audioCount;

  // Handle Play/Pause
  const handleTogglePlay = (item: FavoriteItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!item.audioUrl) {
      router.push(`/post/${encodeURIComponent(item.slug)}`);
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
        categoryName: item.categoryName,
        thumbnailUrl: item.thumbnailUrl,
        audioUrl: item.audioUrl,
        duration: item.duration || undefined,
        postUrl: `/post/${encodeURIComponent(item.slug)}`,
      });
    }
  };

  const handleRemove = (item: FavoriteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(item.id);
    setToastMessage(`Đã xóa "${item.title}" khỏi bài viết đã lưu.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách bài viết đã lưu?")) {
      clearFavorites();
      setToastMessage("Đã xóa toàn bộ bài viết đã lưu.");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <MainLayout
      activeId="favorites"
      maxWidth="4xl"
      mainClassName="space-y-6"
      onSearch={(query) => setSearchQuery(query)}
    >
      {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Link href="/" className="hover:text-amber-700 flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span>Trang chủ</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-amber-900">Bài viết đã lưu</span>
          </div>

          {/* Page Banner Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-[#EDE5D8] bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-800 shadow-2xs">
                <Bookmark className="h-6 w-6 fill-amber-700 text-amber-700" />
              </div>
              <div>
                <h1
                  className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Bài viết đã lưu & Yêu thích
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                  Lưu trữ cục bộ trên trình duyệt để bạn tiện xem lại và tu tập mọi lúc.
                </p>
              </div>
            </div>

            {/* Clear all action */}
            {favorites.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-track-click="favorites_filter_all"
                data-track-category="favorites_filter"
                onClick={() => setActiveTab("ALL")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-[#B86E0E] text-white shadow-xs"
                    : "bg-white/80 hover:bg-white text-neutral-600 border border-[#EDE5D8]"
                }`}
              >
                Tất cả ({favorites.length})
              </button>

              <button
                type="button"
                data-track-click="favorites_filter_audio"
                data-track-category="favorites_filter"
                onClick={() => setActiveTab("AUDIO")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
                  activeTab === "AUDIO"
                    ? "bg-[#B86E0E] text-white shadow-xs"
                    : "bg-white/80 hover:bg-white text-neutral-600 border border-[#EDE5D8]"
                }`}
              >
                Audio ({audioCount})
              </button>

              <button
                type="button"
                data-track-click="favorites_filter_article"
                data-track-category="favorites_filter"
                onClick={() => setActiveTab("ARTICLE")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
                  activeTab === "ARTICLE"
                    ? "bg-[#B86E0E] text-white shadow-xs"
                    : "bg-white/80 hover:bg-white text-neutral-600 border border-[#EDE5D8]"
                }`}
              >
                Bài đọc ({articleCount})
              </button>
            </div>

            {/* Quick in-page Search filter */}
            {favorites.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lọc trong mục đã lưu..."
                  className="w-full rounded-xl border border-[#EDE5D8] bg-white/80 py-1.5 pr-3 pl-8 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-amber-600 focus:bg-white focus:outline-none shadow-2xs"
                />
              </div>
            )}
          </div>

          {/* Cards List or Empty State */}
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE5D8]/90 bg-white/80 p-8 sm:p-14 text-center shadow-xs">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 shadow-2xs">
                <Bookmark className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-800 sm:text-lg">
                {favorites.length === 0
                  ? "Chưa có bài viết yêu thích nào"
                  : "Không tìm thấy bài viết phù hợp với bộ lọc"}
              </h3>
              <p className="mt-1.5 max-w-md text-xs sm:text-sm text-neutral-500 leading-relaxed">
                {favorites.length === 0
                  ? "Bấm vào biểu tượng đánh dấu (Bookmark) tại bất kỳ bài giảng hoặc bài viết nào để lưu lại danh sách yêu thích của bạn."
                  : "Thử tìm kiếm với từ khóa khác hoặc chuyển tab bộ lọc phía trên."}
              </p>
              {favorites.length === 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/bach-thoai-phat-phap"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#B86E0E] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#9E5E0C]"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Xem Bạch thoại Phật pháp</span>
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50"
                  >
                    <Home className="h-4 w-4" />
                    <span>Về trang chủ</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {filteredItems.map((item) => {
                const isCurrentPlaying =
                  currentTrack?.id === item.id && isAudioPlaying;
                const postUrl = `/post/${encodeURIComponent(item.slug)}`;
                const isAudio = Boolean(item.audioUrl) || item.type === "AUDIO";

                const formattedDate = item.savedAt
                  ? new Date(item.savedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(postUrl)}
                    className={`group flex items-center justify-between gap-3.5 sm:gap-4 rounded-2xl border border-[#EDE5D8]/90 bg-white/95 p-3.5 sm:p-4 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-xs cursor-pointer ${
                      isCurrentPlaying ? "bg-[#FAF2E6] ring-1 ring-amber-300" : ""
                    }`}
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-4">
                      {/* Square Rounded Thumbnail */}
                      <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-2xl border border-amber-900/10 bg-amber-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailUrl || "/images/lotus-thumb.jpg"}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/images/lotus-thumb.jpg";
                          }}
                        />
                      </div>

                      {/* Middle Info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              isAudio
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {isAudio ? "Audio" : "Bài viết"}
                          </span>
                          {item.categoryName && (
                            <span className="truncate text-[11px] text-neutral-400">
                              {item.categoryName}
                            </span>
                          )}
                        </div>

                        <h3 className="truncate text-sm sm:text-base font-bold text-neutral-900 transition-colors group-hover:text-amber-900">
                          {item.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                          {item.authorName && (
                            <span className="font-medium text-neutral-500">
                              {item.authorName}
                            </span>
                          )}

                          {isAudio && item.duration ? (
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(item.duration)}</span>
                            </div>
                          ) : null}

                          {formattedDate && (
                            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                              <Calendar className="h-3 w-3" />
                              <span>Lưu {formattedDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Audio Play & Delete Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isAudio && (
                        <button
                          type="button"
                          onClick={(e) => handleTogglePlay(item, e)}
                          aria-label={
                            isCurrentPlaying
                              ? `Tạm dừng ${item.title}`
                              : `Nghe ${item.title}`
                          }
                          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#B86E0E] text-white shadow-xs transition-all hover:bg-[#A05C08] active:scale-95 cursor-pointer"
                        >
                          {isCurrentPlaying ? (
                            <Pause className="h-4 w-4 fill-current" />
                          ) : (
                            <Play className="ml-0.5 h-4 w-4 fill-current" />
                          )}
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => handleRemove(item, e)}
                        title="Xóa khỏi yêu thích"
                        aria-label={`Xóa ${item.title} khỏi bài viết đã lưu`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900/90 text-white border border-neutral-700 px-4 py-2 text-xs font-semibold shadow-xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-bottom-2">
            {toastMessage}
          </div>
        )}
    </MainLayout>
  );
};
