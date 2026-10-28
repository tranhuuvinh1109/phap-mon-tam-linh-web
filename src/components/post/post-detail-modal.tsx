"use client";

import { BookOpen, Calendar, Clock, Sparkles, Tag, User, Volume2, X } from "lucide-react";
import React, { useEffect } from "react";

import type { PostItemType } from "@/api/post/post.type";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { formatTime } from "@/lib/utils/format-time";

import { PostContentRenderer } from "./post-content-renderer";

interface PostDetailModalProps {
  post: PostItemType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  // Close on Escape key press & prevent background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  const isNormalPost = post.type === ContentType.NORMAL;
  const isAudioPost = post.type === ContentType.AUDIO;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-post-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#EDE5D8] bg-[#FAF7F0] shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EDE5D8] bg-white/95 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Badge */}
            {post.category?.name && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-800">
                <Tag className="h-3 w-3" />
                <span>{post.category.name}</span>
              </span>
            )}

            {/* Content Type Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isNormalPost
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : isAudioPost
                  ? "bg-sky-50 text-sky-800 border border-sky-200"
                  : "bg-neutral-100 text-neutral-700 border border-neutral-200"
              }`}
            >
              {isNormalPost ? (
                <>
                  <BookOpen className="h-3 w-3" />
                  <span>Bài đọc / Văn bản</span>
                </>
              ) : isAudioPost ? (
                <>
                  <Volume2 className="h-3 w-3" />
                  <span>Audio</span>
                </>
              ) : (
                <span>{post.type}</span>
              )}
            </span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 space-y-6">
          {/* Post Title */}
          <h2
            id="modal-post-title"
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {post.title}
          </h2>

          {/* Author and Date Meta Row */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#EDE5D8]/80 bg-white/70 p-3.5 sm:p-4">
            {post.author ? (
              <div className="flex items-center gap-3">
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="h-10 w-10 shrink-0 rounded-full border border-amber-200 object-cover shadow-2xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/lotus-thumb.jpg";
                    }}
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    {post.author.name}
                  </h4>
                  {post.author.bio && (
                    <p className="text-xs text-neutral-500 line-clamp-1">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Ban biên tập Phật Pháp</span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-3 text-xs text-neutral-500">
              {formattedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {post.audio?.duration && post.audio.duration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{formatTime(post.audio.duration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Banner (if available) */}
          {post.thumbnailUrl && (
            <div className="relative max-h-72 w-full overflow-hidden rounded-2xl border border-amber-900/10 bg-amber-50 shadow-xs">
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="w-full h-full max-h-72 object-cover object-center"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Main Rich Content Section */}
          <div className="rounded-2xl border border-[#EDE5D8]/90 bg-white p-5 sm:p-7 shadow-xs">
            <h3 className="mb-4 pb-2 border-b border-neutral-100 text-xs font-semibold tracking-wider text-amber-800 uppercase flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Nội dung bài viết</span>
            </h3>

            {/* Rich Content Renderer */}
            <PostContentRenderer content={post.content} category={post.category} post={post} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#EDE5D8] bg-white/95 px-5 py-3 sm:px-6">
          <p className="text-xs text-neutral-500 italic">
            Nam Mô A Di Đà Phật
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
