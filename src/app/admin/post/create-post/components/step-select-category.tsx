"use client";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileAudio,
  FileText,
  Loader2,
  Tag,
  Video,
} from "lucide-react";
import React, { useId, useState } from "react";

import { useGetCategories } from "@/api/category";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { getContentTypeByCategory, isNiemKinh } from "../../utils/content-type";

interface StepSelectCategoryProps {
  selectedCategoryId: string;
  onNext: (categoryId: string, contentType: ContentType) => void;
  onCancel: () => void;
}

export const StepSelectCategory: React.FC<StepSelectCategoryProps> = ({
  selectedCategoryId: initialCategoryId,
  onNext,
  onCancel,
}) => {
  const selectId = useId();
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId || "");
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  // Fetch categories using TanStack Query
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCategories();

  // Filter out soft-deleted categories
  const activeCategories = categories.filter((cat) => !cat.deletedAt);

  // Determine content type from currently selected categoryId
  const determinedContentType = categoryId
    ? getContentTypeByCategory(categoryId)
    : null;

  const categoryError =
    hasAttemptedNext && !categoryId ? "Vui lòng chọn danh mục bài viết." : null;

  const handleNext = () => {
    setHasAttemptedNext(true);
    if (!categoryId) return;

    const contentType = getContentTypeByCategory(categoryId);
    onNext(categoryId, contentType);
  };

  const selectedCategoryObj = activeCategories.find((cat) => cat.id === categoryId);

  const renderContentTypeBadge = () => {
    if (!determinedContentType) return null;

    if (isNiemKinh(categoryId, selectedCategoryObj?.slug, selectedCategoryObj?.name)) {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/80 px-3.5 py-2 text-xs font-semibold text-amber-900">
          <BookOpen className="h-4 w-4 text-amber-700" />
          <span>Loại bài viết tự động gán: <strong>Niệm Kinh (Nội dung theo từng bước tụng niệm)</strong></span>
        </div>
      );
    }

    if (determinedContentType === ContentType.AUDIO) {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/80 px-3.5 py-2 text-xs font-semibold text-amber-900">
          <FileAudio className="h-4 w-4 text-amber-700" />
          <span>Loại bài viết tự động gán: <strong>Âm thanh (AUDIO)</strong></span>
        </div>
      );
    }

    if (determinedContentType === ContentType.VIDEO) {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-blue-300/80 bg-blue-50/80 px-3.5 py-2 text-xs font-semibold text-blue-900">
          <Video className="h-4 w-4 text-blue-700" />
          <span>Loại bài viết tự động gán: <strong>Video (VIDEO)</strong></span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-3.5 py-2 text-xs font-semibold text-emerald-900">
        <FileText className="h-4 w-4 text-emerald-700" />
        <span>Loại bài viết tự động gán: <strong>Bài viết thường (NORMAL)</strong></span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-8 text-neutral-600">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          <span className="text-sm font-medium">Đang tải danh mục...</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">Không thể tải danh sách danh mục</p>
              <p className="text-xs text-red-600/90 mt-0.5">
                {error?.message || "Vui lòng kiểm tra kết nối mạng."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-200 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Category Selection Field */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={selectId}
              className="block text-sm font-semibold text-neutral-800"
            >
              Chọn Danh mục <span className="text-amber-700">*</span>
            </label>
            <div className="relative mt-1.5">
              <select
                id={selectId}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 transition-colors focus:outline-none focus:ring-2 ${
                  categoryError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
                }`}
              >
                <option value="">-- Chọn danh mục cho bài viết --</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.slug})
                  </option>
                ))}
              </select>

              {/* Chevron icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400">
                <Tag className="h-4 w-4" />
              </div>
            </div>

            {categoryError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{categoryError}</span>
              </p>
            )}

            {activeCategories.length === 0 && (
              <p className="mt-2 text-xs text-neutral-500">
                Chưa có danh mục nào trong hệ thống. Vui lòng tạo danh mục trước khi đăng bài.
              </p>
            )}
          </div>

          {/* Dynamic Content Type Indicator */}
          {renderContentTypeBadge()}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-[#EDE5D8]/80">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Hủy bỏ
        </Button>

        <Button
          type="button"
          variant="golden"
          onClick={handleNext}
          disabled={isLoading || isError || !categoryId}
          className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Tiếp theo</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
