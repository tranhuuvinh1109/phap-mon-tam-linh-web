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
  Tag,
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
import { DEFAULT_POST_THUMBNAIL } from "@/constants";
import { ContentType } from "@/enums";
import { trackSearch } from "@/lib/gtm";
import { HighlightedText } from "@/lib/highlight";
import { formatTime } from "@/lib/utils";

const PAGE_SIZE = 15;

export interface CategoryPostListViewProps {
  /** Optional UUID of the category (to query by category_id directly) */
  categoryId?: string;
  /** Slug of the category (e.g. 'thap-huong-ban-tho-phat' or 'ngoi-nha-nho') */
  categorySlug: string;
  /** Human-readable title of the category (e.g. 'Thắp hương bàn thờ Phật' or 'Ngôi Nhà Nhỏ') */
  categoryTitle: string;
  /** Subtitle / Description displayed on the hero header */
  categoryDescription?: string;
  /** Badge text shown in hero banner (e.g. 'Nghi Thức Trang Nghiêm' or 'Pháp Bảo Tu Tập') */
  heroBadgeLabel?: string;
  /** Base URL for detail routing (e.g. '/thap-huong-ban-tho-phat' or '/ngoi-nha-nho') */
  basePostUrl: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Navigation item ID for the active sidebar tab */
  activeNavId?: string;
}

export const CategoryPostListView: React.FC<CategoryPostListViewProps> = ({
  categoryId,
  categorySlug,
  categoryTitle,
  categoryDescription,
  heroBadgeLabel = "Pháp Bảo Tu Tập",
  basePostUrl,
  searchPlaceholder,
  activeNavId = "practice",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearch);

  // Sync state if URL search query changes externally
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
      ...(categoryId ? { category_id: categoryId } : { category_name: categorySlug }),
      limit: 100,
    },
    { enabled: !isSearching }
  );

  // 2. Search query within category (when searching)
  const searchPostsQuery = useSearchPosts(
    {
      category: categorySlug,
      search: debouncedSearch,
      limit: 100,
    },
    { enabled: isSearching }
  );

  const activeQuery = isSearching ? searchPostsQuery : categoryPostsQuery;
  const { isLoading, isError, error, refetch, isFetching } = activeQuery;
  const rawPosts: PostItemType[] = activeQuery.data?.data || [];

  // Sort by createdAt ascending (tăng dần: cũ -> mới nhất)
  const sortedPosts = useMemo(() => {
    const list = [...rawPosts];
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
      searchLocation: categorySlug,
      resultsCount: sortedPosts.length,
    });
  }, [debouncedSearch, sortedPosts.length, categorySlug]);

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
    <MainLayout activeId={activeNavId}>
      <div className="space-y-6 sm:space-y-8 pb-12">
        {/* 1. Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-neutral-500 font-medium flex-wrap"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-colors hover:text-amber-800"
          >
            <Home className="h-3.5 w-3.5 text-neutral-400" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-amber-900 font-semibold">{categoryTitle}</span>
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
                <span>{heroBadgeLabel}</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {categoryTitle}
              </h1>

              {categoryDescription && (
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {categoryDescription}
                </p>
              )}
            </div>

            {/* Quick Search Bar */}
            <div className="w-full md:w-80 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder || `Tìm kiếm bài viết ${categoryTitle}...`}
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

        {/* 4. Modern Post Cards List */}
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
                : `Chưa có bài viết ${categoryTitle} nào`}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-sm">
              {debouncedSearch
                ? `Không có kết quả nào cho "${debouncedSearch}". Hãy thử tìm kiếm với từ khóa khác.`
                : `Các bài viết về ${categoryTitle} sẽ sớm được cập nhật. Kính mong quý Phật tử hoan hỷ đón đọc.`}
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
          /* Modern List View */
          <div className="flex flex-col space-y-3.5 sm:space-y-4">
            {paginatedPosts.map((post, index) => {
              const itemIndex = (page - 1) * PAGE_SIZE + index + 1;
              const postSlug = encodeURIComponent(post.slug || post.id || "");
              const targetUrl = `${basePostUrl}/${postSlug}`;
              const postUrl = debouncedSearch.trim()
                ? `${targetUrl}?search=${encodeURIComponent(debouncedSearch.trim())}`
                : targetUrl;

              const displayDate = post.updatedAt || post.createdAt;
              const formattedDate = displayDate
                ? new Date(displayDate).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : null;

              const thumbnailSrc = post.thumbnailUrl || DEFAULT_POST_THUMBNAIL;

              return (
                <Link
                  key={post.id || post.slug || index}
                  href={postUrl}
                  className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-4 sm:p-5 shadow-2xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md hover:bg-white cursor-pointer"
                >
                  {/* Left Side: Number Badge + Thumbnail + Details */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                    {/* Index Number Badge */}
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#F5ECE0] text-amber-900 border border-amber-200/90 font-bold text-xs sm:text-sm group-hover:bg-amber-800 group-hover:text-white group-hover:border-amber-700 transition-colors shadow-2xs">
                      <span>{itemIndex}</span>
                    </div>

                    {/* Modern Thumbnail Image */}
                    <div className="relative w-28 h-20 sm:w-36 sm:h-24 md:w-44 md:h-28 shrink-0 overflow-hidden rounded-2xl border border-amber-900/10 bg-amber-50 shadow-2xs">
                      <img
                        src={thumbnailSrc}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_POST_THUMBNAIL;
                        }}
                      />
                    </div>

                    {/* Post Content Details */}
                    <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                      {/* Meta badges: Category, Group, Type, Date */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Category Badge */}
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-300/80 shadow-2xs">
                          <Tag className="h-2.5 w-2.5 text-amber-700" />
                          <span>{post.category?.name || categoryTitle}</span>
                        </span>

                        {/* Group Badge (if available) */}
                        {post.group?.name && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200/70">
                            <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                            <span>{post.group.name}</span>
                          </span>
                        )}

                        {/* Content Type Badge */}
                        {post.type === ContentType.AUDIO ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 border border-sky-200/70">
                            <Volume2 className="h-2.5 w-2.5 text-sky-600" />
                            <span>Audio</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200/70">
                            <BookOpen className="h-2.5 w-2.5 text-emerald-600" />
                            <span>Bài viết</span>
                          </span>
                        )}

                        {/* Published Date */}
                        {formattedDate && (
                          <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-neutral-400" />
                            <span>{formattedDate}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-neutral-900 leading-snug group-hover:text-amber-800 transition-colors line-clamp-2">
                        <HighlightedText text={post.title} highlight={debouncedSearch} />
                      </h3>

                      {/* Author & Audio Meta */}
                      <div className="flex items-center gap-3 pt-0.5 text-xs text-neutral-400">
                        <span className="flex items-center gap-1 text-neutral-500 font-medium truncate">
                          <User className="h-3 w-3 text-neutral-400" />
                          <span>{post.author?.name || "Ban biên tập Phật Pháp"}</span>
                        </span>

                        {post.audio?.duration && post.audio.duration > 0 && (
                          <span className="flex items-center gap-1 text-amber-700 font-medium">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span>{formatTime(post.audio.duration)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: CTA Button */}
                  <div className="flex items-center justify-end sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-1.5 text-xs font-semibold text-amber-800 shadow-2xs group-hover:bg-amber-800 group-hover:text-white group-hover:border-amber-800 transition-all">
                      <span>Đọc bài</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
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
            <div className="text-xs text-neutral-500 order-2 sm:order-1">
              Trang <span className="font-bold text-neutral-800">{page}</span> trên tổng số{" "}
              <span className="font-bold text-neutral-800">{totalPages}</span> trang
            </div>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                aria-label="Trang trước"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-semibold transition ${
                  hasPrevPage
                    ? "border-neutral-200 bg-white text-neutral-700 shadow-2xs hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 cursor-pointer"
                    : "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Numbered Page Buttons with smart ellipsis */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                const isCurrent = pageNumber === page;
                const isNearCurrent = Math.abs(pageNumber - page) <= 1;
                const isEdge = pageNumber === 1 || pageNumber === totalPages;

                if (!isNearCurrent && !isEdge) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return (
                      <span
                        key={pageNumber}
                        className="px-1 text-xs text-neutral-400 select-none"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handleGoToPage(pageNumber)}
                    className={`inline-flex h-9 min-w-9 px-2 items-center justify-center rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isCurrent
                        ? "bg-amber-800 text-white shadow-xs"
                        : "border border-neutral-200 bg-white text-neutral-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNextPage}
                disabled={!hasNextPage}
                aria-label="Trang sau"
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-semibold transition ${
                  hasNextPage
                    ? "border-neutral-200 bg-white text-neutral-700 shadow-2xs hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 cursor-pointer"
                    : "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

