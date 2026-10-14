"use client";

import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  Music,
  Pause,
  Play,
  RefreshCw,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";

import { useGetPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { ContentType } from "@/enums";
import { formatTime, stripHtml } from "@/lib/utils";

import { PostContentRenderer } from "./post-content-renderer";
import { BACH_THOAI_PHAT_PHAP_ID } from "@/constants";
import { isNiemKinh } from "@/app/admin/post/utils/content-type";

interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  isBachThoai: boolean;
  posts: PostItemType[];
}

interface CategorizedPostsProps {
  className?: string;
  titleOverride?: string;
  isAdmin?: boolean;
  excludeBachThoai?: boolean;
  hideIfEmpty?: boolean;
}

export const CategorizedPosts: React.FC<CategorizedPostsProps> = ({
  className = "",
  excludeBachThoai = false,
  hideIfEmpty = false,
}) => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useGetPosts();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const posts: PostItemType[] = useMemo(() => {
    return data?.data || [];
  }, [data]);

  // Group posts by Category
  const groupedCategories = useMemo<CategoryGroup[]>(() => {
    if (!posts || posts.length === 0) return [];

    const groupMap = new Map<string, CategoryGroup>();

    posts.forEach((post) => {
      const cat = post.category;
      const catId = cat?.id || "uncategorized";
      const catName = cat?.name || "Danh mục khác";
      const catSlug = cat?.slug || "uncategorized";

      const isBachThoai =
        catId === BACH_THOAI_PHAT_PHAP_ID;

      if (excludeBachThoai && isBachThoai) {
        return;
      }

      if (!groupMap.has(catId)) {
        groupMap.set(catId, {
          id: catId,
          name: catName,
          slug: catSlug,
          isBachThoai,
          posts: [],
        });
      }

      groupMap.get(catId)!.posts.push(post);
    });

    // Sort to place "Bạch thoại Phật pháp" at the top if present
    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.isBachThoai && !b.isBachThoai) return -1;
      if (!a.isBachThoai && b.isBachThoai) return 1;
      return a.name.localeCompare(b.name, "vi");
    });
  }, [posts, excludeBachThoai]);

  // Play / Pause Audio Handler
  const handleTogglePlay = (post: PostItemType, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    const audioUrl = post.audio?.audioUrl;
    if (!audioUrl) return;

    if (playingId === post.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current
          .play()
          .then(() => setPlayingId(post.id))
          .catch((err) => {
            console.warn("Audio playback error:", err);
            setPlayingId(null);
          });
      }
    }
  };

  // Toggle inline expansion for content preview
  const handleToggleExpand = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Helper to format duration string
  const getDurationText = (post: PostItemType): string => {
    if (post.audio?.duration && post.audio.duration > 0) {
      return formatTime(post.audio.duration);
    }
    if (post.video?.duration && post.video.duration > 0) {
      return formatTime(post.video.duration);
    }
    return "--:--";
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="rounded-2xl border border-[#EDE5D8]/90 bg-white/90 p-4 shadow-xs">
          <div className="mb-4 h-6 w-44 animate-pulse rounded-lg bg-neutral-200/80" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2">
                <div className="flex items-center gap-3">
                  <div className="h-13 w-13 shrink-0 animate-pulse rounded-xl bg-neutral-200/80" />
                  <div className="space-y-2">
                    <div className="h-4 w-36 animate-pulse rounded-md bg-neutral-200/80" />
                    <div className="h-3 w-16 animate-pulse rounded-md bg-neutral-200/60" />
                  </div>
                </div>
                <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-neutral-200/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50/70 p-5 text-center ${className}`}>
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
        <h4 className="mt-2 text-sm font-semibold text-red-900">Không thể tải danh sách bài viết</h4>
        <p className="mt-1 text-xs text-red-600">
          {(error as any)?.message || "Vui lòng thử lại sau giây lát."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition hover:bg-red-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Thử lại
        </button>
      </div>
    );
  }

  // Empty State
  if (groupedCategories.length === 0) {
    if (hideIfEmpty) return null;
    return (
      <div className={`rounded-2xl border border-dashed border-[#EDE5D8] bg-white/70 p-8 text-center ${className}`}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <Music className="h-6 w-6" />
        </div>
        <h4 className="mt-3 text-sm font-semibold text-neutral-800">Chưa có bài viết nào</h4>
        <p className="mt-1 text-xs text-neutral-500">
          Các bài viết mới đăng tải sẽ xuất hiện tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hidden Audio Player instance */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
        className="hidden"
      />

      {groupedCategories.map((group) => (
        <section
          key={group.id}
          className="rounded-2xl border border-[#EDE5D8]/90 bg-white/90 p-3.5 shadow-2xs backdrop-blur-xs sm:rounded-3xl sm:p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 pb-3">
            {group.isBachThoai ? (
              <Link
                href="/bach-thoai-phat-phap"
                className="group/title flex items-center gap-1.5 transition hover:text-amber-800"
              >
                <h3 className="text-base font-bold text-neutral-900 group-hover/title:text-amber-800 sm:text-lg">
                  {group.name}
                </h3>
                <span className="text-xs font-semibold text-amber-700 hover:underline">
                  →
                </span>
              </Link>
            ) : (
              <h3 className="text-base font-bold text-neutral-900 sm:text-lg">
                {group.name}
              </h3>
            )}
            <span className="rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              {group.posts.length} bài
            </span>
          </div>


          {/* Items List */}
          <div className="space-y-3">
            {group.posts.map((post) => {
              const isCurrentPlaying = playingId === post.id;
              const hasAudio = !!post.audio?.audioUrl || post.type === ContentType.AUDIO;
              const isNormal = post.type === ContentType.NORMAL || (!hasAudio && !!post.content);
              const isExpanded = expandedPostIds.has(post.id);
              const plainContentSnippet = post.content ? stripHtml(post.content) : "";
              const postCategorySlug = post.category?.slug;
              const isNiemKinhPost = isNiemKinh(
                post.categoryId || post.category?.id,
                postCategorySlug,
                post.category?.name
              );
              const postUrl = isNiemKinhPost
                ? `/niem-kinh/${encodeURIComponent(post.slug || post.id)}`
                : postCategorySlug === "bach-thoai-phat-phap"
                ? `/bach-thoai-phat-phap/${encodeURIComponent(post.slug || post.id)}`
                : `/khai-thi/${encodeURIComponent(post.slug || post.id)}`;

              return (
                <div
                  key={post.id}
                  className={`group rounded-xl border border-neutral-100 p-2.5 transition-all duration-200 hover:border-amber-200 hover:bg-[#FAF4EB]/60 ${
                    isCurrentPlaying ? "bg-[#FAF2E6] ring-1 ring-amber-300/80" : "bg-white/80"
                  }`}
                >
                  {/* Top Row: Thumbnail + Main Info + Actions */}
                  <div
                    onClick={() => {
                      if (isNormal) {
                        router.push(postUrl);
                      }
                    }}
                    className={`flex items-start justify-between gap-3 ${
                      isNormal ? "cursor-pointer" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <Link
                      href={postUrl}
                      onClick={(e) => {
                        if (!isNormal && hasAudio) {
                          e.preventDefault();
                          handleTogglePlay(post);
                        }
                      }}
                      className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl border border-amber-900/10 bg-amber-50/50 mt-0.5 block"
                    >
                      <img
                        src={post.thumbnailUrl || "/images/lotus-thumb.jpg"}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/lotus-thumb.jpg";
                        }}
                      />
                    </Link>

                    {/* Middle Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={postUrl}
                          className="text-xs font-bold text-neutral-800 transition-colors group-hover:text-amber-900 sm:text-sm leading-snug line-clamp-2 hover:underline"
                        >
                          {post.title}
                        </Link>

                        {/* Content Type Badge */}
                        {isNormal ? (
                          <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                            Bài đọc
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200/60">
                            Audio
                          </span>
                        )}
                      </div>

                      {/* Excerpt Snippet (For NORMAL posts with HTML content) */}
                      {isNormal && plainContentSnippet && (
                        <p className="line-clamp-2 text-xs text-neutral-500 font-normal leading-relaxed">
                          {plainContentSnippet}
                        </p>
                      )}

                      {/* Meta line: Author & Audio duration */}
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        {post.author?.name && (
                          <span className="truncate text-amber-800/80 font-medium">
                            {post.author.name}
                          </span>
                        )}

                        {hasAudio && (
                          <div className="flex items-center gap-1">
                            <Volume2 className="h-3 w-3 shrink-0 text-neutral-400" />
                            <span>{getDurationText(post)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      {/* Audio Button */}
                      {hasAudio && (
                        <button
                          type="button"
                          onClick={(e) => handleTogglePlay(post, e)}
                          disabled={!post.audio?.audioUrl}
                          aria-label={isCurrentPlaying ? `Tạm dừng ${post.title}` : `Phát ${post.title}`}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                            isCurrentPlaying
                              ? "border-amber-700 bg-amber-600 text-white shadow-xs"
                              : "border-neutral-300/80 text-neutral-600 hover:border-amber-700 hover:bg-amber-600 hover:text-white"
                          }`}
                        >
                          {isCurrentPlaying ? (
                            <Pause className="h-3.5 w-3.5 fill-current" />
                          ) : (
                            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                          )}
                        </button>
                      )}

                      {/* Normal Post Reading Button: Redirects directly to /post/slug */}
                      {isNormal && (
                        <Link
                          href={postUrl}
                          onClick={(e) => e.stopPropagation()}
                          title="Đọc bài viết"
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-amber-300/80 bg-amber-50/80 px-2.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 hover:border-amber-400 shadow-2xs"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-amber-700" />
                          <span className="hidden sm:inline">Đọc bài</span>
                        </Link>
                      )}

                      {/* Quick Inline Expand Toggle */}
                      {post.content && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleExpand(post.id, e)}
                          title={isExpanded ? "Thu gọn nội dung" : "Xem nhanh nội dung"}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Collapsible Content Preview */}
                  {isExpanded && post.content && (
                    <div className="mt-3 pt-3 border-t border-amber-100/80 bg-white/90 rounded-xl p-3.5 text-xs sm:text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem nhanh nội dung</span>
                        </span>
                        <Link
                          href={postUrl}
                          className="text-[11px] font-semibold text-amber-700 hover:underline"
                        >
                          Đọc toàn bộ bài viết →
                        </Link>
                      </div>

                      <div className="max-h-60 overflow-y-auto pr-1">
                        <PostContentRenderer content={post.content} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
