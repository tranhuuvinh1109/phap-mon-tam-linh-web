"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetPosts, useSearchPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { PostTableItem } from "./post-table-item";

const PAGE_SIZE = 15;

export const AdminPostView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | ContentType>("ALL");

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // Debounce search query to avoid spamming the backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam]);

  // Request parameters for backend pagination
  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      type: typeFilter === "ALL" ? undefined : typeFilter,
    };
  }, [currentPage, debouncedSearch, typeFilter]);

  // 1. When categoryParam is present -> call GET /posts/search?category=...&page=...&limit=15
  const categorySearchQuery = useSearchPosts(
    {
      category: categoryParam || "",
      ...queryParams,
    },
    { enabled: !!categoryParam }
  );

  // 2. When categoryParam is absent -> call GET /posts?page=...&limit=15
  const allPostsQuery = useGetPosts(queryParams, {
    enabled: !categoryParam,
  });

  const activeQuery = categoryParam ? categorySearchQuery : allPostsQuery;
  const isLoading = activeQuery.isLoading;
  const isFetching = activeQuery.isFetching;

  const posts: PostItemType[] = useMemo(() => {
    return activeQuery.data?.data || [];
  }, [activeQuery.data]);

  const total = activeQuery.data?.meta?.total ?? posts.length;
  const totalPages =
    activeQuery.data?.meta?.totalPages || Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleTypeChange = (type: "ALL" | ContentType) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              className={`h-8 min-w-8 px-2.5 rounded-xl text-xs font-semibold transition ${currentPage === p
                  ? "bg-[#9C5812] text-white shadow-2xs font-bold"
                  : "bg-white text-neutral-700 border border-[#EDE5D8] hover:bg-[#FAF7F0] hover:text-[#9C5812]"
                }`}
            >
              {p}
            </button>
          ) : (
            <span key={`dots-${idx}`} className="px-1 text-xs text-neutral-400">
              ...
            </span>
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header: Title and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EDE5D8]/80 pb-5">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Quản lý Bài viết
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Quản lý, hiển thị và xem trước nội dung các bài viết (Normal) và bài giảng (Audio).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => activeQuery.refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold border-[#EDE5D8] hover:bg-[#FAF7F0] shadow-2xs"
          >
            <RefreshCw
              className={`h-4 w-4 text-amber-700 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Làm mới</span>
          </Button>

          <Link
            href={
              categoryParam
                ? `/admin/post/create-post?category=${encodeURIComponent(categoryParam)}`
                : "/admin/post/create-post"
            }
          >
            <Button
              variant="golden"
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo bài viết</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Filter Banner */}
      {categoryParam && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-[#FFFDF8] p-3 sm:px-4 sm:py-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-neutral-500 font-medium">Đang xem chuyên mục:</span>
            <span className="font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-lg">
              {categoryParam}
            </span>
          </div>
          <Link
            href="/admin/post"
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline transition"
          >
            Xem tất cả bài viết
          </Link>
        </div>
      )}

      {/* Table View with Filters and Pagination */}
      <div className="space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#EDE5D8]/90 bg-white/90 p-3.5 shadow-2xs backdrop-blur-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm tiêu đề, tác giả, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-9 pr-3 py-2 text-xs sm:text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Filter by Type */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
            <span className="text-xs font-medium text-neutral-500">Loại:</span>
            <div className="flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleTypeChange("ALL")}
                className={`rounded-md px-2.5 py-1 font-semibold transition ${typeFilter === "ALL"
                    ? "bg-white text-amber-800 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-900"
                  }`}
              >
                Tất cả ({total})
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(ContentType.NORMAL)}
                className={`rounded-md px-2.5 py-1 font-semibold transition ${typeFilter === ContentType.NORMAL
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-900"
                  }`}
              >
                Bài viết
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(ContentType.AUDIO)}
                className={`rounded-md px-2.5 py-1 font-semibold transition ${typeFilter === ContentType.AUDIO
                    ? "bg-white text-sky-800 shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-900"
                  }`}
              >
                Audio
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-[#EDE5D8]/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#EDE5D8] bg-[#FAF7F0]/80 text-neutral-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Bài viết</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Loại</th>
                  <th className="py-3 px-4">Tác giả</th>
                  <th className="py-3 px-4">Trích đoạn nội dung</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE5D8]/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-800 border-t-transparent" />
                        <span>Đang tải danh sách bài viết...</span>
                      </div>
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-500">
                      Không tìm thấy bài viết phù hợp.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <PostTableItem key={post.id} post={post} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Pagination Controls */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-[#EDE5D8] bg-[#FBF9F4] text-xs text-neutral-600">
              <div>
                <span>
                  Hiển thị{" "}
                  <strong className="text-neutral-900 font-bold">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-neutral-900 font-bold">
                    {Math.min(currentPage * PAGE_SIZE, total)}
                  </strong>{" "}
                  trên tổng số{" "}
                  <strong className="text-neutral-900 font-bold">{total}</strong> bài viết
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="h-8 px-2.5 text-xs font-semibold rounded-xl border-[#EDE5D8] hover:bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Trước</span>
                </Button>

                {/* Page Number Buttons */}
                {renderPaginationButtons()}

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="h-8 px-2.5 text-xs font-semibold rounded-xl border-[#EDE5D8] hover:bg-white disabled:opacity-40"
                >
                  <span>Sau</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
