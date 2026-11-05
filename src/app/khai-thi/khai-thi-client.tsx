"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Home,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetCategories, useGetCategoryTree } from "@/api/category";
import type { CategoryItemType } from "@/api/category/category.type";
import { useGetPostsByCategory, useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { KhaiThiItem } from "@/components/home";
import { MainLayout } from "@/components/layout";
import { KhaiThiSkeleton } from "@/components/skeletons";
import { KHAI_THI_SLUG } from "@/constants";
import { getCategoryBadgeStyle } from "@/lib/color-badge";
import { trackSearch } from "@/lib/gtm";
import { slugify } from "@/lib/utils";

const PAGE_SIZE = 12;

export const KhaiThiClient: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL query params as single source of truth
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
  const urlCategoryParam =
    searchParams.get("category") ||
    searchParams.get("subCategory") ||
    searchParams.get("categoryId") ||
    searchParams.get("group") ||
    "ALL";

  const currentPage = useMemo(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  // Local state for search input debounce
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearch);

  // Fetch category tree and categories list
  const { data: categoryTree = [] } = useGetCategoryTree();
  const { data: categories = [] } = useGetCategories();

  // Find the root/parent "Khai thị" category
  const khaiThiParent = useMemo(() => {
    const fromTree = categoryTree.find(
      (c) =>
        c.slug === KHAI_THI_SLUG ||
        c.slug === "khai-thi" ||
        c.name.toLowerCase().includes("khai thị") ||
        c.name.toLowerCase().includes("khai thi")
    );
    if (fromTree) return fromTree;

    return (
      categories.find(
        (c) =>
          !c.parentId &&
          (c.slug === KHAI_THI_SLUG ||
            c.slug === "khai-thi" ||
            c.name.toLowerCase().includes("khai thị") ||
            c.name.toLowerCase().includes("khai thi"))
      ) || null
    );
  }, [categoryTree, categories]);

  // Extract child categories whose parent is "Khai thị"
  const childCategories = useMemo<CategoryItemType[]>(() => {
    const list: CategoryItemType[] = [];
    const seen = new Set<string>();

    if (khaiThiParent?.children && Array.isArray(khaiThiParent.children)) {
      khaiThiParent.children.forEach((c) => {
        if (!c.deletedAt && !seen.has(c.id)) {
          seen.add(c.id);
          list.push(c);
        }
      });
    }

    if (khaiThiParent?.id) {
      categories.forEach((c) => {
        if (!c.deletedAt && c.parentId === khaiThiParent.id && !seen.has(c.id)) {
          seen.add(c.id);
          list.push(c);
        }
      });
    }

    return list;
  }, [khaiThiParent, categories]);

  // Resolve matching child category from URL parameter (slug or UUID)
  const selectedCategoryObj = useMemo(() => {
    if (!urlCategoryParam || urlCategoryParam === "ALL") return null;
    const target = urlCategoryParam.toLowerCase().trim();

    return (
      childCategories.find((cat) => {
        if (cat.id === urlCategoryParam) return true;
        if (cat.slug && cat.slug.toLowerCase().trim() === target) return true;
        if (slugify(cat.name).toLowerCase() === target) return true;
        return false;
      }) || null
    );
  }, [urlCategoryParam, childCategories]);

  const selectedCategoryName = selectedCategoryObj?.name || null;

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchQuery(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  /**
   * Updates URL query parameters cleanly and keeps history consistent
   */
  const updateUrlParams = (updates: {
    page?: number;
    categorySlug?: string | null;
    search?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update search query
    if (updates.search !== undefined) {
      if (updates.search && updates.search.trim()) {
        params.set("search", updates.search.trim());
        params.delete("q");
      } else {
        params.delete("search");
        params.delete("q");
      }
    }

    // Update category slug
    if (updates.categorySlug !== undefined) {
      if (updates.categorySlug && updates.categorySlug !== "ALL") {
        params.set("category", updates.categorySlug);
      } else {
        params.delete("category");
      }
      params.delete("subCategory");
      params.delete("categoryId");
      params.delete("group");
      params.delete("groupId");
    }

    // Update page
    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set("page", String(updates.page));
      } else {
        params.delete("page");
      }
    }

    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  // Debounced search sync to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedSearch(trimmed);
      if (trimmed !== urlSearch) {
        updateUrlParams({ search: trimmed, page: 1 });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, urlSearch]);

  const isSearching = Boolean(debouncedSearch);

  // Target category for API:
  // If user selected a child category, use its slug/id.
  // Otherwise, use KHAI_THI_SLUG to fetch all posts in Khai Thị.
  const targetCategory = selectedCategoryObj
    ? selectedCategoryObj.slug || selectedCategoryObj.id
    : KHAI_THI_SLUG;

  // 1. Regular category query (when not searching) with offset pagination
  const categoryQuery = useGetPostsByCategory(
    {
      category_name: targetCategory,
      limit: PAGE_SIZE,
      page: currentPage,
    },
    { enabled: !isSearching }
  );

  // 2. Search query within target category (when searching) with offset pagination
  const searchQueryHook = useSearchPosts(
    {
      category: targetCategory,
      search: debouncedSearch,
      limit: PAGE_SIZE,
      page: currentPage,
    },
    { enabled: isSearching }
  );

  const activeQuery = isSearching ? searchQueryHook : categoryQuery;
  const { isLoading, isError, error, refetch, isFetching } = activeQuery;
  const posts: PostItemType[] = activeQuery.data?.data || [];
  const meta = activeQuery.data?.meta;

  // Group items by category name for sectioned view when viewing ALL child categories
  const groupedPosts = useMemo(() => {
    const map = new Map<string, PostItemType[]>();
    for (const post of posts) {
      const key = post.category?.name || "Khai thị";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(post);
    }
    return Array.from(map.entries());
  }, [posts]);

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
  const totalPages =
    meta?.totalPages ?? (meta?.total ? Math.ceil(meta.total / PAGE_SIZE) : 1);

  const hasNextPage = Boolean(
    meta?.hasNextPage || (meta?.total && currentPage < totalPages)
  );
  const hasPrevPage = currentPage > 1;

  const handleSelectCategory = (targetCategorySlug: string) => {
    updateUrlParams({ categorySlug: targetCategorySlug, page: 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    if (!hasNextPage) return;
    updateUrlParams({ page: currentPage + 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (!hasPrevPage) return;
    updateUrlParams({ page: Math.max(1, currentPage - 1) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToPage = (targetPage: number) => {
    if (targetPage === currentPage) return;
    updateUrlParams({ page: targetPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    updateUrlParams({ search: "", page: 1 });
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

        {/* 3. Category Filter Pills */}
        <div className="rounded-2xl border border-amber-900/10 bg-white/80 p-3.5 sm:p-4 backdrop-blur-xs shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-800">
              <Layers className="h-4 w-4 text-amber-700" />
              <span>Chuyên mục Khai Thị:</span>
            </div>
            {selectedCategoryObj && (
              <button
                type="button"
                onClick={() => handleSelectCategory("ALL")}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                Xem tất cả danh mục
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => handleSelectCategory("ALL")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition shrink-0 cursor-pointer ${
                !selectedCategoryObj
                  ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-xs"
                  : "bg-white hover:bg-amber-50/60 text-neutral-700 border border-neutral-200/80 hover:border-amber-300"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tất cả</span>
            </button>

            {childCategories.map((cat) => {
              const catSlug = cat.slug || cat.id;
              const isSelected =
                selectedCategoryObj?.id === cat.id ||
                selectedCategoryObj?.slug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(catSlug)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-xs"
                      : "bg-white hover:bg-amber-50/60 text-neutral-700 border border-neutral-200/80 hover:border-amber-300"
                  }`}
                >
                  <FolderTree className="h-3.5 w-3.5 opacity-70" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. List Header Info */}
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
              Trang {currentPage} {totalPages > 1 ? `/ ${totalPages}` : ""}
            </span>
          </div>
        </div>

        {/* 5. Posts Grid Content */}
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
              {debouncedSearch || selectedCategoryObj
                ? "Không tìm thấy bài viết phù hợp"
                : "Chưa có bài viết khai thị nào"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-sm">
              {debouncedSearch
                ? `Không có kết quả nào cho "${debouncedSearch}". Hãy thử tìm kiếm với từ khóa khác.`
                : selectedCategoryObj
                ? `Chưa có bài viết nào thuộc danh mục "${selectedCategoryName}".`
                : "Các bài khai thị sẽ sớm được cập nhật. Kính mong quý Phật tử hoan hỷ đón đọc."}
            </p>
            {debouncedSearch || selectedCategoryObj ? (
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                {debouncedSearch && (
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 cursor-pointer"
                  >
                    <span>Xóa từ khóa tìm kiếm</span>
                  </button>
                )}
                {selectedCategoryObj && (
                  <button
                    onClick={() => handleSelectCategory("ALL")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-900 cursor-pointer"
                  >
                    <span>Xem tất cả danh mục</span>
                  </button>
                )}
              </div>
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
        ) : !selectedCategoryObj && groupedPosts.length > 1 ? (
          /* Sectioned by Category View when viewing ALL categories */
          <div className="space-y-8">
            {groupedPosts.map(([categoryTitle, items]) => (
              <div key={categoryTitle} className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shadow-2xs">
                      <FolderTree className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                      {categoryTitle}
                    </h3>
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${getCategoryBadgeStyle(
                        categoryTitle
                      )}`}
                    >
                      {items.length} bài
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const matchCat = childCategories.find(
                        (c) =>
                          c.name === categoryTitle ||
                          c.name.toLowerCase() === categoryTitle.toLowerCase()
                      );
                      if (matchCat) {
                        handleSelectCategory(matchCat.slug || matchCat.id);
                      }
                    }}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>Chỉ xem mục này</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((post) => (
                    <KhaiThiItem
                      key={post.id || post.slug}
                      post={post}
                      searchQuery={debouncedSearch}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Filtered by single category or search result */
          <div className="space-y-4">
            {selectedCategoryName && (
              <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-amber-800" />
                  <span className="text-xs text-neutral-600">
                    Đang lọc theo danh mục:
                  </span>
                  <span
                    className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${getCategoryBadgeStyle(
                      selectedCategoryObj?.slug || selectedCategoryName
                    )}`}
                  >
                    {selectedCategoryName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectCategory("ALL")}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  Bỏ lọc danh mục
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <KhaiThiItem
                  key={post.id || post.slug}
                  post={post}
                  searchQuery={debouncedSearch}
                />
              ))}
            </div>
          </div>
        )}

        {/* 6. Pagination Controls */}
        {!isLoading && !isError && posts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE5D8]">
            {/* Total summary */}
            <div className="text-xs text-neutral-500 order-2 sm:order-1">
              {meta?.total ? (
                <span>
                  Đang hiển thị trang <strong>{currentPage}</strong> trên tổng số{" "}
                  <strong>{totalPages}</strong> trang ({meta.total} bài viết)
                </span>
              ) : (
                <span>
                  Trang <strong>{currentPage}</strong>
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
                      const isActive = pageNum === currentPage;
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
