"use client";

import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

import type { PostItemType } from "@/api/post/post.type";

export interface KinhSachItemProps {
  post: PostItemType;
  className?: string;
}

export const KinhSachItem: React.FC<KinhSachItemProps> = ({
  post,
  className = "",
}) => {
  const hasPdf = Boolean(post.attachment?.fileUrl || (post as any).fileUrl);
  const postUrl = `/kinh-sach/${encodeURIComponent(post.slug || post.id || "")}`;

  return (
    <Link
      href={postUrl}
      className={`group flex flex-col justify-between rounded-3xl border border-[#EDE5D8]/90 bg-white/95 p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 ${className}`}
    >
      <div className="space-y-3">
        {/* Thumbnail / Book Cover */}
        <div className="relative aspect-[3/4] max-h-52 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-900/10 shadow-2xs flex items-center justify-center">
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-amber-800 p-4 text-center">
              <BookOpen className="h-10 w-10 text-amber-600" />
              <span className="text-xs font-serif font-bold line-clamp-2">
                {post.title}
              </span>
            </div>
          )}

          {/* Sách Badge */}
          {hasPdf && (
            <div className="absolute top-2.5 right-2.5 rounded-full bg-amber-900/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-amber-100 shadow-xs flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Sách</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-amber-800 transition line-clamp-2">
            {post.title}
          </h3>
          {post.author?.name && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
              {post.author.name}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span className="font-semibold text-amber-800 group-hover:translate-x-0.5 transition flex items-center gap-1">
          <span>Mở đọc sách</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
        <span className="text-[11px] text-neutral-400">
          {hasPdf ? "Bản PDF gốc" : "Bài viết"}
        </span>
      </div>
    </Link>
  );
};
