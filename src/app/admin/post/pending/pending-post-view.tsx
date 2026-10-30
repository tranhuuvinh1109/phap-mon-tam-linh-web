"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { useGetPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { stripHtml } from "@/lib/utils";
import { PostDetailModal } from "@/components/post/post-detail-modal";
import { ApprovePostModal } from "../components/approve-post-modal";
import { RejectPostModal } from "../components/reject-post-modal";
import { getCategoryBadgeStyle, getGroupBadgeStyle } from "../utils/color-badge";

const PAGE_SIZE = 15;

export const PendingPostView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [previewPost, setPreviewPost] = useState<PostItemType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [approvingPost, setApprovingPost] = useState<PostItemType | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

  const [rejectingPost, setRejectingPost] = useState<PostItemType | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Query parameters: Filter specifically by status = PENDING
  const queryParams = useMemo(() => {
    return {
      status: "PENDING" as const,
      page: currentPage,
      limit: PAGE_SIZE,
      search: searchQuery.trim() || undefined,
    };
  }, [currentPage, searchQuery]);

  const { data, isLoading, isFetching, refetch } = useGetPosts(queryParams);

  const posts: PostItemType[] = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const total = data?.meta?.total ?? posts.length;
  const totalPages =
    data?.meta?.totalPages || Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleOpenPreview = (post: PostItemType) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  const handleOpenApprove = (post: PostItemType) => {
    setApprovingPost(post);
    setIsApproveOpen(true);
  };

  const handleOpenReject = (post: PostItemType) => {
    setRejectingPost(post);
    setIsRejectOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EDE5D8]/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Bài viết chờ duyệt
            </h1>
            {total > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-600 px-2 text-xs font-bold text-white shadow-xs">
                {total}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Danh sách các bài viết đang chờ quản trị viên kiểm tra nội dung và phê duyệt xuất bản.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold border-[#EDE5D8] hover:bg-[#FAF7F0] shadow-2xs"
          >
            <RefreshCw
              className={`h-4 w-4 text-amber-700 ${
                isFetching ? "animate-spin" : ""
              }`}
            />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Toolbar: Search input */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#EDE5D8]/90 bg-white/90 p-3.5 shadow-2xs backdrop-blur-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, slug, nội dung..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-9 pr-8 py-2 text-xs sm:text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 cursor-pointer"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-neutral-500 font-medium">
          Tìm thấy <strong className="text-amber-950 font-bold">{total}</strong> bài viết chờ duyệt
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[#EDE5D8]/90 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#EDE5D8] bg-[#FAF7F0]/80 text-neutral-600 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 min-w-[220px]">Bài viết</th>
                <th className="py-3 px-4 min-w-[130px] w-[130px]">Danh mục</th>
                <th className="py-3 px-4 min-w-[100px] w-[100px]">Loại</th>
                <th className="py-3 px-4 min-w-[140px] w-[140px]">Nhóm</th>
                <th className="py-3 px-4 min-w-[130px] w-[130px]">Xác minh nguồn</th>
                <th className="py-3 px-4 min-w-[100px] w-[100px]">Ngày gửi</th>
                <th className="py-3 px-4 text-right min-w-[220px] w-[220px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE5D8]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-800 border-t-transparent" />
                      <span>Đang tải danh sách bài viết chờ duyệt...</span>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 mb-3">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-800">
                        Không có bài viết nào đang chờ duyệt
                      </h4>
                      <p className="mt-1 text-xs text-neutral-500">
                        Tất cả các bài viết đã được duyệt hoặc chưa có bài viết mới được gửi lên.
                      </p>
                      <Link
                        href="/admin/post"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Xem tất cả bài viết</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const isNormal = post.type === ContentType.NORMAL;
                  const excerpt = post.content ? stripHtml(post.content) : "";
                  const categoryName = post.category?.name || "Chưa phân loại";
                  const groupName = post.group?.name || "không xác định";

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-amber-50/40 transition-colors"
                    >
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
                            <span className="font-bold text-neutral-900 truncate block">
                              {post.title}
                            </span>
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
                      <td className="py-3.5 px-4 min-w-[100px] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                          {isNormal ? "Bình thường" : "Audio"}
                        </span>
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <span
                          title={groupName}
                          className={`inline-block w-full max-w-[140px] rounded-md border px-2.5 py-1 text-xs font-medium text-center leading-normal cursor-default ${getGroupBadgeStyle(
                            groupName
                          )}`}
                        >
                          {groupName}
                        </span>
                      </td>

                      {/* Verified from origin */}
                      <td className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">
                        {post.isVerifiedFromOrigin ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Đã xác minh</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>Chưa xác minh</span>
                          </span>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="py-3.5 px-4 text-xs text-neutral-500 whitespace-nowrap">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Preview button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(post)}
                            title="Xem trước nội dung bài viết"
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900 shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-neutral-600" />
                            <span>Xem trước</span>
                          </button>

                          {/* Accept button */}
                          <button
                            type="button"
                            onClick={() => handleOpenApprove(post)}
                            title="Phê duyệt bài viết"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 hover:border-emerald-400 shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Duyệt</span>
                          </button>

                          {/* Reject button */}
                          <button
                            type="button"
                            onClick={() => handleOpenReject(post)}
                            title="Từ chối bài viết"
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 hover:border-rose-300 shadow-2xs cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-[#EDE5D8] bg-[#FBF9F4] text-xs text-neutral-600">
            <div>
              <span>
                Hiển thị{" "}
                <strong className="text-neutral-900 font-bold">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </strong>{" "}
                -{" "}
                <strong className="text-neutral-900 font-bold">
                  {Math.min(currentPage * PAGE_SIZE, total)}
                </strong>{" "}
                trên tổng số{" "}
                <strong className="text-neutral-900 font-bold">{total}</strong> bài viết chờ duyệt
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="h-8 px-2.5 text-xs font-semibold rounded-xl border-[#EDE5D8] hover:bg-white disabled:opacity-40"
              >
                Trước
              </Button>
              <span className="px-2 text-xs font-semibold text-neutral-800">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="h-8 px-2.5 text-xs font-semibold rounded-xl border-[#EDE5D8] hover:bg-white disabled:opacity-40"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <PostDetailModal
        post={previewPost}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewPost(null);
        }}
      />

      {/* Approve Modal */}
      <ApprovePostModal
        post={approvingPost}
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false);
          setApprovingPost(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Reject Modal */}
      <RejectPostModal
        post={rejectingPost}
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setRejectingPost(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};
