"use client";

import { BookOpen, Pencil, Trash2, Volume2 } from "lucide-react";
import Link from "next/link";
import React from "react";

import type { PostItemType } from "@/api/post/post.type";
import { BACH_THOAI_PHAT_PHAP_SLUG } from "@/constants";
import { ContentType } from "@/enums";
import { stripHtml } from "@/lib/utils";
import { isBachThoaiPhatPhap } from "../utils/content-type";
import { getCategoryBadgeStyle, getGroupBadgeStyle } from "../utils/color-badge";

interface PostTableItemProps {
  post: PostItemType;
  isBachThoaiTab?: boolean;
  onEdit: (post: PostItemType) => void;
  onDelete: (post: PostItemType) => void;
}

export const PostTableItem: React.FC<PostTableItemProps> = ({
  post,
  isBachThoaiTab = false,
  onEdit,
  onDelete,
}) => {
  const isNormal = post.type === ContentType.NORMAL;
  const excerpt = post.content ? stripHtml(post.content) : "";

  const isBachThoai =
    isBachThoaiTab ||
    post.category?.slug === "bach-thoai-phat-phap" ||
    post.category?.slug === BACH_THOAI_PHAT_PHAP_SLUG ||
    isBachThoaiPhatPhap(
      post.categoryId || post.category?.id,
      post.category?.slug,
      post.category?.name
    );

  const postUrl = post.category?.slug
    ? `/${post.category.slug}/${encodeURIComponent(post.slug || post.id)}`
    : `/${encodeURIComponent(post.slug || post.id)}`;

  const groupName = post.group?.name;
  const isUndefinedGroup =
    !groupName ||
    groupName.trim() === "" ||
    groupName.toLowerCase() === "undefined" ||
    groupName.toLowerCase() === "không xác định";

  const groupDisplayName = isUndefinedGroup ? "không xác định" : groupName;

  const categoryName = post.category?.name || "Chưa phân loại";

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
      <td className="py-3.5 px-4 min-w-[130px]">
        <span
          title={categoryName}
          className={`inline-block w-full max-w-[130px] rounded-md border px-2.5 py-1 text-xs font-medium text-center leading-normal cursor-default ${getCategoryBadgeStyle(
            post.category?.slug || post.category?.name
          )}`}
        >
          {categoryName}
        </span>
      </td>

      {/* Type */}
      <td className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">
        {isNormal ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            <BookOpen className="h-3 w-3 shrink-0" />
            <span>Bình thường</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800">
            <Volume2 className="h-3 w-3 shrink-0" />
            <span>Audio</span>
          </span>
        )}
      </td>

      {/* Group */}
      <td className="py-3.5 px-4 min-w-[170px]">
        <span
          title={groupDisplayName}
          className={`inline-block w-full max-w-[180px] rounded-md border px-2.5 py-1 text-xs font-medium text-center leading-normal cursor-default ${getGroupBadgeStyle(
            groupDisplayName
          )}`}
        >
          {groupDisplayName}
        </span>
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
        <div className="inline-flex items-center gap-1.5 justify-end">
          <button
            type="button"
            onClick={() => onEdit(post)}
            title="Chỉnh sửa bài viết"
            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 hover:border-amber-400 shadow-2xs cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5 text-amber-800" />
            <span>Sửa</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(post)}
            title="Xoá bài viết"
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/80 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 hover:border-red-300 shadow-2xs cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600" />
            <span>Xoá</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

