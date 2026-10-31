"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Volume2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetPostsByCategory, useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { MainLayout } from "@/components/layout";
import { NgoiNhaNhoSkeleton } from "@/components/skeletons";
import { NGOI_NHA_NHO_SLUG } from "@/constants";
import { ContentType } from "@/enums";
import { trackSearch } from "@/lib/gtm";
import { HighlightedText } from "@/lib/highlight";
import { formatTime } from "@/lib/utils";

const PAGE_SIZE = 15;

export const NgoiNhaNhoClient: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearch);

  // Keep state synced if URL changes externally
  useEffect(() => {
    setSearchQuery(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  // Debounced search query & URL parameter update
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedSearch(trimmed);
      setPage(1);

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("search", trimmed);
        params.delete("q");
      } else {
        params.delete("search");
        params.delete("q");
      }
      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  const isSearching = Boolean(debouncedSearch);

  // 1. Regular category query (when not searching)
  const categoryPostsQuery = useGetPostsByCategory(
    {
      category_name: NGOI_NHA_NHO_SLUG,
      limit: 100,
    },
    { enabled: !isSearching }
  );

  // 2. Search query within Ngoi Nha Nho category (when searching)
  const searchPostsQuery = useSearchPosts(
    {
      category: NGOI_NHA_NHO_SLUG,
      search: debouncedSearch,
      limit: 100,
    },
    { enabled: isSearching }
  );

  const activeQuery = isSearching ? searchPostsQuery : categoryPostsQuery;
  const { isLoading, isError, error, refetch, isFetching } = activeQuery;
  const rawPosts: PostItemType[] = activeQuery.data?.data || [];

  // Sort by updatedAt ascending (tăng dần: cũ -> mới nhất)
  const sortedPosts = useMemo(() => {
    let list = [...rawPosts];

    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [rawPosts]);

  // Debounced search tracking for GTM & GA4
  useEffect(() => {
    if (!debouncedSearch) return;
    trackSearch({
      searchTerm: debouncedSearch,
      searchLocation: "ngoi_nha_nho",
      resultsCount: sortedPosts.length,
    });
  }, [debouncedSearch, sortedPosts.length]);

  // Pagination calculations based on sorted posts
  const totalPosts = sortedPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Sliced posts for current page view
  const paginatedPosts = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return sortedPosts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedPosts, page]);

  const handleNextPage = () => {
    if (!hasNextPage) return;
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
    setPage(targetPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout activeId="ngoi-nha-nho">
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
          <span className="text-amber-900 font-semibold">Ngôi Nhà Nhỏ</span>
        </nav>

        {/* 2. Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EDE3D2] bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EB] to-[#F5ECE0] p-6 sm:p-8 shadow-xs">
          {/* Subtle background glow effect */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-900 shadow-2xs backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                <span>Pháp Bảo Tu Tập</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Ngôi Nhà Nhỏ
              </h1>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Tổng hợp các bài viết hướng dẫn chi tiết về Ngôi Nhà Nhỏ — phương pháp
                thù thắng giúp tiêu trừ nghiệp chướng, hóa giải oan kết và tích lũy công đức
                trên con đường tu tập an lành.
              </p>
            </div>

            {/* Quick Search Bar */}
            <div className="w-full md:w-80 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết Ngôi Nhà Nhỏ..."
                  className="w-full rounded-2xl border border-amber-200/80 bg-white/90 py-2.5 pl-10 pr-9 text-base sm:text-sm text-neutral-800 placeholder-neutral-400 shadow-2xs outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200/60"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. List Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium text-neutral-600">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            <span>
              {isLoading
                ? "Đang tải danh sách bài viết..."
                : `Hiển thị ${paginatedPosts.length} bài viết`}
            </span>
            {totalPosts > 0 ? (
              <span className="text-neutral-400">
                • Tổng cộng {totalPosts} bài
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

        {/* 4. Vertical Ordered List Content (1. 2. 3. 4. list theo chiều dọc) */}
        {isLoading ? (
          <NgoiNhaNhoSkeleton count={PAGE_SIZE} />
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
        ) : sortedPosts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE5D8] bg-white/70 p-12 text-center shadow-2xs">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/60">
              <Sparkles className="h-7 w-7 text-amber-700" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              {debouncedSearch
                ? "Không tìm thấy bài viết phù hợp"
                : "Chưa có bài viết Ngôi Nhà Nhỏ nào"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-sm">
              {debouncedSearch
                ? `Không có kết quả nào cho "${debouncedSearch}". Hãy thử tìm kiếm với từ khóa khác.`
                : "Các bài viết về Ngôi Nhà Nhỏ sẽ sớm được cập nhật. Kính mong quý Phật tử hoan hỷ đón đọc."}
            </p>
            {debouncedSearch ? (
              <button
                onClick={handleClearSearch}
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
          /* Vertical Numbered List: 1. 2. 3. 4. ... */
          <div className="flex flex-col space-y-3.5">
            {paginatedPosts.map((post, index) => {
              const itemIndex = (page - 1) * PAGE_SIZE + index + 1;
              const postSlug = encodeURIComponent(post.slug || post.id || "");
              const basePostUrl = `/ngoi-nha-nho/${postSlug}`;
              const postUrl = debouncedSearch.trim()
                ? `${basePostUrl}?search=${encodeURIComponent(debouncedSearch.trim())}`
                : basePostUrl;

              const displayDate = post.updatedAt || post.createdAt;
              const formattedDate = displayDate
                ? new Date(displayDate).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                : null;

              return (
                <Link
                  key={post.id || post.slug || index}
                  href={postUrl}
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#EDE5D8]/90 bg-white/95 p-4 sm:p-5 shadow-2xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md hover:bg-white cursor-pointer"
                >
                  {/* Left Side: Number 1. 2. 3. 4. and Content */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0 w-full">
                    {/* 1. 2. 3. 4. Number Badge */}
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#F5ECE0] text-amber-900 border border-amber-200/90 font-bold text-sm sm:text-base group-hover:bg-amber-800 group-hover:text-white group-hover:border-amber-700 transition-colors shadow-2xs">
                      <span>{itemIndex}.</span>
                    </div>

                    {/* Post Content Details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Meta badges: Group, Type, Date */}
                      <div className="flex flex-wrap items-center gap-2">
                        {post.group?.name && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200/70">
                            <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                            <span>{post.group.name}</span>
                          </span>
                        )}

                        {post.type === ContentType.AUDIO && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 border border-sky-200/70">
                            <Volume2 className="h-2.5 w-2.5" />
                            <span>Audio</span>
                          </span>
                        )}

                        {formattedDate && (
                          <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-neutral-400" />
                            <span>{formattedDate}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug group-hover:text-amber-800 transition-colors line-clamp-2">
                        <HighlightedText text={post.title} highlight={debouncedSearch} />
                      </h3>

                      {/* Author & Audio Meta */}
                      <div className="flex items-center gap-3 pt-0.5 text-xs text-neutral-400">
                        <span className="flex items-center gap-1 text-neutral-500 font-medium truncate">
                          <User className="h-3 w-3 text-neutral-400" />
                          <span>{post.author?.name || "Ngôi Nhà Nhỏ"}</span>
                        </span>

                        {post.audio?.duration && post.audio.duration > 0 && (
                          <span className="flex items-center gap-1 text-neutral-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(post.audio.duration)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Optional Thumbnail & Action Button */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-end sm:self-center">
                    {post.thumbnailUrl && (
                      <div className="hidden md:block h-16 w-22 sm:h-18 sm:w-26 shrink-0 overflow-hidden rounded-xl border border-amber-900/10 bg-amber-50">
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 group-hover:text-amber-900 group-hover:translate-x-0.5 transition-all">
                      <span>Đọc bài</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 5. Pagination Controls */}
        {!isLoading && !isError && sortedPosts.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE5D8]">
            {/* Total summary */}
            <div className="text-xs text-neutral-500 order-2 sm:order-1">
              <span>
                Đang hiển thị trang <strong>{page}</strong> trên tổng số{" "}
                <strong>{totalPages}</strong> trang ({totalPosts} bài viết)
              </span>
            </div>

            {/* Pagination Actions */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              {/* Prev Button */}
              <button
                onClick={handlePrevPage}
                disabled={!hasPrevPage || isFetching}
                className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-semibold transition shadow-2xs ${hasPrevPage && !isFetching
                    ? "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-amber-300 cursor-pointer"
                    : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60"
                  }`}
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Trang trước</span>
              </button>

              {/* Page Number Indicators */}
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
                          className={`h-8 w-8 rounded-xl text-xs font-semibold transition ${isActive
                              ? "bg-amber-800 text-white shadow-xs"
                              : "bg-white text-neutral-700 border border-neutral-200/80 hover:bg-amber-50 hover:text-amber-900 cursor-pointer"
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
                className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-semibold transition shadow-2xs ${hasNextPage && !isFetching
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
