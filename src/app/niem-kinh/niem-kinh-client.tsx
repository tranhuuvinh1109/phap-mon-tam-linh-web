"use client";

import {
  AlertCircle,
  Bookmark,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Home,
  RefreshCw,
  Share2,
  Sparkles,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";

import { useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { DEFAULT_NIEM_KINH_DATA, parseNiemKinhContent } from "@/app/admin/post/types";
import { isNiemKinh } from "@/app/admin/post/utils/content-type";
import { MainLayout } from "@/components/layout";
import { CategorizedPosts, NiemKinhAccordion } from "@/components/post";
import { NiemKinhSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui";
import { NIEM_KINH_ID, NIEM_KINH_SLUG } from "@/constants";
import { useFavoritesStore, useIsFavorite } from "@/stores";

export const NiemKinhClient: React.FC = () => {
  const searchParams = useSearchParams();
  const selectedSlugOrId = searchParams.get("post");

  // 1. Call API endpoint: /posts/search?category=niệm-kinh
  const {
    data: searchResponse,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchPosts({ category: "niệm-kinh" });

  // Get posts list from search response
  const niemKinhPosts: PostItemType[] = useMemo(() => {
    if (!searchResponse) return [];
    if (Array.isArray(searchResponse)) return searchResponse;
    if (Array.isArray(searchResponse.data)) return searchResponse.data;
    return [];
  }, [searchResponse]);

  // Determine active post to display details (default to first element)
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const displayPost: PostItemType | null = useMemo(() => {
    // If user clicked a specific post from the list
    if (activePostId) {
      const found = niemKinhPosts.find((p) => p.id === activePostId);
      if (found) return found;
    }

    if (selectedSlugOrId) {
      const found = niemKinhPosts.find(
        (p) => p.slug === selectedSlugOrId || p.id === selectedSlugOrId
      );
      if (found) return found;
    }

    // Default to first element from /posts/search?category=niệm-kinh
    return niemKinhPosts[0] || null;
  }, [activePostId, selectedSlugOrId, niemKinhPosts]);

  // Favorites
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isBookmarked = useIsFavorite(displayPost?.id);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleFavorite = () => {
    if (!displayPost) return;
    const isSaved = toggleFavorite({
      id: displayPost.id,
      title: displayPost.title,
      slug: displayPost.slug || displayPost.id,
      authorName: displayPost.author?.name || "Ban biên tập",
      categoryName: displayPost.category?.name || "Niệm Kinh",
      thumbnailUrl: displayPost.thumbnailUrl || "/images/lotus-thumb.jpg",
    });

    setToastMessage(
      isSaved ? "Đã lưu bài viết vào mục Yêu thích!" : "Đã bỏ lưu bài viết."
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Parse steps data from displayPost.content or fallback to default template
  const stepsData = useMemo(() => {
    if (displayPost?.content) {
      const parsed = parseNiemKinhContent(displayPost.content);
      if (parsed) return parsed;
    }
    return DEFAULT_NIEM_KINH_DATA;
  }, [displayPost]);

  const isLoading = isSearchLoading && !displayPost;

  return (
    <MainLayout activeId="practice">
      <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 flex-wrap"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-amber-800 transition"
          >
            <Home className="h-4 w-4" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          <span className="font-medium text-amber-900">Niệm Kinh</span>
          {isLoading ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              <div className="h-4 w-32 rounded bg-neutral-200/60 animate-pulse" />
            </>
          ) : displayPost ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              <span className="font-medium text-neutral-800 truncate max-w-[200px] sm:max-w-[320px]">
                {displayPost.title}
              </span>
            </>
          ) : null}
        </nav>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Main Column: Post Details with Steps Accordion */}
          <div className="space-y-6 lg:col-span-8">
            {/* Loading State with Skeleton */}
            {isLoading && <NiemKinhSkeleton />}

            {/* Error State */}
            {!isLoading && isSearchError && !displayPost && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold">Không thể tải bài viết Niệm Kinh</h3>
                    <p className="text-xs text-red-600/90 mt-1">
                      {searchError?.message || "Vui lòng kiểm tra lại kết nối mạng hoặc thử lại."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    refetchSearch();
                  }}
                  className="rounded-xl bg-red-100 px-3.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-200 flex items-center gap-1.5 shrink-0 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Thử lại</span>
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !displayPost && !isSearchError && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-12 text-center shadow-xs">
                <BookOpen className="h-10 w-10 text-neutral-300 mb-3" />
                <h3 className="text-base font-bold text-neutral-800">
                  Chưa có bài viết Niệm Kinh
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-md">
                  Hiện chưa có bài viết nào thuộc chuyên mục Niệm Kinh trong hệ thống. Vui lòng quay lại sau.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900 transition"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Về trang chủ</span>
                </Link>
              </div>
            )}

            {/* Post Content when displayPost exists */}
            {displayPost && (
              <>
                {/* Multiple Niệm Kinh Posts Switcher (if more than 1 post exists) */}
                {niemKinhPosts.length > 1 && (
                  <div className="rounded-2xl border border-amber-200/90 bg-[#FDFBF7] p-3 sm:p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-amber-700" />
                        <span>Các bài Niệm Kinh ({niemKinhPosts.length} bài)</span>
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Chọn bài để xem chi tiết
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {niemKinhPosts.map((post) => {
                        const isCurrent = displayPost?.id === post.id;
                        return (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => setActivePostId(post.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${isCurrent
                              ? "bg-amber-700 text-white shadow-2xs"
                              : "bg-white text-neutral-700 border border-neutral-200 hover:border-amber-300 hover:bg-amber-50"
                              }`}
                          >
                            {post.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Post Detail Card */}
                <article className="overflow-hidden rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-5 shadow-xs sm:p-8 space-y-6">
                  {/* Category Badges & Social Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-900">
                        <Tag className="h-3 w-3 text-amber-700" />
                        <span>{displayPost?.category?.name || "Niệm Kinh"}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <BookOpen className="h-3 w-3 text-emerald-700" />
                        <span>Nghi thức theo từng bước</span>
                      </span>
                    </div>

                    {/* Favorite & Share Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleFavorite}
                        title={isBookmarked ? "Bỏ lưu bài viết" : "Lưu vào yêu thích"}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition shadow-2xs cursor-pointer ${isBookmarked
                          ? "border-amber-400 bg-amber-100/90 text-amber-900 font-bold"
                          : "border-[#EDE5D8] bg-white text-neutral-600 hover:bg-[#FAF7F0] hover:text-amber-800"
                          }`}
                      >
                        <Bookmark
                          className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-700 text-amber-700" : ""
                            }`}
                        />
                        <span>{isBookmarked ? "Đã lưu" : "Lưu bài"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShare}
                        title="Sao chép liên kết bài viết"
                        className="flex items-center gap-1.5 rounded-xl border border-[#EDE5D8] bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-[#FAF7F0] hover:text-amber-800 transition shadow-2xs cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Chia sẻ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Post Title */}
                  <div>
                    <h1
                      className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl leading-snug"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {displayPost.title}
                    </h1>

                    {/* Author & Meta */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        <span className="font-semibold text-neutral-700">
                          {displayPost?.author?.name || "Ban biên tập Phật Pháp"}
                        </span>
                      </div>

                      <span className="text-neutral-300">•</span>

                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                        <span>
                          {displayPost?.createdAt
                            ? new Date(displayPost.createdAt).toLocaleDateString("vi-VN")
                            : "Hằng ngày"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* POST CONTENT: RENDERED ACCORDING TO STEPS */}
                  <div className="pt-2">
                    <NiemKinhAccordion data={stepsData} allowToggle={true} />
                  </div>

                  {/* Bottom Dedication Blessing Note */}
                  <div className="border-t border-[#EDE5D8] pt-6 text-center text-xs italic text-neutral-500 leading-relaxed">
                    Nguyện đem công đức này, hướng về khắp tất cả. Đệ tử và chúng sanh, đều trọn thành Phật đạo.
                  </div>
                </article>
              </>
            )}
          </div>
        </div>

        {/* Toast Alert */}
        {(isCopied || toastMessage) && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900/90 text-white border border-neutral-700 px-4 py-2 text-xs font-semibold shadow-xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-bottom-2">
            {toastMessage || "Đã sao chép liên kết bài viết!"}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
