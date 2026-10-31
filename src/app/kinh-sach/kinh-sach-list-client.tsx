"use client";

import {
  BookOpen,
  ChevronLeft,
  Home,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useGetPostsByCategory, useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { KinhSachItem } from "@/components/kinh-sach";
import { MainLayout } from "@/components/layout";
import { KinhSachSkeleton } from "@/components/skeletons";
import { KINH_SACH_SLUG } from "@/constants";

export const KinhSachListClient: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  useEffect(() => {
    setSearchQuery(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedSearch(trimmed);
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("search", trimmed);
        params.delete("q");
      } else {
        params.delete("search");
        params.delete("q");
      }
      const newQuery = params.toString();
      const newPath = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(newPath, { scroll: false });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  // Fetch posts by category KINH_SACH_SLUG
  const isSearching = debouncedSearch.length > 0;

  // 1. Regular category query (when not searching)
  const categoryQuery = useGetPostsByCategory(
    {
      category_name: KINH_SACH_SLUG,
      limit: 12,
    },
    { enabled: !isSearching }
  );

  // 2. Search query within Kinh Sach category (when searching)
  const searchQueryHook = useSearchPosts(
    {
      category: KINH_SACH_SLUG,
      search: debouncedSearch,
      limit: 12,
    },
    { enabled: isSearching }
  );

  const activeQuery = isSearching ? searchQueryHook : categoryQuery;
  const isLoading = activeQuery.isLoading;
  const posts: PostItemType[] = activeQuery.data?.data || [];

  return (
    <MainLayout activeId="kinh-sach">
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-neutral-500"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-amber-800 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <span>/</span>
          <span className="text-amber-900 font-semibold">Kinh Sách Phật Giáo</span>
        </nav>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EDE5D8]/90 bg-gradient-to-br from-amber-50/90 via-white to-amber-100/50 p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100/70 px-3 py-1 text-xs font-semibold text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span>Trình đọc sách</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight">
              Kho Tàng Kinh Điển & Sách Phật Pháp
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Khai mở trí tuệ, thanh tịnh tâm hồn qua từng trang kinh lời Phật dạy.
              Trải nghiệm đọc sách điện tử lật trang sống động như đang cầm cuốn sách thật.
            </p>
          </div>

          {/* Search Box */}
          <div className="mt-6 max-w-md">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tựa đề kinh, tác phẩm..."
                className="w-full rounded-2xl border border-amber-900/15 bg-white/90 pl-10 pr-9 py-2.5 text-base sm:text-sm text-neutral-800 placeholder-neutral-400 shadow-2xs outline-none transition focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <KinhSachSkeleton count={6} />}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3 rounded-3xl border border-neutral-200 bg-white/80 p-8 text-center">
            <BookOpen className="h-10 w-10 text-neutral-300" />
            <h3 className="text-sm font-bold text-neutral-700">Chưa tìm thấy kinh sách phù hợp</h3>
            <p className="text-xs text-neutral-400">
              Vui lòng thử tìm với từ khóa khác hoặc quay lại sau.
            </p>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <KinhSachItem
                key={post.id}
                post={post}
                searchQuery={debouncedSearch}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
