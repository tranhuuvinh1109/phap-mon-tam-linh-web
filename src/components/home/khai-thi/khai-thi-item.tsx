"use client";

import { ArrowRight, Calendar, Sparkles, User } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

import type { PostItemType } from "@/api/post/post.type";
import { getGroupBadgeStyle } from "@/lib/color-badge";
import { HighlightedText } from "@/lib/highlight";
import { stripHtml } from "@/lib/utils";

export interface KhaiThiItemProps {
  post: PostItemType;
  hideImage?: boolean;
  searchQuery?: string;
}

export const KhaiThiItem: React.FC<KhaiThiItemProps> = ({ post, searchQuery }) => {
  const basePostUrl = `/khai-thi/${encodeURIComponent(post.slug || post.id || "")}`;
  const postUrl = searchQuery?.trim()
    ? `${basePostUrl}?search=${encodeURIComponent(searchQuery.trim())}`
    : basePostUrl;

  // Extract clean plain text snippet from editor HTML/JSON content
  const snippet = useMemo(() => {
    if (!post.content) return "";
    const plain = stripHtml(post.content);
    return plain.length > 180 ? `${plain.slice(0, 180)}...` : plain;
  }, [post.content]);

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  const rawGroupName = post.group?.name;
  const isUndefinedGroup =
    !rawGroupName ||
    rawGroupName.toLowerCase() === "undefined" ||
    rawGroupName.toLowerCase() === "không xác định";
  const groupDisplayName = isUndefinedGroup ? "không xác định" : rawGroupName;
  const groupBadgeStyle = getGroupBadgeStyle(groupDisplayName);

  return (
    <Link
      href={postUrl}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EDE5D8]/90 bg-white/95 p-5 shadow-2xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md hover:bg-white cursor-pointer"
    >
      <div className="space-y-3">
        {/* Header: Group Badge & Date */}
        <div className="flex items-center justify-between gap-2">
          {/* Badge Group Name */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold border ${groupBadgeStyle}`}
          >
            <Sparkles className="h-3 w-3 opacity-70 shrink-0" />
            <span className="truncate max-w-[120px]">{groupDisplayName}</span>
          </span>

          {formattedDate && (
            <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-neutral-400" />
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug line-clamp-2 transition-colors group-hover:text-amber-800">
          <HighlightedText text={post.title} highlight={searchQuery} />
        </h4>

        {/* Snippet from Text Editor HTML / JSON */}
        {snippet ? (
          <p className="line-clamp-3 text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
            <HighlightedText text={snippet} highlight={searchQuery} />
          </p>
        ) : (
          <p className="text-xs text-neutral-400 italic">Chưa có trích dẫn nội dung.</p>
        )}
      </div>

      {/* Card Footer: Author and Read Action */}
      <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span className="truncate font-medium text-neutral-500 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-neutral-400" />
          <span>{post.author?.name || "Khai thị Phật pháp"}</span>
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 transition-all group-hover:translate-x-0.5 group-hover:text-amber-900 shrink-0">
          <span>Đọc bài</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
};

export const KhaiThiItemCard = KhaiThiItem;

