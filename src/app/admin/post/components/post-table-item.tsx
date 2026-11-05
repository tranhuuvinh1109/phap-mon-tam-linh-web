"use client";

import {
  BookOpen,
  CheckCircle2,
  Clock,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Volume2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import type { PostItemType } from "@/api/post/post.type";
import { BACH_THOAI_PHAT_PHAP_SLUG, KHAI_THI_SLUG } from "@/constants";
import { ContentType } from "@/enums";
import { stripHtml } from "@/lib/utils";
import { isBachThoaiPhatPhap, isKhaiThi } from "../utils/content-type";
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
      post.category?.name,
      post.category?.parentId
    );

  const isKhaiThiPost = Boolean(
    isKhaiThi(
      post.categoryId || post.category?.id,
      post.category?.slug,
      post.category?.name,
      post.category?.parentId || post.category?.parent?.id
    ) ||
      (post.category?.parent?.slug &&
        (post.category.parent.slug === KHAI_THI_SLUG ||
          post.category.parent.slug.includes("khai-thi"))) ||
      (post.category?.parent?.name &&
        post.category.parent.name.toLowerCase().includes("khai thị"))
  );

  const postSlug = encodeURIComponent(post.slug || post.id);

  let postUrl = `/${postSlug}`;
  if (isKhaiThiPost) {
    postUrl = `/khai-thi/${postSlug}`;
  } else if (isBachThoai) {
    postUrl = `/bach-thoai-phat-phap/${postSlug}`;
  } else if (post.category?.slug) {
    postUrl = `/${post.category.slug}/${postSlug}`;
  } else {
    postUrl = `/post/${postSlug}`;
  }

  const groupName = post.group?.name;
  const isUndefinedGroup =
    !groupName ||
    groupName.trim() === "" ||
    groupName.toLowerCase() === "undefined" ||
    groupName.toLowerCase() === "không xác định";

  const groupDisplayName = isUndefinedGroup ? "không xác định" : groupName;

  const categoryName = post.category?.name || "Chưa phân loại";
  const parentCategoryName = post.category?.parent?.name;

  const defaultThumbnail = isBachThoai
    ? "/images/bach-thoai-phat-phap.png"
    : "/images/lotus-thumb.jpg";

  return (
    <tr className="hover:bg-amber-50/40 transition-colors">
      {/* Title & Thumbnail */}
      <td className="py-3.5 px-4 min-w-[220px] max-w-[280px]">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-amber-900/10 bg-amber-50">
            <img
              src={post.thumbnailUrl || defaultThumbnail}
              alt={post.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultThumbnail;
              }}
            />
          </div>
          <div className="min-w-0 max-w-[220px]">
            <Link
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={post.title}
              className="font-bold text-neutral-900 line-clamp-2 block hover:text-amber-800 hover:underline"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {post.title}
            </Link>
            <span
              className="text-[11px] text-neutral-400 font-mono block truncate"
              title={post.slug}
            >
              {post.slug}
            </span>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3.5 px-4 min-w-[150px]">
        {post.category ? (
          parentCategoryName ? (
            <div
              className="flex flex-col items-center gap-0.5"
              title={`${parentCategoryName} › ${post.category.name}`}
            >
              <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[150px] flex items-center gap-1">
                <span className="text-[9px]">📁</span> {parentCategoryName}
              </span>
              <span
                className={`inline-block w-full max-w-[150px] rounded-md border px-2 py-0.5 text-xs font-semibold text-center leading-normal cursor-default ${getCategoryBadgeStyle(
                  post.category?.slug || post.category?.name
                )}`}
              >
                ↳ {post.category.name}
              </span>
            </div>
          ) : (
            <span
              title={categoryName}
              className={`inline-block w-full max-w-[150px] rounded-md border px-2.5 py-1 text-xs font-semibold text-center leading-normal cursor-default ${getCategoryBadgeStyle(
                post.category?.slug || post.category?.name
              )}`}
            >
              {categoryName}
            </span>
          )
        ) : (
          <span className="inline-block w-full max-w-[150px] rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-center text-neutral-400">
            Chưa phân loại
          </span>
        )}
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

      {/* Approval Status */}
      <td className="py-3.5 px-4 min-w-[125px] whitespace-nowrap">
        {post.status === "APPROVED" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Đã duyệt</span>
          </span>
        ) : post.status === "REJECTED" ? (
          <span
            title={post.rejectReason ? `Lý do: ${post.rejectReason}` : "Đã bị từ chối"}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-2xs cursor-help"
          >
            <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span>Từ chối</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>Chờ duyệt</span>
          </span>
        )}
      </td>

      {/* Verified from Origin */}
      <td className="py-3.5 px-4 min-w-[135px] whitespace-nowrap">
        {post.isVerifiedFromOrigin ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Đã xác minh</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-500">
            <ShieldAlert className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <span>Chưa xác minh</span>
          </span>
        )}
      </td>

      {/* Content Excerpt */}
      <td className="py-3.5 px-4 min-w-[220px] max-w-[320px] w-[260px]">
        <div className="w-full max-w-[280px]">
          {excerpt ? (
            <p
              title={excerpt}
              className="text-xs text-neutral-600 leading-relaxed line-clamp-2"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {excerpt}
            </p>
          ) : (
            <span className="text-xs text-neutral-400 italic">
              Không có nội dung text
            </span>
          )}
        </div>
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

