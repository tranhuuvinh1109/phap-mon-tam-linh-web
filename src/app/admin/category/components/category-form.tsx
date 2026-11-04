"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useId, useMemo, useState } from "react";

import { useCreateCategory, useGetCategoryTree } from "@/api/category";
import { CategoryFormValues, CategoryItemType } from "@/api/category/category.type";
import { Button } from "@/components/ui";
import { slugify } from "@/lib/utils";

export interface CategoryFormProps {
  initialValues?: Partial<CategoryFormValues>;
  mode?: "create" | "edit";
  onSubmit?: (values: CategoryFormValues) => void;
  onCancel?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialValues,
  mode = "create",
  onSubmit,
  onCancel,
}) => {
  const router = useRouter();
  const nameId = useId();
  const slugId = useId();
  const descId = useId();
  const parentIdId = useId();

  // Form local state
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [parentId, setParentId] = useState<string>(initialValues?.parentId || "");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Retrieve category tree to populate root categories and check duplicate slug
  const {
    data: categoryTree = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useGetCategoryTree();

  // Root categories from tree that can serve as parent
  const rootCategories = useMemo(() => {
    return categoryTree.filter((c) => !c.deletedAt);
  }, [categoryTree]);

  // Flatten tree for duplicate slug checking across all categories
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

  // Create Category mutation hook
  const createCategoryMutation = useCreateCategory({
    onSuccess: (createdCategory) => {
      setSuccessNotice(
        `Danh mục "${createdCategory.name}" (Slug: ${createdCategory.slug}) đã được tạo thành công!`
      );
      // Reset form after successful creation
      setName("");
      setDescription("");
      setParentId("");
      setIsSubmitted(false);
      setSubmitError(null);
    },
    onError: (error) => {
      const errorMsg =
        (error.response?.data as { message?: string | string[] })?.message ||
        error.message ||
        "Đã có lỗi xảy ra khi tạo danh mục. Vui lòng thử lại.";
      setSubmitError(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    },
  });

  // Automatically derive slug from current Name
  const generatedSlug = useMemo(() => {
    return slugify(name);
  }, [name]);

  // Check if the generated slug already exists in all categories
  const isDuplicateSlug = useMemo(() => {
    if (!generatedSlug) return false;

    return allCategories.some((category) => {
      // Exclude soft-deleted categories
      if (category.deletedAt) return false;
      return category.slug.toLowerCase() === generatedSlug.toLowerCase();
    });
  }, [allCategories, generatedSlug]);

  // Validation states
  const nameError = isSubmitted && !name.trim() ? "Tên danh mục là bắt buộc." : null;
  const slugError = isDuplicateSlug ? "Slug đã tồn tại." : null;

  // Determine if submit action should be enabled
  const isValid =
    name.trim().length > 0 &&
    generatedSlug.length > 0 &&
    !isDuplicateSlug &&
    !isCategoriesLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setSuccessNotice(null);
    setSubmitError(null);

    if (!isValid) return;

    const formValues: CategoryFormValues = {
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim(),
      parentId: parentId.trim() ? parentId.trim() : null,
    };

    if (onSubmit) {
      onSubmit(formValues);
    } else {
      createCategoryMutation.mutate({
        name: formValues.name,
        slug: formValues.slug || undefined,
        description: formValues.description || undefined,
        parentId: formValues.parentId,
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#EDE5D8]/90 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-xs transition-all"
      noValidate
    >
      {/* Category Data Load Error Banner */}
      {isCategoriesError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Không thể tải danh sách danh mục</p>
            <p className="text-xs text-red-600/90 mt-0.5">
              {categoriesError?.message ||
                "Vui lòng kiểm tra kết nối mạng để hệ thống kiểm tra tính duy nhất của slug."}
            </p>
          </div>
        </div>
      )}

      {/* Mutation Error Banner */}
      {submitError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-fade-in"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Tạo danh mục thất bại</p>
            <p className="text-xs text-red-600/90 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successNotice && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 animate-fade-in"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Field 1: Name */}
        <div>
          <label
            htmlFor={nameId}
            className="block text-sm font-semibold text-neutral-800"
          >
            Tên danh mục <span className="text-amber-700">*</span>
          </label>
          <div className="mt-1.5">
            <input
              id={nameId}
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSuccessNotice(null);
              }}
              placeholder="Nhập tên danh mục (ví dụ: Bạch thoại Phật pháp, Kinh, Khai thị...)"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
                nameError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
              }`}
            />
          </div>
          {nameError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{nameError}</span>
            </p>
          )}
        </div>

        {/* Field 2: Slug (Auto-generated & Read-only with uniqueness checking) */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor={slugId}
              className="block text-sm font-semibold text-neutral-800"
            >
              Đường dẫn tĩnh (Slug)
            </label>
            {isCategoriesLoading && (
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                <span>Kiểm tra danh mục...</span>
              </span>
            )}
          </div>

          <div className="relative mt-1.5">
            <input
              id={slugId}
              type="text"
              readOnly
              tabIndex={-1}
              value={generatedSlug}
              placeholder="Slug sẽ tự động tạo từ tên danh mục..."
              className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono cursor-not-allowed select-all transition-colors focus:outline-none ${
                slugError
                  ? "border-red-400 bg-red-50/50 text-red-700"
                  : generatedSlug
                  ? "border-emerald-300/80 bg-emerald-50/30 text-emerald-800"
                  : "border-dashed border-neutral-300 bg-neutral-50/80 text-neutral-500"
              }`}
            />

            {/* Validation Icon on right */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {slugError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : generatedSlug && !isCategoriesLoading ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : null}
            </div>
          </div>

          {/* Slug helper / Error message */}
          <div className="mt-1.5 text-xs">
            {slugError ? (
              <p className="flex items-center gap-1.5 font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{slugError}</span>
              </p>
            ) : generatedSlug ? (
              <p className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>
                  Slug hợp lệ: <code className="font-semibold">/{generatedSlug}</code>
                </span>
              </p>
            ) : (
              <p className="flex items-center gap-1 text-neutral-400">
                <Info className="h-3 w-3 shrink-0" />
                <span>Slug sẽ được tạo tự động.</span>
              </p>
            )}
          </div>
        </div>

        {/* Field: Parent Category (Optional) */}
        <div>
          <label
            htmlFor={parentIdId}
            className="block text-sm font-semibold text-neutral-800"
          >
            Danh mục cha{" "}
            <span className="text-xs font-normal text-neutral-500">
              (Tùy chọn - để trống nếu đây là danh mục gốc / cha)
            </span>
          </label>
          <div className="mt-1.5">
            <select
              id={parentIdId}
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={isCategoriesLoading}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-colors focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">-- Là danh mục gốc (Cha) --</option>
              {rootCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  📁 {cat.name} ({cat.slug})
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            Nếu chọn một danh mục cha, danh mục này sẽ là danh mục con trực thuộc (Ví dụ: &quot;Hướng dẫn tu tập&quot; &gt; &quot;{name || 'Tên danh mục con'}&quot;).
          </p>
        </div>

        {/* Field 3: Description (Multiline optional input) */}
        <div>
          <label
            htmlFor={descId}
            className="block text-sm font-semibold text-neutral-800"
          >
            Mô tả danh mục{" "}
            <span className="text-xs font-normal text-neutral-400">(tùy chọn)</span>
          </label>
          <div className="mt-1.5">
            <textarea
              id={descId}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung mô tả danh mục, mục đích tu tập hoặc thông tin bổ sung..."
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-[#EDE5D8]/80">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Hủy bỏ
        </Button>

        <Button
          type="submit"
          variant="golden"
          disabled={!isValid || createCategoryMutation.isPending}
          className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createCategoryMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tạo...</span>
            </span>
          ) : mode === "create" ? (
            "Tạo danh mục"
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </div>
    </form>
  );
};
