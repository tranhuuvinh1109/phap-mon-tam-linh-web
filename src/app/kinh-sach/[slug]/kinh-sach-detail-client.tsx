"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookOpen,
  Calendar,
  Home,
  Loader2,
  Share2,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useGetPostBySlug } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { MainLayout } from "@/components/layout";
import { PostContentRenderer } from "@/components/post";
import { useFavoritesStore, useIsFavorite } from "@/stores";

// Dynamic import with ssr: false for Canvas & Browser-dependent StPageFlip
const PdfFlipbookReader = dynamic(
  () => import("@/components/flipbook").then((mod) => mod.PdfFlipbookReader),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 rounded-3xl border border-[#EDE5D8]/90 bg-[#F5EFEB]/90 p-8 text-neutral-500 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="text-sm font-semibold text-amber-950">
          Đang chuẩn bị trang kinh sách...
        </p>
      </div>
    ),
  }
);

export const KinhSachDetailClient: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";

  const { data: post, isLoading, isError, error, refetch } = useGetPostBySlug(slug);

  const [isCopied, setIsCopied] = useState(false);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const displayPost: PostItemType | null = post || null;
  const isBookmarked = useIsFavorite(displayPost?.id);

  // Determine PDF file URL from attachment relation or direct fileUrl
  const pdfUrl = useMemo(() => {
    if (!displayPost) return null;
    return displayPost.attachment?.fileUrl || (displayPost as any).fileUrl || null;
  }, [displayPost]);

  const handleToggleFavorite = () => {
    if (!displayPost) return;
    const isSaved = toggleFavorite({
      id: displayPost.id,
      title: displayPost.title,
      slug: displayPost.slug || displayPost.id,
      authorName: displayPost.author?.name || "Tác giả",
      categoryName: displayPost.category?.name || "Kinh Sách",
      thumbnailUrl: displayPost.thumbnailUrl || "/images/lotus-thumb.jpg",
      audioUrl: displayPost.audio?.audioUrl,
    });
    toast.success(
      isSaved
        ? "Đã lưu kinh sách vào danh sách yêu thích!"
        : "Đã gỡ kinh sách khỏi danh sách yêu thích!"
    );
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: displayPost?.title || "Kinh Sách Phật Giáo",
          text: `Đọc kinh sách: ${displayPost?.title || ""}`,
          url,
        });
        return;
      } catch {
        // user cancelled or share failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("Đã sao chép liên kết kinh sách!");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Không thể sao chép liên kết.");
    }
  };

  const formattedDate = useMemo(() => {
    if (!displayPost?.publishedAt && !displayPost?.createdAt) return null;
    const dateStr = displayPost.publishedAt || displayPost.createdAt;
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [displayPost]);

  return (
    <MainLayout activeId="kinh-sach">
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-amber-800 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <span>/</span>
          <Link
            href="/kinh-sach"
            className="hover:text-amber-800 transition-colors"
          >
            Kinh Sách
          </Link>
          <span>/</span>
          <span className="text-amber-900 font-semibold truncate max-w-xs sm:max-w-md">
            {displayPost?.title || "Chi tiết kinh sách"}
          </span>
        </nav>

        {/* Back and Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 transition-all cursor-pointer backdrop-blur-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>

          {displayPost && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleFavorite}
                title={isBookmarked ? "Bỏ lưu kinh sách" : "Lưu vào yêu thích"}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${isBookmarked
                    ? "border-amber-300 bg-amber-50 text-amber-900"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
              >
                <Bookmark
                  className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-600 text-amber-600" : ""
                    }`}
                />
                <span className="hidden sm:inline">
                  {isBookmarked ? "Đã lưu" : "Lưu sách"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                title="Chia sẻ kinh sách"
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-all cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[460px] gap-3 rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-8 shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <p className="text-sm font-semibold text-neutral-700">
              Đang tải kinh sách...
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[380px] gap-3 rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-2xs">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Không tìm thấy kinh sách
            </h3>
            <p className="text-xs text-neutral-600 max-w-md">
              {(error as Error)?.message ||
                "Tài liệu kinh sách này không tồn tại hoặc đã được chuyển sang địa chỉ khác."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 rounded-xl bg-amber-800 text-white px-4 py-2 text-xs font-semibold hover:bg-amber-900 transition-colors shadow-2xs cursor-pointer"
            >
              Thử tải lại
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {displayPost && !isLoading && !isError && (
          <div className="space-y-6">
            {/* 1. PDF Flipbook Reader */}
            {pdfUrl ? (
              <PdfFlipbookReader
                fileUrl={pdfUrl}
                bookTitle={displayPost.title}
                authorName={displayPost.author?.name || undefined}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[260px] gap-2.5 rounded-3xl border border-amber-200/80 bg-amber-50/50 p-6 text-center">
                <BookOpen className="h-8 w-8 text-amber-700" />
                <h4 className="text-sm font-bold text-amber-950">
                  Tài liệu chưa có tệp PDF đính kèm
                </h4>
                <p className="text-xs text-neutral-500">
                  Bài viết này chưa được đính kèm bản PDF.
                </p>
              </div>
            )}

            {/* 2. Written Content / Commentary (if post has content) */}
            {displayPost.content && (
              <article className="overflow-hidden rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 text-xs font-bold uppercase tracking-wider text-amber-850">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Lời giới thiệu / Giảng giải chi tiết</span>
                </div>
                <PostContentRenderer content={displayPost.content} />
              </article>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
