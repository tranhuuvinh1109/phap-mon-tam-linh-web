"use client";

import { Check, ChevronRight, FolderTree, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import { useGetCategories } from "@/api/category";
import { ContentType } from "@/enums";
import { slugify } from "@/lib/utils";
import { CreatePostFormValues, PostFormStep } from "../../types/post-form.type";
import { isBachThoaiPhatPhap } from "../../utils/content-type";
import { StepPostDetails } from "./step-post-details";
import { StepSelectCategory } from "./step-select-category";

export const CreatePostForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PostFormStep>(1);

  // Form state across steps
  const [formValues, setFormValues] = useState<CreatePostFormValues>({
    categoryId: "",
    groupId: "",
    contentType: ContentType.NORMAL,
    title: "",
    slug: "",
    description: "",
    thumbnail: null,
    thumbnailPreview: null,
    audioFile: null,
    content: "",
  });

  // Get categories to find category details for Step 2 header
  const { data: categories = [] } = useGetCategories();
  const selectedCategory = useMemo(() => {
    return categories.find((cat) => cat.id === formValues.categoryId);
  }, [categories, formValues.categoryId]);

  const handleStep1Next = (categoryId: string, contentType: ContentType) => {
    setFormValues((prev: CreatePostFormValues) => ({
      ...prev,
      categoryId,
      contentType,
      groupId: prev.categoryId === categoryId ? prev.groupId : "",
    }));
    setCurrentStep(2);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleUpdateFormValues = (updates: Partial<CreatePostFormValues>) => {
    setFormValues((prev: CreatePostFormValues) => {
      const nextValues = {
        ...prev,
        ...updates,
      };

      // Tự động lấy tên file làm tiêu đề bài viết khi đẩy file mp3 lên (cho bài viết Bạch Thoại Phật Pháp)
      const isBachThoai = isBachThoaiPhatPhap(
        nextValues.categoryId,
        selectedCategory?.slug,
        selectedCategory?.name
      );

      if (updates.audioFile && isBachThoai && updates.title === undefined) {
        const autoTitle = updates.audioFile.name.replace(/\.[^/.]+$/, "").trim();
        if (autoTitle) {
          nextValues.title = autoTitle;
          nextValues.slug = slugify(autoTitle);
        }
      }

      // Tự động lấy tên file PDF làm tiêu đề bài viết nếu chưa nhập tiêu đề
      if (updates.pdfFile && !nextValues.title.trim()) {
        const autoTitle = updates.pdfFile.name.replace(/\.[^/.]+$/, "").trim();
        if (autoTitle) {
          nextValues.title = autoTitle;
          nextValues.slug = slugify(autoTitle);
        }
      }

      return nextValues;
    });
  };

  const handleCancel = () => {
    router.push("/admin/post");
  };

  return (
    <div className="rounded-2xl border border-[#EDE5D8]/90 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-xs transition-all">
      {/* Step Progress Indicator */}
      <div className="mb-8 border-b border-[#EDE5D8]/80 pb-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Step 1 Indicator */}
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep === 1
                  ? "bg-amber-600 text-white ring-4 ring-amber-500/20 shadow-xs"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className="hidden sm:block">
              <p
                className={`text-xs font-semibold ${
                  currentStep === 1 ? "text-amber-900" : "text-neutral-600"
                }`}
              >
                Bước 1
              </p>
              <p className="text-[11px] text-neutral-400">Chọn Danh mục</p>
            </div>
          </div>

          {/* Divider */}
          <ChevronRight className="h-4 w-4 text-neutral-400" />

          {/* Step 2 Indicator */}
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                currentStep === 2
                  ? "bg-amber-600 text-white ring-4 ring-amber-500/20 shadow-xs"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              2
            </div>
            <div className="hidden sm:block">
              <p
                className={`text-xs font-semibold ${
                  currentStep === 2 ? "text-amber-900" : "text-neutral-500"
                }`}
              >
                Bước 2
              </p>
              <p className="text-[11px] text-neutral-400">Nội dung bài viết</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Select Category */}
      {currentStep === 1 && (
        <StepSelectCategory
          selectedCategoryId={formValues.categoryId}
          onNext={handleStep1Next}
          onCancel={handleCancel}
        />
      )}

      {/* Step 2: Post Details */}
      {currentStep === 2 && (
        <StepPostDetails
          formValues={formValues}
          category={selectedCategory}
          onChangeFormValues={handleUpdateFormValues}
          onBack={handleStep2Back}
        />
      )}
    </div>
  );
};
