"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import React, { useRef, useState } from "react";

interface PdfUploadProps {
  pdfFile: File | null;
  existingUrl?: string | null;
  existingName?: string | null;
  existingSize?: number | null;
  error?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  onChange: (file: File | null) => void;
  onClear?: () => void;
}

export const PdfUpload: React.FC<PdfUploadProps> = ({
  pdfFile,
  existingUrl,
  existingName,
  existingSize,
  error: externalError,
  isUploading = false,
  uploadProgress = 0,
  onChange,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes || bytes <= 0) return "0 KB";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const validateAndSelectFile = (file: File) => {
    setInternalError(null);

    // 1. Validate file extension and MIME type (Only .pdf)
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setInternalError("Chỉ chấp nhận tệp tài liệu định dạng .pdf");
      return;
    }

    // 2. Validate max file size <= 50 MB
    if (file.size > MAX_SIZE_BYTES) {
      setInternalError("Dung lượng tệp PDF phải nhỏ hơn 50 MB");
      return;
    }

    onChange(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalError(null);
    onChange(null);
    onClear?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentName = pdfFile?.name || existingName || "Tài liệu đính kèm.pdf";
  const currentSize = pdfFile?.size ?? existingSize ?? 0;
  const hasFile = Boolean(pdfFile || existingUrl);
  const activeError = internalError || externalError;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-rose-600" />
          <span>Tệp tài liệu PDF (Đính kèm)</span>
        </label>
        <span className="text-[11px] text-neutral-400">
          Tùy chọn • Tối đa 50 MB (.pdf)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Case 1: Has file selected or existing */}
      {hasFile ? (
        <div className="relative rounded-2xl border border-rose-200 bg-rose-50/50 p-4 transition">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 shadow-2xs">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900 truncate" title={currentName}>
                  {currentName}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <span>{formatFileSize(currentSize)}</span>
                  {existingUrl && !pdfFile && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Đã lưu trên R2
                    </span>
                  )}
                  {pdfFile && (
                    <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Sẵn sàng tải lên (folder: pdf)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition cursor-pointer"
              >
                Đổi tệp
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                title="Gỡ tệp đính kèm"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="mt-3 pt-3 border-t border-rose-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-rose-800">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang tải PDF lên Cloudflare R2...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-rose-200">
                <div
                  className="h-full bg-rose-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Case 2: Dropzone area */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
            isDragging
              ? "border-rose-500 bg-rose-50/60 scale-[0.99]"
              : "border-neutral-200 bg-neutral-50/50 hover:border-rose-300 hover:bg-rose-50/30"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-400 group-hover:text-rose-600 group-hover:bg-rose-100/70 group-hover:scale-105 shadow-2xs border border-neutral-100 transition duration-200">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold text-neutral-800">
              Nhấn để chọn tệp PDF hoặc kéo thả vào đây
            </p>
            <p className="text-[11px] text-neutral-500">
              Hỗ trợ định dạng .pdf (Tối đa 50 MB). Tệp sẽ được lưu trữ an toàn trong thư mục{" "}
              <code className="text-rose-700 bg-rose-50 px-1 py-0.5 rounded font-mono text-[10px]">
                pdf/
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {activeError && (
        <p className="flex items-center gap-1 text-xs text-rose-600 mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
};
