"use client";

import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Search,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { MainLayout } from "@/components/layout";
import {
  BACH_THOAI_PHAT_PHAP_SLUG,
  KHAI_THI_SLUG,
  NGOI_NHA_NHO_SLUG,
  NIEM_KINH_SLUG,
} from "@/constants";
import { trackSearch } from "@/lib/gtm";

const PAGE_SIZE = 12;

const CATEGORY_TABS = [
  { id: "ALL", label: "Tất cả chuyên mục" },
  { id: KHAI_THI_SLUG, label: "Khai thị" },
  { id: BACH_THOAI_PHAT_PHAP_SLUG, label: "Bạch thoại phật pháp" },
  { id: NIEM_KINH_SLUG, label: "Niệm kinh" },
  { id: NGOI_NHA_NHO_SLUG, label: "Ngôi nhà nhỏ" },
] as const;

export function SearchClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL search params
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "ALL";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Sync state if URL changes externally
  useEffect(() => {
    const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
    const urlCategory = searchParams.get("category") || "ALL";
    const urlPage = Number(searchParams.get("page")) || 1;

    setSearchInput(urlSearch);
    setDebouncedSearch(urlSearch);
    setActiveCategory(urlCategory);
    setCurrentPage(urlPage);
  }, [searchParams]);

  // Debounce search input and sync to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);

      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
        params.delete("q");
      } else {
        params.delete("search");
        params.delete("q");
      }
      // Reset page to 1 on keyword change
      params.delete("page");

      router.replace(`${pathname}?${params.toString()}`);

      if (searchInput.trim()) {
        trackSearch({
          searchTerm: searchInput.trim(),
          searchLocation: "global_search_page",
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle category tab switch
  const handleTabChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (catId !== "ALL") {
      params.set("category", catId);
    } else {
      params.delete("category");
    }
    params.delete("page");

    router.replace(`${pathname}?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);

    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }

    router.replace(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch search results across all categories or filtered by selected category
  const { data, isLoading, isFetching } = useSearchPosts({
    search: debouncedSearch.trim() || undefined,
    category: activeCategory !== "ALL" ? activeCategory : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const posts: PostItemType[] = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;
  const total = meta?.total ?? posts.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Determine link target for a post
  const getPostLink = (post: PostItemType) => {
    const catSlug = post.category?.slug?.toLowerCase() || "";
    if (catSlug.includes("bach-thoai") || catSlug.includes("bạch-thoại")) {
      return `/bach-thoai-phat-phap/${post.slug}`;
    }
    if (catSlug.includes("khai-thi") || catSlug.includes("khai-thị")) {
      return `/khai-thi/${post.slug}`;
    }
    if (catSlug.includes("ngoi-nha-nho") || catSlug.includes("ngôi-nhà-nhỏ")) {
      return `/ngoi-nha-nho/${post.slug}`;
    }
    if (catSlug.includes("niem-kinh") || catSlug.includes("niệm-kinh")) {
      return `/niem-kinh`;
    }
    return `/${post.category?.slug || "khai-thi"}/${post.slug}`;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EDE5D8] bg-gradient-to-br from-[#FAF7F0] via-white to-[#F5EFE6] p-6 shadow-sm sm:p-8">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-100/70 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span>Tìm kiếm toàn hệ thống</span>
            </div>

            <h1
              className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Kết quả tìm kiếm
            </h1>

            <p className="mt-1.5 text-xs text-neutral-600 sm:text-sm">
              Tìm kiếm các bài khai thị, bạch thoại phật pháp, kinh tụng và cẩm nang tu học trên toàn bộ hệ thống.
            </p>

            {/* In-page Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDebouncedSearch(searchInput);
                const params = new URLSearchParams(searchParams.toString());
                if (searchInput.trim()) {
                  params.set("search", searchInput.trim());
                  params.delete("q");
                } else {
                  params.delete("search");
                  params.delete("q");
                }
                params.delete("page");
                router.replace(`${pathname}?${params.toString()}`);
              }}
              className="relative mt-5 max-w-xl flex items-center"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="w-full rounded-2xl border border-[#E5DCBE] bg-white py-3 pl-11 pr-28 text-base sm:text-sm text-neutral-900 shadow-sm transition placeholder:text-neutral-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setDebouncedSearch("");
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("search");
                      params.delete("q");
                      params.delete("page");
                      router.replace(`${pathname}?${params.toString()}`);
                    }}
                    className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition cursor-pointer"
                    title="Xóa từ khóa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-xl bg-amber-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-900 transition active:scale-95 cursor-pointer"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Keyword Result Counter */}
            {debouncedSearch.trim() && (
              <p className="mt-3 text-xs text-neutral-500">
                Tìm thấy{" "}
                <span className="font-bold text-amber-900">{total}</span> kết quả
                cho từ khóa &ldquo;
                <span className="font-semibold text-neutral-800">
                  {debouncedSearch}
                </span>
                &rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Category Tabs Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-amber-800 text-white shadow-sm"
                    : "border border-[#EDE5D8] bg-white text-neutral-600 hover:border-amber-600 hover:bg-[#FAF7F0] hover:text-amber-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Results List */}
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-[#EDE5D8] bg-white p-4 space-y-3"
              >
                <div className="h-40 w-full rounded-xl bg-neutral-200/70" />
                <div className="h-4 w-3/4 rounded bg-neutral-200/70" />
                <div className="h-3 w-1/2 rounded bg-neutral-200/50" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-[#EDE5D8] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3
              className="text-lg sm:text-xl font-bold text-neutral-800"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Không tìm thấy kết quả nào
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              {debouncedSearch.trim()
                ? `Không có bài viết nào phù hợp với từ khóa "${debouncedSearch}". Bạn hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang chuyên mục khác.`
                : "Vui lòng nhập từ khóa để tìm kiếm bài viết."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => {
              const hasAudio = Boolean(post.audio?.audioUrl);
              const postLink = getPostLink(post);

              return (
                <Link
                  key={post.id}
                  href={postLink}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EDE5D8] bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                      {post.thumbnailUrl ? (
                        <Image
                          src={post.thumbnailUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-800">
                          <BookOpen className="h-8 w-8 opacity-40" />
                        </div>
                      )}

                      {/* Content Type Badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {hasAudio ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-900/85 px-2 py-0.5 text-[10px] font-bold text-white shadow backdrop-blur-xs">
                            <Headphones className="h-3 w-3" />
                            <span>Audio</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/85 px-2 py-0.5 text-[10px] font-bold text-white shadow backdrop-blur-xs">
                            <BookOpen className="h-3 w-3" />
                            <span>Bài đọc</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta info & title */}
                    <div className="p-4">
                      {/* Category Badge */}
                      {post.category?.name && (
                        <span className="inline-block text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                          {post.category.name}
                        </span>
                      )}

                      <h4
                        className="mt-1 line-clamp-2 text-sm sm:text-base font-bold text-neutral-900 group-hover:text-amber-900 transition-colors"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {post.title}
                      </h4>
                    </div>
                  </div>

                  {/* Footer date & author */}
                  <div className="flex items-center justify-between border-t border-[#EDE5D8]/70 px-4 py-2.5 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString("vi-VN")
                        : ""}
                    </span>

                    {post.author?.name && (
                      <span className="truncate max-w-[120px] font-medium text-neutral-600">
                        {post.author.name}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#EDE5D8] bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-[#FAF7F0] disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Trước</span>
            </button>

            <span className="px-3 text-xs font-medium text-neutral-500">
              Trang <strong className="text-neutral-900">{currentPage}</strong> /{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#EDE5D8] bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-[#FAF7F0] disabled:opacity-40 transition"
            >
              <span>Sau</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
