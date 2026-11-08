"use client";

import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";

interface ThumbnailUploadProps {
  thumbnail: File | null;
  thumbnailPreview?: string | null;
  thumbnailUrl?: string | null;
  thumbnailKey?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  defaultImage?: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
}

export const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
  thumbnail,
  thumbnailPreview,
  thumbnailUrl,
  thumbnailKey,
  isUploading = false,
  uploadProgress = 0,
  defaultImage,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcess = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError(
        "Vui lòng chọn định dạng hình ảnh hợp lệ (.jpg, .jpeg, .png, .webp)."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh đại diện không được vượt quá 5 MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    // Stage file locally in form state, do not upload yet until submit
    onChange(file, previewUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    onChange(null, null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isCustomImage = Boolean(thumbnailPreview || thumbnailUrl);
  const displayImage = thumbnailPreview || thumbnailUrl || defaultImage;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-800">
          Ảnh đại diện (Thumbnail){" "}
          <span className="text-xs font-normal text-neutral-400">
            (tùy chọn)
          </span>
        </label>
        {isUploading && (
          <span className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Đang tải lên S3 ({uploadProgress}%)...</span>
          </span>
        )}
      </div>

      {displayImage ? (
        <div className="relative group w-full max-w-md h-48 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-2xs">
          <Image
            src={displayImage}
            alt="Thumbnail preview"
            fill
            className="object-cover"
          />

          {/* S3 uploaded badge */}
          {thumbnailUrl && !isUploading && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Đã lưu trên S3</span>
            </div>
          )}

          {/* Default fallback image badge */}
          {!isCustomImage && defaultImage && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-amber-900/70 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white">
              <span>Ảnh mặc định</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm hover:bg-white disabled:opacity-50"
            >
              {isCustomImage ? "Đổi ảnh" : "Tải ảnh thay thế"}
            </button>
            {isCustomImage && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="rounded-xl bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-600 flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all cursor-pointer ${
            isDragging
              ? "border-amber-500 bg-amber-50/50"
              : "border-neutral-300 hover:border-amber-500/60 bg-neutral-50/50 hover:bg-amber-50/20"
          }`}
        >
          <div className="rounded-full bg-amber-100 p-3 text-amber-800">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-800">
            Kéo thả ảnh vào đây, hoặc{" "}
            <span className="text-amber-700 underline">chọn tệp từ máy</span>
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Hỗ trợ PNG, JPG, WebP (Tối đa 5 MB • Tải lên S3 khi tạo bài viết)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
