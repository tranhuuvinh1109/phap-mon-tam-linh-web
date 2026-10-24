"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useGetPostsByCategory, useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { KhaiThiItem } from "@/components/home";
import { MainLayout } from "@/components/layout";
import { KhaiThiSkeleton } from "@/components/skeletons";
import { KHAI_THI_SLUG } from "@/constants";
import { trackSearch } from "@/lib/gtm";

const PAGE_SIZE = 9;

export const KhaiThiClient: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearch);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);

  // Sync state if URL changes externally
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
      setCursorHistory([null]);

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

  // Current cursor corresponding to the active page
  const currentCursor = cursorHistory[page - 1] || null;

  // 1. Regular category query (when not searching)
  const categoryQuery = useGetPostsByCategory(
    {
      category_name: KHAI_THI_SLUG,
      limit: PAGE_SIZE,
      ...(currentCursor ? { cursor: currentCursor } : {}),
      page,
    },
    { enabled: !isSearching }
  );

  // 2. Search query within Khai Thi category (when searching)
  const searchQueryHook = useSearchPosts(
    {
      category: KHAI_THI_SLUG,
      search: debouncedSearch,
      limit: PAGE_SIZE,
      page,
    },
    { enabled: isSearching }
  );

  const activeQuery = isSearching ? searchQueryHook : categoryQuery;
  const { isLoading, isError, error, refetch, isFetching } = activeQuery;
  const posts: PostItemType[] = activeQuery.data?.data || [];
  const meta = activeQuery.data?.meta;

  // Debounced search tracking for GTM & GA4
  useEffect(() => {
    if (!debouncedSearch) return;
    trackSearch({
      searchTerm: debouncedSearch,
      searchLocation: "khai_thi",
      resultsCount: posts.length,
    });
  }, [debouncedSearch, posts.length]);

  // Pagination calculations
  const totalPosts = meta?.total ?? posts.length;
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
    if (!isSearching) {
      const nextCursor = meta?.nextCursor || null;
      setCursorHistory((prev) => {
        const updated = [...prev];
        updated[page] = nextCursor;
        return updated;
      });
    }
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

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
    setCursorHistory([null]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <MainLayout activeId="khai-thi">
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
          <span className="text-amber-900 font-semibold">Khai thị</span>
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
                <span>Lời vàng Phật pháp</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Khai Thị Phật Pháp
              </h1>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Tổng hợp những lời khai thị từ bi và sâu sắc, giúp mở mang trí tuệ,
                chuyển hóa tâm thức và vững bước trên con đường tu học an lạc.
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
                  placeholder="Tìm kiếm bài khai thị..."
                  className="w-full rounded-2xl border border-amber-200/80 bg-white/90 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 shadow-2xs outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200/60"
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
                ? "Đang tải danh sách..."
                : `Hiển thị ${posts.length} bài viết`}
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

        {/* 4. Posts Grid Content */}
        {isLoading ? (
          <KhaiThiSkeleton count={PAGE_SIZE} />
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
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE5D8] bg-white/70 p-12 text-center shadow-2xs">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/60">
              <Sparkles className="h-7 w-7 text-amber-700" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              {debouncedSearch
                ? "Không tìm thấy bài viết phù hợp"
                : "Chưa có bài viết khai thị nào"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-sm">
              {debouncedSearch
                ? `Không có kết quả nào cho "${debouncedSearch}". Hãy thử tìm kiếm với từ khóa khác.`
                : "Các bài khai thị sẽ sớm được cập nhật. Kính mong quý Phật tử hoan hỷ đón đọc."}
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
          /* Post Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <KhaiThiItem key={post.id || post.slug} post={post} />
            ))}
          </div>
        )}

        {/* 5. Pagination Controls */}
        {!isLoading && !isError && posts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE5D8]">
            {/* Total summary */}
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

            {/* Pagination Actions */}
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
                          className={`h-8 w-8 rounded-xl text-xs font-semibold transition ${
                            isActive
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
