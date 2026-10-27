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
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetGroups } from "@/api/group";
import { useGetPostsByCategory, useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { BachThoaiDisplayItem, BachThoaiItem } from "@/components/home";
import { MainLayout } from "@/components/layout";
import { BachThoaiSkeleton } from "@/components/skeletons";
import { BACH_THOAI_PHAT_PHAP_SLUG } from "@/constants";
import { ContentType } from "@/enums";
import { getGroupBadgeStyle } from "@/lib/color-badge";
import { trackSearch } from "@/lib/gtm";
import { formatTime, slugify, stripHtml } from "@/lib/utils";

const PAGE_SIZE = 12;

type FilterTab = "ALL" | "PHAP_THOAI" | "BAI_GIANG" | "AUDIO" | "VAN_BAN";

/**
 * Generate a URL-friendly slug for a group name
 */
function getGroupSlug(name?: string | null): string {
  if (!name || name.toLowerCase() === "undefined" || name.toLowerCase() === "không xác định") {
    return "khong-xac-dinh";
  }
  return slugify(name);
}

export const BachThoaiClient: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL query params as single source of truth
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
  const urlGroupParam = searchParams.get("group") || searchParams.get("groupId") || "ALL";

  const currentPage = useMemo(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  // Local state for search input debounce
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearch);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");

  // Fetch groups supported for Bach Thoai Phat Phap
  const { data: groups = [] } = useGetGroups({
    isSupportForBachThoaiPhatPhap: true,
  });

  // Resolve matching group from URL parameter (group slug, name, or UUID)
  const selectedGroupObj = useMemo(() => {
    if (!urlGroupParam || urlGroupParam === "ALL") return null;
    const target = urlGroupParam.toLowerCase().trim();
    return (
      groups.find((g) => {
        if (g.id === urlGroupParam) return true;
        if (g.name.toLowerCase().trim() === target) return true;
        if (getGroupSlug(g.name) === target) return true;
        if (
          (target === "khong-xac-dinh" || target === "undefined" || target === "chua-phan-nhom") &&
          g.name.toLowerCase() === "undefined"
        ) {
          return true;
        }
        return false;
      }) || null
    );
  }, [urlGroupParam, groups]);

  const effectiveGroupId = selectedGroupObj ? selectedGroupObj.id : undefined;

  const selectedGroupName = selectedGroupObj
    ? selectedGroupObj.name.toLowerCase() === "undefined"
      ? "Chưa phân nhóm"
      : selectedGroupObj.name
    : null;

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
    groupSlug?: string | null;
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

    // Update group slug
    if (updates.groupSlug !== undefined) {
      if (updates.groupSlug && updates.groupSlug !== "ALL") {
        params.set("group", updates.groupSlug);
      } else {
        params.delete("group");
      }
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
      category_name: BACH_THOAI_PHAT_PHAP_SLUG,
      limit: PAGE_SIZE,
      page: currentPage,
      ...(effectiveGroupId ? { groupId: effectiveGroupId } : {}),
    },
    { enabled: !isSearching }
  );

  // 2. Search query within Bach Thoai category with offset pagination
  const searchPostsQuery = useSearchPosts(
    {
      category: BACH_THOAI_PHAT_PHAP_SLUG,
      search: debouncedSearch,
      limit: PAGE_SIZE,
      page: currentPage,
      ...(effectiveGroupId ? { groupId: effectiveGroupId } : {}),
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
        thumbnailUrl: post.thumbnailUrl || "/images/lotus-thumb.jpg",
        type: post.type || (post.audio?.audioUrl ? ContentType.AUDIO : ContentType.NORMAL),
        audioUrl: post.audio?.audioUrl,
        snippet,
        groupId: post.groupId || post.group?.id,
        groupName: post.group?.name,
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

  // Group items by groupName for sectioned view when viewing ALL groups
  const groupedItems = useMemo(() => {
    const groupsMap = new Map<string, BachThoaiDisplayItem[]>();
    for (const item of filteredItems) {
      const key =
        item.groupName &&
        item.groupName.toLowerCase() !== "undefined" &&
        item.groupName.toLowerCase() !== "không xác định"
          ? item.groupName
          : "Chưa phân nhóm";
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(item);
    }
    return Array.from(groupsMap.entries());
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

  const handleSelectGroup = (targetGroupSlug: string) => {
    updateUrlParams({ groupSlug: targetGroupSlug, page: 1 });
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
              src="/images/home-hero-banner.jpg"
              alt="Bạch thoại Phật pháp"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-black/35 px-3 py-1 text-xs font-semibold text-amber-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Pháp âm mầu nhiệm</span>
            </div>
            <h1
              className="text-2xl font-bold tracking-wide drop-shadow-md sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Bạch Thoại Phật Pháp
            </h1>
            <p className="mt-2 max-w-xl text-xs font-medium text-amber-100/90 drop-shadow-sm sm:text-sm">
              Dành cho những người mới bắt đầu tu tập và tìm hiểu chánh pháp, chuyển hóa tâm thức và
              soi sáng con đường an lạc.
            </p>
          </div>
        </div>

        {/* 3. Group Filter Pills */}
        <div className="space-y-2.5 rounded-2xl border border-amber-900/10 bg-white/80 p-3.5 shadow-2xs backdrop-blur-xs sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 sm:text-sm">
              <Layers className="h-4 w-4 text-amber-700" />
              <span>Xem theo Nhóm:</span>
            </div>
            {selectedGroupObj && (
              <button
                type="button"
                onClick={() => handleSelectGroup("ALL")}
                className="cursor-pointer text-xs font-semibold text-amber-800 underline hover:text-amber-950"
              >
                Xem tất cả nhóm
              </button>
            )}
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => handleSelectGroup("ALL")}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition ${
                !selectedGroupObj
                  ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-xs"
                  : "border border-neutral-200/80 bg-white text-neutral-700 hover:border-amber-300 hover:bg-amber-50/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tất cả nhóm</span>
            </button>

            {groups
              .filter((grp) => !grp.deletedAt)
              .map((grp) => {
                const groupSlug = getGroupSlug(grp.name);
                const isSelected = selectedGroupObj?.id === grp.id;
                const displayName =
                  grp.name.toLowerCase() === "undefined" ? "Chưa phân nhóm" : grp.name;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => handleSelectGroup(groupSlug)}
                    className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-xs"
                        : "border border-neutral-200/80 bg-white text-neutral-700 hover:border-amber-300 hover:bg-amber-50/60"
                    }`}
                  >
                    <FolderTree className="h-3.5 w-3.5 opacity-70" />
                    <span>{displayName}</span>
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
              className="w-full rounded-2xl border border-amber-200/80 bg-white/90 py-2 pr-9 pl-10 text-xs text-neutral-800 placeholder-neutral-400 shadow-2xs transition outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200/60 sm:text-sm"
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
              {debouncedSearch || selectedGroupObj
                ? "Không tìm thấy bài viết phù hợp"
                : "Chưa có bài viết Bạch thoại Phật pháp nào"}
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-neutral-500 sm:text-sm">
              {debouncedSearch
                ? `Không có kết quả nào cho "${debouncedSearch}". Hãy thử tìm kiếm với từ khóa khác.`
                : selectedGroupObj
                  ? `Chưa có bài viết nào thuộc nhóm "${selectedGroupName}".`
                  : "Các bài giảng sẽ sớm được cập nhật. Kính mong quý Phật tử hoan hỷ đón đọc."}
            </p>
            {debouncedSearch || selectedGroupObj ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {debouncedSearch && (
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
                  >
                    <span>Xóa từ khóa tìm kiếm</span>
                  </button>
                )}
                {selectedGroupObj && (
                  <button
                    onClick={() => handleSelectGroup("ALL")}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-900"
                  >
                    <span>Xem tất cả nhóm</span>
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
        ) : !selectedGroupObj && groupedItems.length > 1 ? (
          /* Sectioned by Group View when viewing ALL groups */
          <div className="space-y-8">
            {groupedItems.map(([groupTitle, items]) => (
              <div key={groupTitle} className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shadow-2xs">
                      <FolderTree className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 sm:text-base">
                      {groupTitle}
                    </h3>
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${getGroupBadgeStyle(
                        groupTitle
                      )}`}
                    >
                      {items.length} bài
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const matchGroup = groups.find(
                        (g) =>
                          g.name === groupTitle ||
                          (groupTitle === "Chưa phân nhóm" && g.name.toLowerCase() === "undefined")
                      );
                      if (matchGroup) {
                        handleSelectGroup(getGroupSlug(matchGroup.name));
                      }
                    }}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline"
                  >
                    <span>Chỉ xem nhóm này</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <BachThoaiItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Filtered by single group or single group result */
          <div className="space-y-4">
            {selectedGroupName && (
              <div className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-amber-800" />
                  <span className="text-xs text-neutral-600">Đang lọc theo nhóm:</span>
                  <span
                    className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${getGroupBadgeStyle(
                      selectedGroupName
                    )}`}
                  >
                    {selectedGroupName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectGroup("ALL")}
                  className="cursor-pointer text-xs font-semibold text-amber-800 underline hover:text-amber-950"
                >
                  Bỏ lọc nhóm
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
              {filteredItems.map((item) => (
                <BachThoaiItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* 7. Pagination Controls */}
        {!isLoading && !isError && rawPosts.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#EDE5D8] pt-6 sm:flex-row">
            <div className="order-2 text-xs text-neutral-500 sm:order-1">
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

            <div className="order-1 flex items-center gap-2 sm:order-2">
              {/* Prev Button */}
              <button
                onClick={handlePrevPage}
                disabled={!hasPrevPage || isFetching}
                className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition ${
                  hasPrevPage && !isFetching
                    ? "cursor-pointer border-neutral-300 bg-white text-neutral-800 hover:border-amber-300 hover:bg-neutral-50"
                    : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 opacity-60"
                }`}
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Trang trước</span>
              </button>

              {/* Page Numbers */}
              {totalPages > 1 && (
                <div className="hidden items-center gap-1 sm:flex">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                    const pageNum = index + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleGoToPage(pageNum)}
                        disabled={isFetching}
                        className={`h-8 w-8 cursor-pointer rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? "bg-amber-800 text-white shadow-xs"
                            : "border border-neutral-200/80 bg-white text-neutral-700 hover:bg-amber-50 hover:text-amber-900"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-1 text-xs text-neutral-400">...</span>}
                </div>
              )}

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage || isFetching}
                className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition ${
                  hasNextPage && !isFetching
                    ? "cursor-pointer border-amber-700 bg-amber-800 text-white hover:bg-amber-900"
                    : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 opacity-60"
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
