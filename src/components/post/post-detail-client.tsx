"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  Home,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Share2,
  Sparkles,
  Tag,
  User,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import { useGetPostBySlug } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { isBachThoaiPhatPhapCategory } from "@/app/admin/post/utils/content-type";
import { MainLayout } from "@/components/layout";
import {
  BachThoaiAudioPlayer,
  CategorizedPosts,
  PostContentRenderer,
  PdfViewer,
} from "@/components/post";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { formatTime } from "@/lib/utils";
import { useEvent } from "@/hooks";
import { useAudioPlayerStore, useFavoritesStore, useIsFavorite } from "@/stores";

export const PostDetailClient: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";

  const { data: post, isLoading, isError, error, refetch } = useGetPostBySlug(slug);

  const [isCopied, setIsCopied] = useState(false);

  // Global Audio Store
  const currentTrack = useAudioPlayerStore((s) => s.currentTrack);
  const isGlobalPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const playTrack = useAudioPlayerStore((s) => s.playTrack);
  const togglePlay = useAudioPlayerStore((s) => s.togglePlay);

  // Favorites Store
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayPost: PostItemType | null = post || null;

  // Track Post Interactions (VIEW on mount, READ after 10s)
  useEvent(displayPost?.id);

  const isBookmarked = useIsFavorite(displayPost?.id);

  // Check if post belongs to Bạch thoại Phật pháp
  const isBachThoai = displayPost ? isBachThoaiPhatPhapCategory(displayPost) : false;
  const isCurrentPostPlaying =
    displayPost && currentTrack?.id === displayPost.id && isGlobalPlaying;

  const toggleAudio = () => {
    if (!displayPost?.audio?.audioUrl) return;

    if (currentTrack?.id === displayPost.id) {
      togglePlay();
    } else {
      playTrack({
        id: displayPost.id,
        title: displayPost.title,
        slug: displayPost.slug || displayPost.id,
        authorName: displayPost.author?.name || "Tác giả",
        categoryName: displayPost.category?.name || "Audio Phật pháp",
        thumbnailUrl: displayPost.thumbnailUrl || "/images/lotus-thumb.jpg",
        audioUrl: displayPost.audio.audioUrl,
        duration: displayPost.audio.duration || undefined,
      });
    }
  };

  const handleToggleFavorite = () => {
    if (!displayPost) return;
    const isSaved = toggleFavorite({
      id: displayPost.id,
      title: displayPost.title,
      slug: displayPost.slug || displayPost.id,
      authorName: displayPost.author?.name || "Tác giả",
      categoryName: displayPost.category?.name || "Bạch thoại Phật pháp",
      thumbnailUrl: displayPost.thumbnailUrl || "/images/lotus-thumb.jpg",
      audioUrl: displayPost.audio?.audioUrl,
      duration: displayPost.audio?.duration || undefined,
      type: displayPost.type,
    });
    setToastMessage(
      isSaved
        ? "Đã lưu vào danh sách yêu thích!"
        : "Đã xóa khỏi danh sách yêu thích!"
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formattedDate = displayPost?.createdAt
    ? new Date(displayPost.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : null;

  const currentCategorySlug = useMemo(() => {
    if (displayPost?.category?.slug) return displayPost.category.slug;
    if (pathname?.includes("/ngoi-nha-nho")) return "ngoi-nha-nho";
    if (pathname?.includes("/khai-thi")) return "khai-thi";
    if (pathname?.includes("/niem-kinh")) return "niem-kinh";
    return "bach-thoai-phat-phap";
  }, [pathname, displayPost?.category?.slug]);

  const categoryName = useMemo(() => {
    if (displayPost?.category?.name) return displayPost.category.name;
    if (currentCategorySlug === "ngoi-nha-nho") return "Ngôi Nhà Nhỏ";
    if (currentCategorySlug === "khai-thi") return "Khai thị";
    if (currentCategorySlug === "niem-kinh") return "Niệm kinh";
    return "Bạch thoại Phật pháp";
  }, [displayPost?.category?.name, currentCategorySlug]);

  const categoryHref = `/${currentCategorySlug}`;
  const activeNavId =
    currentCategorySlug === "bach-thoai-phat-phap"
      ? "bach-thoai"
      : currentCategorySlug === "niem-kinh"
      ? "practice"
      : currentCategorySlug;

  return (
    <MainLayout activeId={activeNavId}>
      <div className="flex flex-col items-start gap-6 xl:flex-row">
        {/* Center Main Stream: BachThoaiAudioPlayer or Standard Article */}
        <div className="w-full min-w-0 flex-1 space-y-5">
          {/* Top Navigation & Breadcrumb */}
          <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#EDE5D8] bg-white/90 px-3.5 py-2 font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-amber-800 shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại</span>
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 truncate">
              <Link href="/" className="hover:text-amber-700 flex items-center gap-1">
                <Home className="h-3 w-3" />
                <span>Trang chủ</span>
              </Link>
              <span>/</span>
              {(displayPost?.category?.name || categoryName) && (
                <>
                  <Link
                    href={categoryHref}
                    className="text-amber-800 font-medium hover:underline"
                  >
                    {displayPost?.category?.name || categoryName}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="truncate max-w-[180px] sm:max-w-xs text-neutral-400">
                {displayPost?.title || slug}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && !displayPost && (
            <div className="rounded-3xl border border-[#EDE5D8]/90 bg-white/90 p-8 sm:p-12 text-center shadow-xs">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
              <p className="mt-3 text-sm font-medium text-neutral-600">
                Đang tải nội dung bài viết...
              </p>
            </div>
          )}

          {/* Error State when post cannot be found */}
          {isError && !displayPost && (
            <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center shadow-xs">
              <AlertCircle className="mx-auto h-9 w-9 text-red-500" />
              <h3 className="mt-3 text-base font-bold text-red-900">
                Không tìm thấy bài viết
              </h3>
              <p className="mt-1 text-xs text-red-600">
                {(error as any)?.message ||
                  "Bài viết không tồn tại hoặc đã được gỡ bỏ."}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-100 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-200 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Thử lại</span>
                </button>
                <Link href="/">
                  <Button variant="outline" className="text-xs px-4 py-2 rounded-xl">
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 3. CASE A: BachThoaiAudioPlayer EMBEDDED IN MAIN CONTENT */}
          {displayPost && isBachThoai && (
            <div className="space-y-6">
              {/* Embedded Bach Thoai Audio Player */}
              <BachThoaiAudioPlayer
                post={displayPost}
                onBack={() => router.back()}
              />

              {/* If the post contains an attached PDF document */}
              {displayPost.attachment?.fileUrl && (
                <div className="pt-2">
                  <PdfViewer
                    fileUrl={displayPost.attachment.fileUrl}
                    fileName={
                      displayPost.attachment.fileName || displayPost.title
                    }
                    fileSize={displayPost.attachment.fileSize}
                    slug={displayPost.slug}
                  />
                </div>
              )}

              {/* If the post also contains written text/HTML content */}
              {displayPost.content && (
                <div className="rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-6 sm:p-8 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <BookOpen className="h-4 w-4" />
                    <span>Nội dung bài viết / Lời thoại</span>
                  </h3>
                  <PostContentRenderer content={displayPost.content} />
                </div>
              )}
            </div>
          )}

          {/* 4. CASE B: STANDARD ARTICLE VIEW FOR NON-BACH THOAI POSTS */}
          {displayPost && !isBachThoai && (
            <article className="overflow-hidden rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-5 shadow-xs sm:p-8 space-y-6">
              {/* Category & Type Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {displayPost.category?.name && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      <Tag className="h-3 w-3" />
                      <span>{displayPost.category.name}</span>
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${displayPost.type === ContentType.NORMAL
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-sky-50 text-sky-800 border border-sky-200"
                      }`}
                  >
                    {displayPost.type === ContentType.NORMAL ? (
                      <>
                        <BookOpen className="h-3 w-3" />
                        <span>Bài viết</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" />
                        <span>Audio</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Action buttons: Bookmark & Share */}
                <div className="flex items-center gap-2">
                  {/* Bookmark button */}
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    title={isBookmarked ? "Bỏ lưu bài viết" : "Lưu vào bài viết yêu thích"}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${isBookmarked
                      ? "border-amber-300 bg-amber-50 text-amber-850 shadow-2xs"
                      : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                  >
                    <Bookmark
                      className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-600 text-amber-600" : ""
                        }`}
                    />
                    <span>{isBookmarked ? "Đã lưu" : "Lưu bài viết"}</span>
                  </button>

                  {/* Share button */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>{isCopied ? "Đã sao chép!" : "Chia sẻ"}</span>
                  </button>
                </div>
              </div>

              {/* Article Title */}
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-snug"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {displayPost.title}
              </h1>

              {/* Author Meta Box */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#EDE5D8]/80 bg-[#FAF7F0]/70 p-4">
                {displayPost.author ? (
                  <div className="flex items-center gap-3">
                    {displayPost.author.avatarUrl ? (
                      <img
                        src={displayPost.author.avatarUrl}
                        alt={displayPost.author.name}
                        className="h-11 w-11 shrink-0 rounded-full border border-amber-200 object-cover shadow-2xs"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/images/lotus-thumb.jpg";
                        }}
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        {displayPost.author.name}
                      </h3>
                      {displayPost.author.bio && (
                        <p className="text-xs text-neutral-500 line-clamp-1">
                          {displayPost.author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Ban biên tập Phật Pháp</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  {formattedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {displayPost.audio?.duration && displayPost.audio.duration > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{formatTime(displayPost.audio.duration)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio Player Card (If standard post has audio) */}
              {displayPost.audio?.audioUrl && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-xs transition hover:bg-amber-700 cursor-pointer"
                    >
                      {isCurrentPostPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="ml-0.5 h-4 w-4 fill-current" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 sm:text-sm">
                        {isCurrentPostPlaying ? "Đang phát bài giảng..." : "Nghe thuyết giảng"}
                      </h4>
                      <span className="text-[11px] text-amber-800/80">
                        {displayPost.audio.duration ? formatTime(displayPost.audio.duration) : "Audio"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Featured Thumbnail */}
              {displayPost.thumbnailUrl && (
                <div className="relative max-h-96 w-full overflow-hidden rounded-2xl border border-amber-900/10 bg-amber-50 shadow-xs">
                  <img
                    src={displayPost.thumbnailUrl}
                    alt={displayPost.title}
                    className="w-full max-h-96 object-cover object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* PDF Document Viewer (Secure / Prevent Download) */}
              {displayPost.attachment?.fileUrl && (
                <div className="pt-2">
                  <PdfViewer
                    fileUrl={displayPost.attachment.fileUrl}
                    fileName={
                      displayPost.attachment.fileName || displayPost.title
                    }
                    fileSize={displayPost.attachment.fileSize}
                    slug={displayPost.slug}
                  />
                </div>
              )}

              {/* Article HTML Content */}
              {displayPost.content && (
                <div className="pt-2">
                  <PostContentRenderer content={displayPost.content} />
                </div>
              )}

              {/* Bottom Footer Note */}
              <div className="border-t border-[#EDE5D8] pt-6 text-center text-xs italic text-neutral-400">
                Nguyện đem công đức này, hướng về khắp tất cả. Đệ tử và chúng sanh, đều trọn thành Phật đạo.
              </div>
            </article>
          )}
        </div>

      </div>

      {/* Toast Alert */}
      {(isCopied || toastMessage) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900/90 text-white border border-neutral-700 px-4 py-2 text-xs font-semibold shadow-xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage || "Đã sao chép liên kết bài viết!"}
        </div>
      )}
    </MainLayout>
  );
};
