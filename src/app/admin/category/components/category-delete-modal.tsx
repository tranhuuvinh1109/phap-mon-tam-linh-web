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

  const isUncategorized =
    category.slug === "khong-co-chu-de" ||
    category.name.trim().toLowerCase() === "không có chủ đề";

  const hasActiveChildren = Boolean(
    category.children && category.children.length > 0
  );

  const postCount = category._count?.posts || 0;

  const handleDelete = async () => {
    if (isUncategorized) return;

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
              isUncategorized || hasActiveChildren
                ? "bg-amber-100 border-amber-300 text-amber-800"
                : "bg-red-100 border-red-200 text-red-600"
            }`}
          >
            {isUncategorized || hasActiveChildren ? (
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
              {isUncategorized
                ? "Không thể xóa danh mục mặc định"
                : "Xác nhận xóa danh mục"}
            </h3>

            {isUncategorized ? (
              <div className="mt-2 text-xs text-neutral-600 leading-relaxed">
                <p>
                  Danh mục <strong>&ldquo;{category.name}&rdquo;</strong> là danh mục mặc định của hệ thống dùng để lưu trữ các bài viết và danh mục con chưa phân loại. Bạn không thể xóa danh mục này.
                </p>
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

                {hasActiveChildren && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 space-y-1.5">
                    <p className="font-semibold flex items-center gap-1.5 text-xs text-amber-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                      Cảnh báo xóa danh mục cha:
                    </p>
                    <p className="text-xs leading-relaxed">
                      Danh mục này đang có{" "}
                      <strong className="text-amber-800">
                        {category.children?.length} danh mục con
                      </strong>
                      . Khi xóa danh mục cha:
                    </p>
                    <ul className="text-xs list-disc list-inside space-y-1 text-amber-800">
                      <li>
                        Tất cả {category.children?.length} danh mục con sẽ được tự động chuyển sang trực thuộc danh mục <strong>&ldquo;Không có chủ đề&rdquo;</strong>.
                      </li>
                      {postCount > 0 && (
                        <li>
                          Toàn bộ {postCount} bài viết trực thuộc sẽ được chuyển sang danh mục <strong>&ldquo;Không có chủ đề&rdquo;</strong>.
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {!hasActiveChildren && postCount > 0 && (
                  <p className="text-amber-800 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                    ⚠️ Danh mục này đang có <strong>{postCount} bài viết</strong> liên kết. Khi xóa danh mục, các bài viết này sẽ được chuyển sang danh mục <strong>&ldquo;Không có chủ đề&rdquo;</strong>.
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
            {isUncategorized ? "Đã hiểu" : "Hủy"}
          </Button>

          {!isUncategorized && (
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
