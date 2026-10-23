"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { useGetPostsByCategory } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { BachThoaiDisplayItem, BachThoaiItem } from "@/components/home";
import { MainLayout } from "@/components/layout";
import { BachThoaiSkeleton } from "@/components/skeletons";
import { BACH_THOAI_PHAT_PHAP_SLUG } from "@/constants";
import { ContentType } from "@/enums";
import { trackSearch } from "@/lib/gtm";
import { formatTime, stripHtml } from "@/lib/utils";

const PAGE_SIZE = 8;

type FilterTab = "ALL" | "PHAP_THOAI" | "BAI_GIANG" | "AUDIO" | "VAN_BAN";

export const BachThoaiClient: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);

  const currentCursor = cursorHistory[page - 1] || null;

  // Query posts by category_name = BACH_THOAI_PHAT_PHAP_SLUG with pagination
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetPostsByCategory({
      category_name: BACH_THOAI_PHAT_PHAP_SLUG,
      limit: PAGE_SIZE,
      ...(currentCursor ? { cursor: currentCursor } : {}),
      page,
    });

  const rawPosts: PostItemType[] = data?.data || [];
  const meta = data?.meta;

  // Transform API posts to display item format
  const displayItems = useMemo<BachThoaiDisplayItem[]>(() => {
    return rawPosts.map((post) => {
      let durationText = "--:--";
      if (post.audio?.duration && post.audio.duration > 0) {
        durationText = formatTime(post.audio.duration);
      } else if (post.video?.duration && post.video.duration > 0) {
        durationText = formatTime(post.video.duration);
      }

      const snippet = post.content
        ? stripHtml(post.content).slice(0, 80)
        : undefined;

      return {
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        authorName: post.author?.name || "Bạch thoại Phật pháp",
        durationText,
        thumbnailUrl: post.thumbnailUrl || "/images/lotus-thumb.jpg",
        type:
          post.type ||
          (post.audio?.audioUrl ? ContentType.AUDIO : ContentType.NORMAL),
        audioUrl: post.audio?.audioUrl,
        snippet,
      };
    });
  }, [rawPosts]);

  // Filter items by search keyword and tab
  const filteredItems = useMemo(() => {
    return displayItems.filter((item) => {
      // 1. Search keyword
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchAuthor = item.authorName.toLowerCase().includes(query);
        if (!matchTitle && !matchAuthor) return false;
      }

      // 2. Tab filter
      if (activeFilter === "ALL") return true;
      if (activeFilter === "AUDIO")
        return item.type === ContentType.AUDIO || !!item.audioUrl;
      if (activeFilter === "VAN_BAN")
        return item.type === ContentType.NORMAL;
      if (activeFilter === "PHAP_THOAI") {
        return item.title.toLowerCase().includes("pháp thoại");
      }
      if (activeFilter === "BAI_GIANG") {
        return item.title.toLowerCase().includes("bài giảng");
      }
      return true;
    });
  }, [displayItems, activeFilter, searchQuery]);

  // Debounced search tracking for GTM & GA4
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timeoutId = setTimeout(() => {
      trackSearch({
        searchTerm: searchQuery,
        searchLocation: "bach_thoai_phat_phap",
        resultsCount: filteredItems.length,
      });
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filteredItems.length]);

  // Pagination calculations
  const totalPosts = meta?.total ?? rawPosts.length;
  const totalPages =
    meta?.totalPages ?? (meta?.total ? Math.ceil(meta.total / PAGE_SIZE) : 1);

  const hasNextPage = Boolean(
    meta?.hasNextPage ||
      meta?.nextCursor ||
      (meta?.total && page < totalPages)
  );
  const hasPrevPage = page > 1;

  const handleNextPage = () => {
    if (!hasNextPage) return;
    const nextCursor = meta?.nextCursor || null;
    setCursorHistory((prev) => {
      const updated = [...prev];
      updated[page] = nextCursor;
      return updated;
    });
    setPage((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (!hasPrevPage) return;
    setPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToPage = (targetPage: number) => {
    if (targetPage === page) return;
    if (targetPage === 1) {
      setPage(1);
      setCursorHistory([null]);
    } else {
      setPage(targetPage);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout activeId="bach-thoai" className="space-y-6">
      <div className="space-y-6 sm:space-y-8 pb-12">
        {/* 1. Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-neutral-500 font-medium"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-colors hover:text-amber-800"
          >
            <Home className="h-3.5 w-3.5 text-neutral-400" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-amber-900 font-semibold">
            Bạch thoại Phật pháp
          </span>
        </nav>

        {/* 2. Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-900/10 shadow-sm">
          <div className="relative h-48 sm:h-60 w-full">
            <Image
              src="/images/home-hero-banner.jpg"
              alt="Bạch thoại Phật pháp"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-black/35 px-3 py-1 text-xs font-semibold text-amber-200 backdrop-blur-md mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Pháp âm mầu nhiệm</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide drop-shadow-md"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Bạch Thoại Phật Pháp
            </h1>
            <p className="mt-2 max-w-xl text-xs sm:text-sm font-medium text-amber-100/90 drop-shadow-sm">
              Dành cho những người mới bắt đầu tu tập và tìm hiểu chánh pháp,
              chuyển hóa tâm thức và soi sáng con đường an lạc.
            </p>
          </div>
        </div>

        {/* 3. Search Bar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs sm:text-sm">
            <button
              type="button"
              data-track-click="bach_thoai_filter_all"
              data-track-category="bach_thoai_filter"
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-xl px-3.5 py-2 font-semibold transition shrink-0 cursor-pointer ${
                activeFilter === "ALL"
                  ? "bg-[#B86E0E] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-neutral-600 border border-[#EDE5D8]"
              }`}
            >
              Tất cả
            </button>

            <button
              type="button"
              data-track-click="bach_thoai_filter_phap_thoai"
              data-track-category="bach_thoai_filter"
              onClick={() => setActiveFilter("PHAP_THOAI")}
              className={`rounded-xl px-3.5 py-2 font-semibold transition shrink-0 cursor-pointer ${
                activeFilter === "PHAP_THOAI"
                  ? "bg-[#B86E0E] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-neutral-600 border border-[#EDE5D8]"
              }`}
            >
              Pháp thoại
            </button>

            <button
              type="button"
              data-track-click="bach_thoai_filter_bai_giang"
              data-track-category="bach_thoai_filter"
              onClick={() => setActiveFilter("BAI_GIANG")}
              className={`rounded-xl px-3.5 py-2 font-semibold transition shrink-0 cursor-pointer ${
                activeFilter === "BAI_GIANG"
                  ? "bg-[#B86E0E] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-neutral-600 border border-[#EDE5D8]"
              }`}
            >
              Bài giảng
            </button>

            <button
              type="button"
              data-track-click="bach_thoai_filter_audio"
              data-track-category="bach_thoai_filter"
              onClick={() => setActiveFilter("AUDIO")}
              className={`rounded-xl px-3.5 py-2 font-semibold transition shrink-0 cursor-pointer ${
                activeFilter === "AUDIO"
                  ? "bg-[#B86E0E] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-neutral-600 border border-[#EDE5D8]"
              }`}
            >
              Audio
            </button>

            <button
              type="button"
              data-track-click="bach_thoai_filter_van_ban"
              data-track-category="bach_thoai_filter"
              onClick={() => setActiveFilter("VAN_BAN")}
              className={`rounded-xl px-3.5 py-2 font-semibold transition shrink-0 cursor-pointer ${
                activeFilter === "VAN_BAN"
                  ? "bg-[#B86E0E] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-neutral-600 border border-[#EDE5D8]"
              }`}
            >
              Văn bản
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài giảng..."
              className="w-full rounded-2xl border border-amber-200/80 bg-white/90 py-2 pl-10 pr-9 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 shadow-2xs outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                data-track-click="bach_thoai_clear_search"
                data-track-category="bach_thoai_search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4. List Status Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium text-neutral-600">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            <span>
              {isLoading
                ? "Đang tải danh sách..."
                : `Hiển thị ${filteredItems.length} bài viết`}
            </span>
            {meta?.total ? (
              <span className="text-neutral-400">
                • Tổng cộng {meta.total} bài
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Đang đồng bộ...</span>
              </span>
            )}
            <span className="rounded-full bg-white px-3 py-1 font-semibold text-neutral-700 shadow-2xs border border-neutral-200/60">
              Trang {page} {totalPages > 1 ? `/ ${totalPages}` : ""}
            </span>
          </div>
        </div>

        {/* 5. Content Grid */}
        {isLoading ? (
          <BachThoaiSkeleton count={PAGE_SIZE} />
        ) : isError ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200/80 bg-rose-50/50 p-8 sm:p-12 text-center shadow-2xs">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Không thể tải danh sách bài viết
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600 max-w-md">
              {(error as Error)?.message ||
                "Đã có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại sau."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-amber-900 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE5D8] bg-white/70 p-12 text-center shadow-2xs">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/60">
              <Sparkles className="h-7 w-7 text-amber-700" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              {searchQuery
                ? "Không tìm thấy bài viết phù hợp"
                : "Chưa có bài viết Bạch thoại Phật pháp nào"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-sm">
              {searchQuery
                ? `Không có kết quả nào cho "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
                : "Các bài giảng sẽ sớm được cập nhật. Kính mong quý Phật tử hoan hỷ đón đọc."}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 cursor-pointer"
              >
                <span>Xóa bộ lọc tìm kiếm</span>
              </button>
            ) : (
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-900 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Quay về trang chủ</span>
              </Link>
            )}
          </div>
        ) : (
          /* Responsive 2-Column Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredItems.map((item) => (
              <BachThoaiItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* 6. Pagination Controls */}
        {!isLoading && !isError && rawPosts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE5D8]">
            <div className="text-xs text-neutral-500 order-2 sm:order-1">
              {meta?.total ? (
                <span>
                  Đang hiển thị trang <strong>{page}</strong> trên tổng số{" "}
                  <strong>{totalPages}</strong> trang ({meta.total} bài viết)
                </span>
              ) : (
                <span>
                  Trang <strong>{page}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              {/* Prev Button */}
              <button
                onClick={handlePrevPage}
                disabled={!hasPrevPage || isFetching}
                className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-semibold transition shadow-2xs ${
                  hasPrevPage && !isFetching
                    ? "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-amber-300 cursor-pointer"
                    : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60"
                }`}
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Trang trước</span>
              </button>

              {/* Page Numbers */}
              {totalPages > 1 && (
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map(
                    (_, index) => {
                      const pageNum = index + 1;
                      const isActive = pageNum === page;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleGoToPage(pageNum)}
                          disabled={isFetching}
                          className={`h-8 w-8 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isActive
                              ? "bg-amber-800 text-white shadow-xs"
                              : "bg-white text-neutral-700 border border-neutral-200/80 hover:bg-amber-50 hover:text-amber-900"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                  {totalPages > 5 && (
                    <span className="px-1 text-xs text-neutral-400">...</span>
                  )}
                </div>
              )}

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage || isFetching}
                className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-semibold transition shadow-2xs ${
                  hasNextPage && !isFetching
                    ? "border-amber-700 bg-amber-800 text-white hover:bg-amber-900 cursor-pointer"
                    : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60"
                }`}
                aria-label="Trang sau"
              >
                <span>Trang sau</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
