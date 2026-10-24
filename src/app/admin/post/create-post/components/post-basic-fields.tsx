"use client";

import { Info } from "lucide-react";
import React, { useId, useState } from "react";

import { slugify } from "@/lib/utils";

interface PostBasicFieldsProps {
  title: string;
  slug: string;
  description: string;
  errors?: {
    title?: string;
    slug?: string;
  };
  onChangeTitle: (title: string, slug: string) => void;
  onChangeSlug?: (slug: string) => void;
  onChangeDescription: (description: string) => void;
}

export const PostBasicFields: React.FC<PostBasicFieldsProps> = ({
  title,
  slug,
  description,
  errors,
  onChangeTitle,
  onChangeSlug,
  onChangeDescription,
}) => {
  const titleId = useId();
  const slugId = useId();
  const descId = useId();

  // State to enable/disable custom slug editing (default is false = disabled)
  const [isCustomSlug, setIsCustomSlug] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (!isCustomSlug) {
      const generatedSlug = slugify(newTitle);
      onChangeTitle(newTitle, generatedSlug);
    } else {
      onChangeTitle(newTitle, slug);
    }
  };

  const handleToggleCustomSlug = () => {
    const nextState = !isCustomSlug;
    setIsCustomSlug(nextState);
    // When toggling off (disable custom slug), re-sync slug automatically from title
    if (!nextState) {
      const autoSlug = slugify(title);
      onChangeSlug?.(autoSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeSlug?.(e.target.value);
  };

  return (
    <div className="space-y-5">
      {/* Title Field */}
      <div>
        <label
          htmlFor={titleId}
          className="block text-sm font-semibold text-neutral-800"
        >
          Tiêu đề bài viết <span className="text-amber-700">*</span>
        </label>
        <div className="mt-1.5">
          <input
            id={titleId}
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            placeholder="Nhập tiêu đề bài viết (ví dụ: Khai thị về lòng từ bi, Ý nghĩa phóng sanh...)"
            className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
              errors?.title
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
            }`}
          />
        </div>
        {errors?.title && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      {/* Slug Field with Switch Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor={slugId}
            className="block text-sm font-semibold text-neutral-800"
          >
            Đường dẫn tĩnh (Slug)
          </label>

          {/* Switch toggle: default is disabled */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium select-none">
              Cho phép sửa slug
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isCustomSlug}
              onClick={handleToggleCustomSlug}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 ${
                isCustomSlug ? "bg-amber-600" : "bg-neutral-300"
              }`}
              title={
                isCustomSlug
                  ? "Đang cho phép sửa slug (bấm để khóa và tự động tạo theo tiêu đề)"
                  : "Đang khóa slug (bấm để cho phép chỉnh sửa thủ công)"
              }
            >
              <span className="sr-only">Cho phép sửa slug</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isCustomSlug ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-1.5">
          <input
            id={slugId}
            type="text"
            readOnly={!isCustomSlug}
            tabIndex={isCustomSlug ? 0 : -1}
            value={slug}
            onChange={handleSlugChange}
            placeholder={
              isCustomSlug
                ? "Nhập slug tùy chỉnh (ví dụ: khai-thi-ve-long-tu-bi)..."
                : "Slug sẽ tự động tạo từ tiêu đề bài viết..."
            }
            className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono transition-colors focus:outline-none ${
              isCustomSlug
                ? "border-neutral-200 bg-white text-neutral-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                : "cursor-not-allowed select-all border-neutral-200 bg-neutral-50/90 text-neutral-800"
            } ${
              errors?.slug
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : ""
            }`}
          />
        </div>
        {errors?.slug && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.slug}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
          <Info className="h-3 w-3 shrink-0" />
          <span>
            {isCustomSlug
              ? "Đang bật tùy chỉnh slug. Hãy dùng chữ thường không dấu và dấu gạch ngang (-)."
              : "Slug được tự động chuẩn hóa từ tiêu đề bài viết. Bật công tắc bên trên để tùy chỉnh."}
          </span>
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor={descId}
          className="block text-sm font-semibold text-neutral-800"
        >
          Mô tả tóm tắt{" "}
          <span className="text-xs font-normal text-neutral-400">(tùy chọn)</span>
        </label>
        <div className="mt-1.5">
          <textarea
            id={descId}
            rows={3}
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="Nội dung tóm tắt ngắn gọn của bài viết để hiển thị trên danh sách và thẻ xem trước..."
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>
    </div>
  );
};
