"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Headphones,
  Home,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState, useEffect } from "react";

import { useGetPostsByCategory } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { BachThoaiDisplayItem, BachThoaiItem } from "@/components/home";
import { MainLayout } from "@/components/layout";
import { BachThoaiSkeleton } from "@/components/skeletons";
import { BACH_THOAI_PHAT_PHAP_SLUG } from "@/constants";
import { ContentType } from "@/enums";
import { formatTime, stripHtml } from "@/lib/utils";

import { Pagination } from "../../components/pagination";
import { getBookCoverImage } from "../../components/chapter-book-card";

const PAGE_SIZE = 12;

export interface ChapterDetailClientProps {
  chapterNumber: number;
}

export const ChapterDetailClient: React.FC<ChapterDetailClientProps> = ({
  chapterNumber,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = useMemo(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categoryParam =
    searchParams.get("category") ||
    searchParams.get("categorySlug") ||
    "bach-thoai-phat-phap-bo-12-quyen";

  // Fetch posts for this chapter using getPostsByCategory API (with server search)
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetPostsByCategory({
      category_name: categoryParam,
      chapter: chapterNumber,
      search: debouncedSearch || undefined,
      limit: PAGE_SIZE,
      page: debouncedSearch ? 1 : currentPage,
    });

  const rawPosts: PostItemType[] = data?.data || [];
  const meta = data?.meta;
  const categoryInfo = (data as any)?.category;

  // Determine chapterTitle from first post audio or fallback
  const chapterTitle =
    rawPosts.find((p) => p.audio?.chapterTitle)?.audio?.chapterTitle ||
    `Quyển ${chapterNumber}`;

  const categoryName = categoryInfo?.name || "Bạch Thoại Phật Pháp";
  const coverImage = getBookCoverImage(chapterNumber);

  // Transform posts to display items
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
        chapter: post.audio?.chapter,
        chapterTitle: post.audio?.chapterTitle,
      };
    });
  }, [rawPosts]);

  // Items to display (from server API)
  const filteredItems = displayItems;

  // Pagination helpers
  const totalPages = meta?.totalPages ?? (meta?.total ? Math.ceil(meta.total / PAGE_SIZE) : 1);
  const hasNextPage = Boolean(meta?.hasNextPage || (meta?.total && currentPage < totalPages));
  const hasPrevPage = currentPage > 1;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    router.replace(`/bach-thoai-phat-phap/quyen/${chapterNumber}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <Link
            href="/bach-thoai-phat-phap"
            className="transition-colors hover:text-amber-800"
          >
            Bạch thoại Phật pháp
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="font-semibold text-amber-900">
            Quyển {chapterNumber}
          </span>
        </nav>

        {/* 2. Back Button to Bookshelf */}
        <div>
          <Link
            href="/bach-thoai-phat-phap"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-900/10 bg-white/90 px-3.5 py-2 text-xs sm:text-sm font-semibold text-neutral-700 shadow-2xs backdrop-blur-xs transition hover:border-amber-300 hover:bg-amber-50/80 hover:text-amber-900"
          >
            <ArrowLeft className="h-4 w-4 text-amber-800" />
            <span>Quay lại danh sách Bạch Thoại Phật Pháp</span>
          </Link>
        </div>

        {/* 3. Chapter Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-900/10 bg-gradient-to-br from-[#3D2517] via-[#2A180E] to-[#1A0D07] p-5 sm:p-7 text-white shadow-md">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
            {/* 3D Book Thumbnail */}
            <div className="relative aspect-[3/4.1] w-28 sm:w-32 md:w-36 shrink-0 overflow-hidden rounded-r-lg shadow-xl shadow-black/50 border border-white/10 flex">
              <div className="relative flex h-full w-[14%] shrink-0 flex-col items-center justify-between border-r border-[#150B05] bg-gradient-to-r from-[#201208] via-[#3E2516] to-[#1D0F06] py-2">
                <span className="text-[7px] font-black uppercase tracking-widest text-[#D7AF5B] opacity-85 [writing-mode:vertical-rl] rotate-180">
                  QUYỂN {chapterNumber}
                </span>
              </div>
              <div className="relative flex h-full flex-1 flex-col justify-between overflow-hidden bg-[#2D1B10] p-2">
                <div className="relative z-10 text-center">
                  <span className="font-serif text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider text-[#F7E7CE] line-clamp-2 leading-tight block">
                    {categoryName}
                  </span>
                </div>
                <div className="absolute inset-x-1.5 bottom-1.5 h-[52%] z-0 flex items-center justify-center overflow-hidden rounded-sm">
                  <Image
                    src={coverImage}
                    alt={chapterTitle}
                    fill
                    className="object-contain object-bottom drop-shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Chapter Info */}
            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
                <span>BẠCH THOẠI PHẬT PHÁP</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">
                {chapterTitle}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-neutral-300">
                <span className="inline-flex items-center gap-1.5">
                  <Headphones className="h-4 w-4 text-amber-400" />
                  <span>{meta?.total || rawPosts.length} bài giảng audio</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Search Filter within this Chapter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm bài trong Quyển ${chapterNumber}...`}
              className="w-full rounded-2xl border border-amber-200/80 bg-white/90 py-2 pr-9 pl-10 text-sm text-neutral-800 placeholder-neutral-400 shadow-2xs outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200/60"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            <span>
              Hiển thị {filteredItems.length} bài
              {meta?.total ? ` (tổng số ${meta.total} bài)` : ""}
            </span>
          </div>
        </div>

        {/* 5. Post List */}
        {isLoading ? (
          <BachThoaiSkeleton count={PAGE_SIZE} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center sm:p-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 sm:text-lg">
              Không thể tải danh sách bài viết
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600">
              {(error as Error)?.message || "Vui lòng thử lại sau."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#EDE5D8] bg-white/70 p-12 text-center">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50 text-amber-800">
              <Sparkles className="h-7 w-7 text-amber-700" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 sm:text-lg">
              {searchQuery
                ? `Không có bài giảng nào khớp với "${searchQuery}"`
                : `Quyển ${chapterNumber} chưa có bài giảng nào`}
            </h3>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              {searchQuery
                ? "Vui lòng kiểm tra lại từ khóa tìm kiếm."
                : "Các bài giảng của quyển này sẽ sớm được cập nhật."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
              >
                <span>Xóa từ khóa tìm kiếm</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
              {filteredItems.map((item) => (
                <BachThoaiItem
                  key={item.id}
                  item={item}
                  searchQuery={searchQuery}
                  playlist={filteredItems}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={meta?.total}
                hasPrevPage={hasPrevPage}
                hasNextPage={hasNextPage}
                isFetching={isFetching}
                onPrevPage={() => handlePageChange(currentPage - 1)}
                onNextPage={() => handlePageChange(currentPage + 1)}
                onGoToPage={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
