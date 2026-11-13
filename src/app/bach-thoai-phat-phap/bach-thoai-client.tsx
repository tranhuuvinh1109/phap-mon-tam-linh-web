"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FolderTree,
  Home,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetCategories, useGetCategoryTree } from "@/api/category";
import type { CategoryItemType } from "@/api/category/category.type";
import { useGetPostsByCategory, useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { BachThoaiDisplayItem, BachThoaiItem } from "@/components/home";
import { MainLayout } from "@/components/layout";
import { BachThoaiSkeleton } from "@/components/skeletons";
import { BACH_THOAI_PHAT_PHAP_SLUG } from "@/constants";
import { ContentType } from "@/enums";
import { getCategoryBadgeStyle } from "@/lib/color-badge";
import { trackSearch } from "@/lib/gtm";
import { formatTime, slugify, stripHtml } from "@/lib/utils";

import { Pagination } from "./components";

const PAGE_SIZE = 12;

type FilterTab = "ALL" | "PHAP_THOAI" | "BAI_GIANG" | "AUDIO" | "VAN_BAN";

export const BachThoaiClient: React.FC = () => {
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
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");

  // Fetch category tree and flat categories list
  const { data: categoryTree = [] } = useGetCategoryTree();
  const { data: categories = [] } = useGetCategories();

  // Find root "Bạch thoại Phật pháp" category
  const bachThoaiParent = useMemo(() => {
    const fromTree = categoryTree.find(
      (c) =>
        c.slug === BACH_THOAI_PHAT_PHAP_SLUG ||
        c.slug === "bach-thoai-phat-phap" ||
        c.name.toLowerCase().includes("bạch thoại") ||
        c.name.toLowerCase().includes("bach thoai")
    );
    if (fromTree) return fromTree;

    return (
      categories.find(
        (c) =>
          !c.parentId &&
          (c.slug === BACH_THOAI_PHAT_PHAP_SLUG ||
            c.slug === "bach-thoai-phat-phap" ||
            c.name.toLowerCase().includes("bạch thoại") ||
            c.name.toLowerCase().includes("bach thoai"))
      ) || null
    );
  }, [categoryTree, categories]);

  // Extract child categories whose parent is "Bạch thoại Phật pháp"
  const childCategories = useMemo<CategoryItemType[]>(() => {
    const list: CategoryItemType[] = [];
    const seen = new Set<string>();

    if (bachThoaiParent?.children && Array.isArray(bachThoaiParent.children)) {
      bachThoaiParent.children.forEach((c) => {
        if (!c.deletedAt && !seen.has(c.id)) {
          seen.add(c.id);
          list.push(c);
        }
      });
    }

    if (bachThoaiParent?.id) {
      categories.forEach((c) => {
        if (!c.deletedAt && c.parentId === bachThoaiParent.id && !seen.has(c.id)) {
          seen.add(c.id);
          list.push(c);
        }
      });
    }

    return list.sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));
  }, [bachThoaiParent, categories]);

  // Resolve matching child category from URL parameter (slug, UUID or name)
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
      params.delete("categoryId");
      params.delete("subCategory");
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

  // 1. Regular category posts query with offset pagination
  const categoryPostsQuery = useGetPostsByCategory(
    {
      ...(selectedCategoryObj
        ? {
            category_name: selectedCategoryObj.slug || undefined,
            categoryId: selectedCategoryObj.id,
          }
        : { category_name: BACH_THOAI_PHAT_PHAP_SLUG }),
      limit: PAGE_SIZE,
      page: currentPage,
    },
    { enabled: !isSearching }
  );

  // 2. Search query within Bach Thoai category with offset pagination
  const searchPostsQuery = useSearchPosts(
    {
      category: selectedCategoryObj?.slug || BACH_THOAI_PHAT_PHAP_SLUG,
      categoryId: selectedCategoryObj?.id,
      search: debouncedSearch,
      limit: PAGE_SIZE,
      page: currentPage,
    },
    { enabled: isSearching }
  );

  const activeQuery = isSearching ? searchPostsQuery : categoryPostsQuery;
  const { isLoading, isError, error, refetch, isFetching } = activeQuery;
  const rawPosts: PostItemType[] = activeQuery.data?.data || [];
  const meta = activeQuery.data?.meta;

  // Transform API posts to display item format
  const displayItems = useMemo<BachThoaiDisplayItem[]>(() => {
    return rawPosts.map((post) => {
      let durationText = "--:--";
      if (post.audio?.duration && post.audio.duration > 0) {
        durationText = formatTime(post.audio.duration);
      } else if (post.video?.duration && post.video.duration > 0) {
        durationText = formatTime(post.video.duration);
      }

      const snippet = post.content ? stripHtml(post.content).slice(0, 80) : undefined;

      return {
        id: post.id,
        title: post.title,
        slug: post.slug || post.id,
        authorName: post.author?.name || "Bạch thoại Phật pháp",
        durationText,
        thumbnailUrl: post.thumbnailUrl || "/images/bach-thoai-phat-phap.png",
        type: post.type || (post.audio?.audioUrl ? ContentType.AUDIO : ContentType.NORMAL),
        audioUrl: post.audio?.audioUrl,
        snippet,
        groupId: post.groupId || post.group?.id,
        groupName: post.group?.name,
        categoryId: post.categoryId || post.category?.id,
        categoryName: post.category?.name,
      };
    });
  }, [rawPosts]);

  // Filter items by tab
  const filteredItems = useMemo(() => {
    return displayItems.filter((item) => {
      if (activeFilter === "ALL") return true;
      if (activeFilter === "AUDIO") return item.type === ContentType.AUDIO || !!item.audioUrl;
      if (activeFilter === "VAN_BAN") return item.type === ContentType.NORMAL;
      if (activeFilter === "PHAP_THOAI") {
        return item.title.toLowerCase().includes("pháp thoại");
      }
      if (activeFilter === "BAI_GIANG") {
        return item.title.toLowerCase().includes("bài giảng");
      }
      return true;
    });
  }, [displayItems, activeFilter]);

  // Group items by categoryName for sectioned view when viewing ALL categories
  const groupedItems = useMemo(() => {
    const map = new Map<string, BachThoaiDisplayItem[]>();
    for (const item of filteredItems) {
      const key = item.categoryName || "Chưa phân loại";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [filteredItems]);

  // Debounced search tracking for GTM & GA4
  useEffect(() => {
    if (!debouncedSearch) return;
    trackSearch({
      searchTerm: debouncedSearch,
      searchLocation: "bach_thoai_phat_phap",
      resultsCount: filteredItems.length,
    });
  }, [debouncedSearch, filteredItems.length]);

  // Pagination calculations
  const totalPages = meta?.totalPages ?? (meta?.total ? Math.ceil(meta.total / PAGE_SIZE) : 1);

  const hasNextPage = Boolean(meta?.hasNextPage || (meta?.total && currentPage < totalPages));
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
    <MainLayout activeId="bach-thoai" className="space-y-6">
      <div className="space-y-6 pb-12 sm:space-y-8">
        {/* 1. Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-neutral-500"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-colors hover:text-amber-800"
          >
            <Home className="h-3.5 w-3.5 text-neutral-400" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="font-semibold text-amber-900">Bạch thoại Phật pháp</span>
        </nav>

        {/* 2. Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-900/10 shadow-sm">
          <div className="relative h-48 w-full sm:h-60">
            <Image
              src="/images/phap-mon-tam-linh-hero-banner.jpg"
              alt="Bạch thoại Phật pháp"
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* 3. Category Filter Pills */}
        <div className="space-y-2.5 rounded-2xl border border-amber-900/10 bg-white/80 p-3.5 shadow-2xs backdrop-blur-xs sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 sm:text-sm">
              <Layers className="h-4 w-4 text-amber-700" />
              <span>Xem theo danh mục:</span>
            </div>
            {selectedCategoryObj && (
              <button
                type="button"
                onClick={() => handleSelectCategory("ALL")}
                className="cursor-pointer text-xs font-semibold text-amber-800 underline hover:text-amber-950"
              >
                Xem tất cả danh mục
              </button>
            )}
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => handleSelectCategory("ALL")}
              title="Tất cả danh mục"
              className={`flex h-12 max-w-[150px] min-w-[120px] shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs leading-tight font-semibold transition sm:h-14 sm:max-w-[180px] ${
                !selectedCategoryObj
                  ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-xs"
                  : "border border-neutral-200/80 bg-white text-neutral-700 hover:border-amber-300 hover:bg-amber-50/60"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span
                className="line-clamp-2 leading-tight break-words"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                Tất cả danh mục
              </span>
            </button>

            {childCategories.map((cat) => {
              const catSlug = cat.slug || cat.id;
              const isSelected =
                selectedCategoryObj?.id === cat.id || selectedCategoryObj?.slug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(catSlug)}
                  title={cat.name}
                  className={`flex h-12 max-w-[150px] min-w-[120px] shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs leading-tight font-semibold transition sm:h-14 sm:max-w-[180px] ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-xs"
                      : "border border-neutral-200/80 bg-white text-neutral-700 hover:border-amber-300 hover:bg-amber-50/60"
                  }`}
                >
                  <FolderTree className="h-4 w-4 shrink-0 opacity-70" />
                  <span
                    className="line-clamp-2 leading-tight break-words"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Search Bar & Filter Tabs */}
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          {/* Quick Search */}
          <div className="relative w-full shrink-0 sm:w-72">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài giảng..."
              className="w-full rounded-2xl border border-amber-200/80 bg-white/90 py-2 pr-9 pl-10 text-base text-neutral-800 placeholder-neutral-400 shadow-2xs transition outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200/60 sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                data-track-click="bach_thoai_clear_search"
                data-track-category="bach_thoai_search"
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 5. List Status Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium text-neutral-600">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            <span>
              {isLoading ? "Đang tải danh sách..." : `Hiển thị ${filteredItems.length} bài viết`}
            </span>
            {meta?.total ? (
              <span className="text-neutral-400">• Tổng cộng {meta.total} bài</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Đang đồng bộ...</span>
              </span>
            )}
            <span className="rounded-full border border-neutral-200/60 bg-white px-3 py-1 font-semibold text-neutral-700 shadow-2xs">
              Trang {currentPage} {totalPages > 1 ? `/ ${totalPages}` : ""}
            </span>
          </div>
        </div>

        {/* 6. Content Grid */}
        {isLoading ? (
          <BachThoaiSkeleton count={PAGE_SIZE} />
        ) : isError ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200/80 bg-rose-50/50 p-8 text-center shadow-2xs sm:p-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 sm:text-lg">
              Không thể tải danh sách bài viết
            </h3>
            <p className="mt-1 max-w-md text-xs text-neutral-600 sm:text-sm">
              {(error as Error)?.message ||
                "Đã có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại sau."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-amber-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE5D8] bg-white/70 p-12 text-center shadow-2xs">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50 text-amber-800">
              <Sparkles className="h-7 w-7 text-amber-700" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 sm:text-lg">
              {debouncedSearch || selectedCategoryObj
                ? "Không tìm thấy bài viết phù hợp"
                : "Chưa có bài viết Bạch thoại Phật pháp nào"}
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-neutral-500 sm:text-sm">
              {debouncedSearch
                ? `Không có kết quả nào cho "${debouncedSearch}". Hãy thử tìm kiếm với từ khóa khác.`
                : selectedCategoryObj
                  ? `Chưa có bài viết nào thuộc danh mục "${selectedCategoryName}".`
                  : "Các bài giảng sẽ sớm được cập nhật. Kính mong quý Phật tử hoan hỷ đón đọc."}
            </p>
            {debouncedSearch || selectedCategoryObj ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {debouncedSearch && (
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
                  >
                    <span>Xóa từ khóa tìm kiếm</span>
                  </button>
                )}
                {selectedCategoryObj && (
                  <button
                    onClick={() => handleSelectCategory("ALL")}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-900"
                  >
                    <span>Xem tất cả danh mục</span>
                  </button>
                )}
              </div>
            ) : (
              <Link
                href="/"
                className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Quay về trang chủ</span>
              </Link>
            )}
          </div>
        ) : !selectedCategoryObj && groupedItems.length > 1 ? (
          /* Sectioned by Category View when viewing ALL categories */
          <div className="space-y-8">
            {groupedItems.map(([catTitle, items]) => (
              <div key={catTitle} className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shadow-2xs">
                      <FolderTree className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 sm:text-base">{catTitle}</h3>
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${getCategoryBadgeStyle(
                        catTitle
                      )}`}
                    >
                      {items.length} bài
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const matchCat = childCategories.find((c) => c.name === catTitle);
                      if (matchCat) {
                        handleSelectCategory(matchCat.slug || matchCat.id);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline"
                  >
                    <span>Chỉ xem danh mục này</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <BachThoaiItem key={item.id} item={item} searchQuery={debouncedSearch} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Filtered by single category or single category result */
          <div className="space-y-4">
            {selectedCategoryName && (
              <div className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-amber-800" />
                  <span className="text-xs text-neutral-600">Đang lọc theo danh mục:</span>
                  <span
                    className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${getCategoryBadgeStyle(
                      selectedCategoryName
                    )}`}
                  >
                    {selectedCategoryName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectCategory("ALL")}
                  className="cursor-pointer text-xs font-semibold text-amber-800 underline hover:text-amber-950"
                >
                  Bỏ lọc danh mục
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
              {filteredItems.map((item) => (
                <BachThoaiItem key={item.id} item={item} searchQuery={debouncedSearch} />
              ))}
            </div>
          </div>
        )}

        {/* 7. Pagination Controls */}
        {!isLoading && !isError && rawPosts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={meta?.total}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onGoToPage={handleGoToPage}
          />
        )}
      </div>
    </MainLayout>
  );
};
