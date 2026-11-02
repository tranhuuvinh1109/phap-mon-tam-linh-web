"use client";

import {
  AlertCircle,
  FolderTree,
  Info,
  X,
} from "lucide-react";
import React, { useEffect, useId, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  useCreateCategory,
  useGetCategoryTree,
  useUpdateCategory,
} from "@/api/category";
import type { CategoryItemType } from "@/api/category/category.type";
import { Button } from "@/components/ui";
import { slugify } from "@/lib/utils";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryItemType | null;
  initialParentId?: string | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  initialParentId,
}) => {
  const isEdit = Boolean(category);
  const nameId = useId();
  const slugId = useId();
  const descId = useId();
  const parentIdId = useId();

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch category tree to populate root parent options and check duplicate slug
  const { data: categoryTree = [], isLoading: isCategoriesLoading } =
    useGetCategoryTree();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || "");
        setSlug(category.slug || "");
        setParentId(category.parentId || "");
        setDescription(category.description || "");
      } else {
        setName("");
        setSlug("");
        setParentId(initialParentId || "");
        setDescription("");
      }
      setIsSubmitted(false);
      setSubmitError(null);
    }
  }, [isOpen, category, initialParentId]);

  // Auto derive slug from name
  useEffect(() => {
    if (isOpen) {
      if (category && name === category.name) {
        setSlug(category.slug || slugify(name));
      } else {
        setSlug(slugify(name));
      }
    }
  }, [name, isOpen, category]);

  // Available parent options: All root categories from tree
  const parentOptions = useMemo(() => {
    return categoryTree.filter((c) => {
      if (c.deletedAt) return false;
      if (isEdit && category && c.id === category.id) return false; // Cannot be own parent
      return true;
    });
  }, [categoryTree, isEdit, category]);

  // Flatten tree to get all categories for children and slug uniqueness checks
  const allCategories = useMemo(() => {
    const list: CategoryItemType[] = [];
    categoryTree.forEach((root) => {
      list.push(root);
      if (root.children && Array.isArray(root.children)) {
        list.push(...root.children);
      }
    });
    return list;
  }, [categoryTree]);

  // Check if current category has children (if edit)
  const hasChildren = useMemo(() => {
    if (!isEdit || !category) return false;
    const currentInTree = categoryTree.find((c) => c.id === category.id);
    if (currentInTree?.children && currentInTree.children.length > 0) {
      return currentInTree.children.some((c) => !c.deletedAt);
    }
    return allCategories.some((c) => c.parentId === category.id && !c.deletedAt);
  }, [categoryTree, allCategories, isEdit, category]);

  // Duplicate slug check across all categories
  const isDuplicateSlug = useMemo(() => {
    const cleanSlug = slug.trim().toLowerCase();
    if (!cleanSlug) return false;

    return allCategories.some((c) => {
      if (c.deletedAt) return false;
      if (isEdit && category && c.id === category.id) return false;
      return c.slug.toLowerCase() === cleanSlug;
    });
  }, [allCategories, slug, isEdit, category]);

  // Validation
  const nameError = isSubmitted && !name.trim() ? "Tên danh mục là bắt buộc." : null;
  const slugError =
    isSubmitted && !slug.trim()
      ? "Slug không được để trống."
      : isDuplicateSlug
      ? "Đường dẫn tĩnh (Slug) này đã tồn tại."
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setSubmitError(null);

    if (!name.trim() || !slug.trim() || isDuplicateSlug) {
      return;
    }

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || undefined,
            parentId: parentId ? parentId : null,
          },
        });
        toast.success(`Đã cập nhật danh mục "${name.trim()}"`);
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          parentId: parentId ? parentId : null,
        });
        toast.success(`Đã tạo mới danh mục "${name.trim()}"`);
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đã có lỗi xảy ra. Vui lòng kiểm tra lại.";
      setSubmitError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-amber-900/10 bg-white p-6 sm:p-7 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-lg font-bold text-neutral-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {isEdit ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
              </h2>
              <p className="text-xs text-neutral-500">
                {isEdit
                  ? "Cập nhật thông tin phân cấp chuyên mục bài viết."
                  : "Thêm danh mục mới vào cây phân cấp hệ thống."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error notification */}
        {submitError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Thao tác thất bại</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* 1. Name */}
          <div>
            <label
              htmlFor={nameId}
              className="block text-xs font-semibold text-neutral-800 mb-1"
            >
              Tên danh mục <span className="text-amber-700">*</span>
            </label>
            <input
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Hướng dẫn tu tập, Bạch thoại Phật pháp..."
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition focus:outline-none focus:ring-2 ${
                nameError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
              }`}
            />
            {nameError && (
              <p className="mt-1 text-xs text-red-600">{nameError}</p>
            )}
          </div>

          {/* 2. Parent Category */}
          <div>
            <label
              htmlFor={parentIdId}
              className="block text-xs font-semibold text-neutral-800 mb-1"
            >
              Thuộc danh mục cha{" "}
              <span className="text-xs font-normal text-neutral-500">
                (Tùy chọn)
              </span>
            </label>
            <select
              id={parentIdId}
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={isCategoriesLoading || hasChildren}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition focus:outline-none focus:ring-2 ${
                hasChildren
                  ? "border-neutral-200 bg-neutral-100 cursor-not-allowed text-neutral-500"
                  : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
              }`}
            >
              <option value="">-- Là danh mục gốc (Cha) --</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name} ({p.slug})
                </option>
              ))}
            </select>
            {hasChildren ? (
              <p className="mt-1 text-xs text-amber-700">
                ℹ️ Danh mục này đang có danh mục con, không thể gán làm con của danh mục khác (hệ thống tối đa 2 cấp).
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-neutral-500">
                Để trống nếu muốn đây là danh mục gốc. Chọn danh mục cha để trở thành danh mục con trực thuộc.
              </p>
            )}
          </div>

          {/* 3. Slug (Auto-generated & Non-customizable) */}
          <div>
            <label
              htmlFor={slugId}
              className="block text-xs font-semibold text-neutral-800 mb-1"
            >
              Đường dẫn tĩnh (Slug) <span className="text-amber-700">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs text-neutral-400 font-mono select-none">
                /
              </span>
              <input
                id={slugId}
                type="text"
                value={slug}
                readOnly
                disabled
                tabIndex={-1}
                placeholder="slug-se-duoc-tao-tu-dong"
                className={`w-full rounded-xl border pl-7 pr-3.5 py-2 text-sm font-mono cursor-not-allowed select-all transition focus:outline-none ${
                  slugError
                    ? "border-red-400 bg-red-50/50 text-red-600"
                    : "border-neutral-200 bg-neutral-100/80 text-neutral-600"
                }`}
              />
            </div>
            {slugError && (
              <p className="mt-1 text-xs text-red-600">{slugError}</p>
            )}
            <p className="mt-1 text-[11px] text-neutral-500">
              Slug sẽ được tạo tự động.
            </p>
          </div>

          {/* 4. Description */}
          <div>
            <label
              htmlFor={descId}
              className="block text-xs font-semibold text-neutral-800 mb-1"
            >
              Mô tả ngắn{" "}
              <span className="text-xs font-normal text-neutral-500">
                (Tùy chọn)
              </span>
            </label>
            <textarea
              id={descId}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu tóm tắt mục đích hoặc nội dung của danh mục này..."
              className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-700 hover:bg-amber-800 text-white shadow-xs"
            >
              {isSubmitting
                ? "Đang lưu..."
                : isEdit
                ? "Cập nhật thay đổi"
                : "Tạo danh mục"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
