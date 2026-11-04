"use client";

import { AlertTriangle, FolderTree, Trash2, X } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

import { useDeleteCategory } from "@/api/category";
import type { CategoryItemType } from "@/api/category/category.type";
import { Button } from "@/components/ui";

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItemType | null;
}

export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const deleteMutation = useDeleteCategory();

  if (!isOpen || !category) return null;

  const hasActiveChildren = Boolean(
    category.children && category.children.length > 0
  );

  const postCount = category._count?.posts || 0;

  const handleDelete = async () => {
    if (hasActiveChildren) return;

    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success(`Đã xóa danh mục "${category.name}"`);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xóa danh mục này. Vui lòng thử lại.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-red-900/10 bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              hasActiveChildren
                ? "bg-amber-100 border-amber-300 text-amber-800"
                : "bg-red-100 border-red-200 text-red-600"
            }`}
          >
            {hasActiveChildren ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1">
            <h3
              className="text-lg font-bold text-neutral-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {hasActiveChildren
                ? "Không thể xóa danh mục cha"
                : "Xác nhận xóa danh mục"}
            </h3>

            {hasActiveChildren ? (
              <div className="mt-2 space-y-2 text-xs text-neutral-600 leading-relaxed">
                <p>
                  Danh mục <strong>&ldquo;{category.name}&rdquo;</strong> hiện đang có{" "}
                  <strong className="text-amber-800">
                    {category.children?.length} danh mục con
                  </strong>{" "}
                  trực thuộc.
                </p>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                  <p className="font-semibold flex items-center gap-1.5">
                    <FolderTree className="h-4 w-4 shrink-0" />
                    Chính sách an toàn dữ liệu:
                  </p>
                  <p className="mt-1">
                    Hệ thống không cho phép xóa danh mục cha khi vẫn còn danh mục con đang hoạt động. Vui lòng chuyển hoặc xóa các danh mục con trước.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-neutral-600 space-y-2 leading-relaxed">
                <p>
                  Bạn có chắc chắn muốn xóa danh mục{" "}
                  <strong className="text-neutral-900">
                    &ldquo;{category.name}&rdquo;
                  </strong>{" "}
                  (Slug: <code className="font-mono text-neutral-700">/{category.slug}</code>)?
                </p>
                {postCount > 0 && (
                  <p className="text-amber-800 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                    ⚠️ Danh mục này đang có <strong>{postCount} bài viết</strong> liên kết. Khi xóa danh mục, các bài viết này vẫn được giữ nguyên và chuyển sang trạng thái <em>&ldquo;Chưa phân loại&rdquo;</em>.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            {hasActiveChildren ? "Đã hiểu" : "Hủy"}
          </Button>

          {!hasActiveChildren && (
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
