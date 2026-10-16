"use client";

import { BookOpen, Eye, Volume2 } from "lucide-react";
import Link from "next/link";
import React from "react";

import type { PostItemType } from "@/api/post/post.type";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { stripHtml } from "@/lib/utils";

interface PostTableItemProps {
  post: PostItemType;
}

export const PostTableItem: React.FC<PostTableItemProps> = ({ post }) => {
  const isNormal = post.type === ContentType.NORMAL;
  const excerpt = post.content ? stripHtml(post.content) : "";

  const postUrl = post.category?.slug
    ? `/${post.category.slug}/${encodeURIComponent(post.slug || post.id)}`
    : `/${encodeURIComponent(post.slug || post.id)}`;

  return (
    <tr className="hover:bg-amber-50/40 transition-colors">
      {/* Title & Thumbnail */}
      <td className="py-3.5 px-4 max-w-xs">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-amber-900/10 bg-amber-50">
            <img
              src={post.thumbnailUrl || "/images/lotus-thumb.jpg"}
              alt={post.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/images/lotus-thumb.jpg";
              }}
            />
          </div>
          <div className="min-w-0">
            <Link
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
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
          <p className="line-clamp-2 text-xs text-neutral-600">{excerpt}</p>
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
        <Link href={postUrl} target="_blank" rel="noopener noreferrer">
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
};
