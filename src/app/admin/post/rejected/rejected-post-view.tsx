"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { useDeletePost, useGetPosts } from "@/api/post";
import type { PostItemType } from "@/api/post/post.type";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { stripHtml } from "@/lib/utils";
import { PostDetailModal } from "@/components/post/post-detail-modal";
import { ApprovePostModal } from "../components/approve-post-modal";
import { ConfirmModal } from "../components/confirm-modal";
import { UpdatePostModal } from "../components/update-post-modal";
import {
  BACH_THOAI_DEFAULT_THUMBNAIL,
  BACH_THOAI_PHAT_PHAP_SLUG,
  DEFAULT_POST_THUMBNAIL,
  KHAI_THI_DEFAULT_THUMBNAIL,
  KHAI_THI_SLUG,
} from "@/constants";
import { isBachThoaiPhatPhap, isKhaiThi } from "../utils/content-type";
import { getCategoryBadgeStyle } from "../utils/color-badge";

const PAGE_SIZE = 15;

export const RejectedPostView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [previewPost, setPreviewPost] = useState<PostItemType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [approvingPost, setApprovingPost] = useState<PostItemType | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

  const [editingPost, setEditingPost] = useState<PostItemType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deletingPost, setDeletingPost] = useState<PostItemType | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Query parameters: Filter specifically by status = REJECTED
  const queryParams = useMemo(() => {
    return {
      status: "REJECTED" as const,
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

  // Delete mutation
  const deletePostMutation = useDeletePost({
    onSuccess: () => {
      toast.success("Đã xoá bài viết thành công!");
      setIsDeleteOpen(false);
      setDeletingPost(null);
      refetch();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Xoá bài viết thất bại.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const handleOpenPreview = (post: PostItemType) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  const handleOpenApprove = (post: PostItemType) => {
    setApprovingPost(post);
    setIsApproveOpen(true);
  };

  const handleOpenEdit = (post: PostItemType) => {
    setEditingPost(post);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (post: PostItemType) => {
    setDeletingPost(post);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EDE5D8]/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Bài viết đã từ chối
            </h1>
            {total > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-neutral-700 px-2 text-xs font-bold text-white shadow-xs">
                {total}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Danh sách các bài viết đã bị từ chối phê duyệt. Bạn có thể xem lý do, chỉnh sửa để duyệt lại hoặc xóa bài.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold border-[#EDE5D8] hover:bg-[#FAF7F0] shadow-2xs cursor-pointer"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#EDE5D8]/90 bg-white/90 p-3.5 shadow-2xs backdrop-blur-xs w-full max-w-full min-w-0">
        <div className="relative w-full sm:w-96 max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, slug, nội dung..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-9 pr-8 py-2 text-base sm:text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
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
          Tìm thấy <strong className="text-amber-950 font-bold">{total}</strong> bài viết đã từ chối
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full max-w-full overflow-hidden rounded-2xl border border-[#EDE5D8]/90 bg-white shadow-2xs">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#EDE5D8] bg-[#FAF7F0]/80 text-neutral-600 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 min-w-[220px]">Bài viết</th>
                <th className="py-3 px-3 w-[120px] min-w-[110px]">Danh mục</th>
                <th className="py-3 px-3 w-[85px] min-w-[75px]">Loại</th>
                <th className="py-3 px-3 min-w-[180px]">Lý do từ chối</th>
                <th className="py-3 px-3 w-[100px] min-w-[90px]">Thời gian</th>
                <th className="py-3 px-4 text-right w-[230px] min-w-[220px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE5D8]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-800 border-t-transparent" />
                      <span>Đang tải danh sách bài viết đã từ chối...</span>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 mb-3">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-800">
                        Không có bài viết nào bị từ chối
                      </h4>
                      <p className="mt-1 text-xs text-neutral-500">
                        Hiện tại không có bài viết nào ở trạng thái từ chối.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const categoryName = post.category?.name || "Chưa phân loại";
                  const isNormal = post.type === ContentType.NORMAL;
                  const isAudio = post.type === ContentType.AUDIO;

                  let dateStr = "";
                  try {
                    const d = new Date(post.updatedAt || post.createdAt);
                    dateStr = d.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                  } catch {
                    dateStr = "N/A";
                  }

                  const snippet = stripHtml(
                    typeof post.content === "string" ? post.content : ""
                  ).slice(0, 110);

                  const isBachThoai =
                    post.category?.slug === "bach-thoai-phat-phap" ||
                    post.category?.slug === BACH_THOAI_PHAT_PHAP_SLUG ||
                    isBachThoaiPhatPhap(
                      post.categoryId || post.category?.id,
                      post.category?.slug,
                      post.category?.name,
                      post.category?.parentId || post.category?.parent?.id
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
                  const defaultThumbnail = isBachThoai
                    ? BACH_THOAI_DEFAULT_THUMBNAIL
                    : isKhaiThiPost
                    ? KHAI_THI_DEFAULT_THUMBNAIL
                    : DEFAULT_POST_THUMBNAIL;
                  const thumbnailSrc =
                    post.thumbnailUrl && post.thumbnailUrl !== DEFAULT_POST_THUMBNAIL
                      ? post.thumbnailUrl
                      : isBachThoai || isKhaiThiPost
                      ? defaultThumbnail
                      : null;

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-[#FAF7F0]/40 transition-colors"
                    >
                      {/* Post info & thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          {thumbnailSrc ? (
                            <img
                              src={thumbnailSrc}
                              alt={post.title}
                              className="h-12 w-12 shrink-0 rounded-xl object-cover border border-[#EDE5D8] shadow-2xs"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = defaultThumbnail;
                              }}
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 border border-neutral-200">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}

                          <div className="min-w-0 space-y-0.5">
                            <h3
                              onClick={() => handleOpenPreview(post)}
                              title={post.title}
                              className="font-semibold text-neutral-900 line-clamp-1 hover:text-amber-800 cursor-pointer transition-colors"
                            >
                              {post.title}
                            </h3>
                            <p className="text-[11px] font-mono text-neutral-400 truncate max-w-xs">
                              /{post.slug}
                            </p>
                            {snippet && (
                              <p className="text-xs text-neutral-500 line-clamp-1">
                                {snippet}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block max-w-[130px] truncate rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getCategoryBadgeStyle(
                            categoryName
                          )}`}
                          title={categoryName}
                        >
                          {categoryName}
                        </span>
                      </td>

                      {/* Content Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                            isNormal
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : isAudio
                              ? "bg-sky-50 text-sky-800 border-sky-200"
                              : "bg-neutral-100 text-neutral-700 border-neutral-200"
                          }`}
                        >
                          {isNormal ? "Văn bản" : isAudio ? "Audio" : post.type}
                        </span>
                      </td>

                      {/* Reject Reason */}
                      <td className="py-3 px-3">
                        <div className="max-w-sm">
                          {post.rejectReason ? (
                            <div
                              title={post.rejectReason}
                              className="inline-flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50/90 px-2.5 py-1.5 text-xs text-rose-900 shadow-2xs"
                            >
                              <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-2 leading-relaxed">
                                {post.rejectReason}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400 italic">
                              Không có lý do cụ thể
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs text-neutral-500">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(post)}
                            title="Xem chi tiết nội dung"
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-amber-900 shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Xem</span>
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(post)}
                            title="Chỉnh sửa nội dung & duyệt lại"
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 hover:border-amber-400 shadow-2xs cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-amber-700" />
                            <span>Sửa</span>
                          </button>

                          {/* Re-approve button */}
                          <button
                            type="button"
                            onClick={() => handleOpenApprove(post)}
                            title="Phê duyệt xuất bản bài viết"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 hover:border-emerald-400 shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Duyệt lại</span>
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(post)}
                            title="Xoá bài viết"
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 hover:border-rose-300 shadow-2xs cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            <span className="sr-only">Xoá</span>
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
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EDE5D8] px-4 py-3 bg-[#FAF7F0]/40">
            <div className="text-xs text-neutral-500">
              Hiển thị{" "}
              <strong className="text-neutral-900">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-neutral-900">
                {Math.min(currentPage * PAGE_SIZE, total)}
              </strong>{" "}
              trên tổng số{" "}
              <strong className="text-amber-950 font-bold">{total}</strong> bài
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="h-8 px-2.5 text-xs font-semibold rounded-xl border-[#EDE5D8] hover:bg-white disabled:opacity-40 cursor-pointer"
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="h-8 px-2.5 text-xs font-semibold rounded-xl border-[#EDE5D8] hover:bg-white disabled:opacity-40 cursor-pointer"
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
        onEdit={() => {
          if (previewPost) {
            const target = previewPost;
            setIsPreviewOpen(false);
            setPreviewPost(null);
            handleOpenEdit(target);
          }
        }}
        onApprove={() => {
          if (previewPost) {
            const target = previewPost;
            setIsPreviewOpen(false);
            setPreviewPost(null);
            handleOpenApprove(target);
          }
        }}
      />

      {/* Edit Post Modal */}
      <UpdatePostModal
        post={editingPost}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingPost(null);
        }}
        onSuccess={() => {
          refetch();
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

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Xác nhận xoá bài viết"
        description={`Bạn có chắc chắn muốn xoá bài viết "${deletingPost?.title}"? Bài viết sẽ được chuyển vào thùng rác.`}
        confirmText="Xoá bài viết"
        cancelText="Huỷ"
        variant="danger"
        isLoading={deletePostMutation.isPending}
        onConfirm={() => {
          if (deletingPost?.id) {
            deletePostMutation.mutate(deletingPost.id);
          }
        }}
        onClose={() => {
          if (!deletePostMutation.isPending) {
            setIsDeleteOpen(false);
            setDeletingPost(null);
          }
        }}
      />
    </div>
  );
};

