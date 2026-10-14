"use client";

import {
  BookOpen,
  Calendar,
  Eye,
  Filter,
  Layers,
  List,
  Music,
  Plus,
  Search,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";

import { useGetPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { CategorizedPosts } from "@/components/post";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { formatTime, slugify, stripHtml } from "@/lib/utils";

export const AdminPostView: React.FC = () => {
  const [viewMode, setViewMode] = useState<"categorized" | "table">("categorized");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | ContentType>("ALL");

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const { data, isLoading } = useGetPosts();
  const posts: PostItemType[] = useMemo(() => data?.data || [], [data]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Filter by category if categoryParam is present
      if (categoryParam) {
        const catTarget = categoryParam.toLowerCase().trim();
        const pCatSlug = p.category?.slug?.toLowerCase().trim() || "";
        const pCatName = p.category?.name?.toLowerCase().trim() || "";
        const pCatId = p.category?.id || p.categoryId || "";
        const matchCategory =
          pCatSlug === catTarget ||
          pCatName === catTarget ||
          pCatId === catTarget ||
          slugify(pCatName) === catTarget;

        if (!matchCategory) return false;
      }

      const matchType =
        typeFilter === "ALL" ? true : p.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
        (p.author?.name && p.author.name.toLowerCase().includes(q)) ||
        (p.content && stripHtml(p.content).toLowerCase().includes(q));

      return matchType && matchQuery;
    });
  }, [posts, searchQuery, typeFilter, categoryParam]);

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
          {/* View mode toggle */}
          <div className="flex rounded-xl border border-[#EDE5D8] bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("categorized")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "categorized"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Theo danh mục</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "table"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Bảng danh sách</span>
            </button>
          </div>

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

      {/* Main Content Area */}
      {viewMode === "categorized" ? (
        <div className="max-w-3xl">
          <CategorizedPosts
            isAdmin={true}
            filterCategory={categoryParam || undefined}
          />
        </div>
      ) : (
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
                  onClick={() => setTypeFilter("ALL")}
                  className={`rounded-md px-2.5 py-1 font-semibold transition ${
                    typeFilter === "ALL"
                      ? "bg-white text-amber-800 shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Tất cả ({posts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter(ContentType.NORMAL)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition ${
                    typeFilter === ContentType.NORMAL
                      ? "bg-white text-emerald-800 shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Bài viết ({posts.filter((p) => p.type === ContentType.NORMAL).length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter(ContentType.AUDIO)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition ${
                    typeFilter === ContentType.AUDIO
                      ? "bg-white text-sky-800 shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Audio ({posts.filter((p) => p.type === ContentType.AUDIO).length})
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
                        Đang tải danh sách bài viết...
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        Không tìm thấy bài viết phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => {
                      const isNormal = post.type === ContentType.NORMAL;
                      const excerpt = post.content ? stripHtml(post.content) : "";

                      return (
                        <tr
                          key={post.id}
                          className="hover:bg-amber-50/40 transition-colors"
                        >
                          {/* Title & Thumbnail */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-amber-900/10 bg-amber-50">
                                <img
                                  src={post.thumbnailUrl || "/images/lotus-thumb.jpg"}
                                  alt={post.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/images/lotus-thumb.jpg";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/post/${encodeURIComponent(post.slug || post.id)}`}
                                  className="font-bold text-neutral-900 truncate block hover:text-amber-800 hover:underline"
                                >
                                  {post.title}
                                </Link>
                                <span className="text-[11px] text-neutral-400 font-mono">
                                  {post.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                              {post.category?.name || "Chưa phân loại"}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            {isNormal ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                <BookOpen className="h-3 w-3" />
                                <span>Normal</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800">
                                <Volume2 className="h-3 w-3" />
                                <span>Audio</span>
                              </span>
                            )}
                          </td>

                          {/* Author */}
                          <td className="py-3.5 px-4 text-neutral-700">
                            {post.author?.name || "—"}
                          </td>

                          {/* Content Excerpt */}
                          <td className="py-3.5 px-4 max-w-sm">
                            {excerpt ? (
                              <p className="line-clamp-2 text-xs text-neutral-600">
                                {excerpt}
                              </p>
                            ) : (
                              <span className="text-xs text-neutral-400 italic">
                                Không có nội dung text
                              </span>
                            )}
                          </td>

                          {/* Created Date */}
                          <td className="py-3.5 px-4 text-xs text-neutral-500 whitespace-nowrap">
                            {post.createdAt
                              ? new Date(post.createdAt).toLocaleDateString("vi-VN")
                              : "—"}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <Link href={`/post/${encodeURIComponent(post.slug || post.id)}`}>
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 hover:border-amber-400 inline-flex items-center gap-1"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Xem chi tiết</span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

