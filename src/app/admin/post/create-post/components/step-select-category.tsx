"use client";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  FileAudio,
  FileText,
  Folder,
  FolderTree,
  Loader2,
  Tag,
  Video,
} from "lucide-react";
import React, { useEffect, useId, useMemo, useState } from "react";

import { useGetCategories, useGetCategoryTree } from "@/api/category";
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
  const parentSelectId = useId();
  const childSelectId = useId();

  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  // Fetch categories using TanStack Query
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCategories();

  const { data: categoryTree = [] } = useGetCategoryTree();

  // Filter out soft-deleted categories
  const activeCategories = useMemo(
    () => categories.filter((cat) => !cat.deletedAt),
    [categories]
  );

  // Organize categories into hierarchy (parent/root items with children)
  const organizedCategories = useMemo(() => {
    if (categoryTree && categoryTree.length > 0) {
      return categoryTree.filter((cat) => !cat.deletedAt);
    }
    const rootCats = activeCategories.filter((c) => !c.parentId);
    return rootCats.map((root) => ({
      ...root,
      children: activeCategories.filter((c) => c.parentId === root.id),
    }));
  }, [categoryTree, activeCategories]);

  // Sync initialCategoryId once categories are available
  useEffect(() => {
    if (initialCategoryId && activeCategories.length > 0 && !selectedParentId) {
      const found = activeCategories.find((c) => c.id === initialCategoryId);
      if (found) {
        if (found.parentId) {
          setSelectedParentId(found.parentId);
          setSelectedChildId(found.id);
        } else {
          setSelectedParentId(found.id);
          setSelectedChildId("");
        }
      }
    }
  }, [initialCategoryId, activeCategories, selectedParentId]);

  // Selected parent category object
  const selectedParent = useMemo(() => {
    return organizedCategories.find((p) => p.id === selectedParentId) || null;
  }, [organizedCategories, selectedParentId]);

  // Available child categories for the currently selected parent
  const availableChildren = useMemo(() => {
    if (!selectedParent) return [];
    if (selectedParent.children && selectedParent.children.length > 0) {
      return selectedParent.children.filter((c) => !c.deletedAt);
    }
    return activeCategories.filter((c) => c.parentId === selectedParentId);
  }, [selectedParent, selectedParentId, activeCategories]);

  // Selected child category object
  const selectedChildObj = useMemo(() => {
    if (!selectedChildId) return null;
    return (
      availableChildren.find((c) => c.id === selectedChildId) ||
      activeCategories.find((c) => c.id === selectedChildId) ||
      null
    );
  }, [selectedChildId, availableChildren, activeCategories]);

  // The effective category for validation & payload (strictly the child category if children exist)
  const effectiveCategoryObj = useMemo(() => {
    if (availableChildren.length > 0) {
      return selectedChildObj;
    }
    return selectedParent;
  }, [availableChildren.length, selectedChildObj, selectedParent]);

  // Determine content type from currently selected category
  const determinedContentType = useMemo(() => {
    if (!effectiveCategoryObj) return null;
    return getContentTypeByCategory(
      effectiveCategoryObj.id,
      effectiveCategoryObj.parentId || selectedParentId
    );
  }, [effectiveCategoryObj, selectedParentId]);

  const parentError =
    hasAttemptedNext && !selectedParentId
      ? "Vui lòng chọn danh mục cha."
      : null;

  const childError =
    hasAttemptedNext && selectedParentId && availableChildren.length > 0 && !selectedChildId
      ? "Vui lòng chọn danh mục con."
      : null;

  const handleParentChange = (newParentId: string) => {
    setSelectedParentId(newParentId);
    setSelectedChildId(""); // Reset child selection when parent changes
  };

  const handleNext = () => {
    setHasAttemptedNext(true);
    if (!selectedParentId) return;
    if (availableChildren.length > 0 && !selectedChildId) return;

    if (!effectiveCategoryObj) return;

    const contentType = getContentTypeByCategory(
      effectiveCategoryObj.id,
      effectiveCategoryObj.parentId || selectedParentId
    );

    // Payload categoryId is strictly the selected child's id
    onNext(effectiveCategoryObj.id, contentType);
  };

  const renderContentTypeBadge = () => {
    if (!determinedContentType || !effectiveCategoryObj) return null;

    if (
      isNiemKinh(
        effectiveCategoryObj.id,
        effectiveCategoryObj.slug,
        effectiveCategoryObj.name
      )
    ) {
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
          <span>Loại bài viết tự động gán: <strong>Âm thanh (AUDIO MP3)</strong></span>
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

      {/* Cascading Category Selection: Parent -> Child */}
      {!isLoading && !isError && (
        <div className="space-y-5">
          {/* Select box 1: Chọn Danh mục cha */}
          <div>
            <label
              htmlFor={parentSelectId}
              className="block text-sm font-semibold text-neutral-800"
            >
              Chọn Danh mục cha <span className="text-amber-700">*</span>
            </label>
            <div className="relative mt-1.5">
              <select
                id={parentSelectId}
                value={selectedParentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 transition-colors focus:outline-none focus:ring-2 ${
                  parentError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
                }`}
              >
                <option value="">-- Chọn danh mục cha cho bài viết --</option>
                {organizedCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    📁 {parent.name}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400">
                <Folder className="h-4 w-4" />
              </div>
            </div>

            {parentError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{parentError}</span>
              </p>
            )}
          </div>

          {/* Select box 2: Chọn Danh mục con (Hiển thị khi đã chọn danh mục cha) */}
          {selectedParentId && (
            <div className="space-y-1.5">
              <label
                htmlFor={childSelectId}
                className="block text-sm font-semibold text-neutral-800"
              >
                Chọn Danh mục con <span className="text-amber-700">*</span>
              </label>
              <div className="relative mt-1.5">
                <select
                  id={childSelectId}
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  disabled={availableChildren.length === 0}
                  className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 transition-colors focus:outline-none focus:ring-2 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed ${
                    childError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                      : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
                  }`}
                >
                  {availableChildren.length > 0 ? (
                    <>
                      <option value="">-- Chọn danh mục con cho bài viết --</option>
                      {availableChildren.map((child) => (
                        <option key={child.id} value={child.id}>
                          ↳ {child.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value={selectedParent?.id || ""}>
                      [Chính danh mục] {selectedParent?.name} (Không có danh mục con)
                    </option>
                  )}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400">
                  <Tag className="h-4 w-4" />
                </div>
              </div>

              {childError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{childError}</span>
                </p>
              )}

              {/* Breadcrumb Preview Hierarchy */}
              {selectedParent && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                  <FolderTree className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  {selectedChildObj ? (
                    <span>
                      Cây danh mục: <strong className="text-neutral-700">{selectedParent.name}</strong> › <strong className="text-amber-800 font-semibold">{selectedChildObj.name}</strong>
                    </span>
                  ) : availableChildren.length === 0 ? (
                    <span>
                      Cây danh mục: <strong className="text-amber-800 font-semibold">{selectedParent.name}</strong> (Danh mục gốc)
                    </span>
                  ) : (
                    <span>
                      Cây danh mục: <strong className="text-neutral-700">{selectedParent.name}</strong> › <span className="text-neutral-400 italic">Vui lòng chọn danh mục con</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {activeCategories.length === 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              Chưa có danh mục nào trong hệ thống. Vui lòng tạo danh mục trước khi đăng bài.
            </p>
          )}

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
          disabled={
            isLoading ||
            isError ||
            !selectedParentId ||
            (availableChildren.length > 0 && !selectedChildId)
          }
          className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Tiếp theo</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
