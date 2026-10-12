"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileAudio,
  Loader2,
  Music,
  Trash2,
} from "lucide-react";
import React, { useRef, useState } from "react";

import { formatTime, getAudioDuration } from "@/lib/utils";

interface AudioUploadProps {
  audioFile: File | null;
  duration?: number | null;
  error?: string | null;
  isUploading?: boolean;
  uploadProgress?: number;
  isUploadSuccess?: boolean;
  audioKey?: string | null;
  onChange: (file: File | null) => void;
  onDurationChange?: (duration: number | null) => void;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({
  audioFile,
  duration,
  error: externalError,
  isUploading = false,
  uploadProgress = 0,
  isUploadSuccess = false,
  audioKey,
  onChange,
  onDurationChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  const MAX_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB

  const validateAndSelectFile = (file: File) => {
    setInternalError(null);

    // 1. Validate file extension and MIME type (Only .mp3)
    const isMp3 =
      file.type === "audio/mpeg" ||
      file.type === "audio/mp3" ||
      file.name.toLowerCase().endsWith(".mp3");

    if (!isMp3) {
      setInternalError(
        "Chỉ chấp nhận tệp âm thanh định dạng .mp3 (Only MP3 files are allowed)."
      );
      return;
    }

    // 2. Validate max file size <= 20 MB
    if (file.size > MAX_SIZE_BYTES) {
      setInternalError(
        "Dung lượng tệp phải nhỏ hơn 20 MB (File size must be smaller than 20 MB)."
      );
      return;
    }

    // Generate local preview URL
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    const url = URL.createObjectURL(file);
    setAudioPreviewUrl(url);

    // Save to form state (Do NOT upload automatically, wait for submit)
    onChange(file);

    // Extract audio duration
    getAudioDuration(file).then((dur) => {
      onDurationChange?.(dur);
    });
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

  const handleRemove = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    onChange(null);
    onDurationChange?.(null);
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const activeError = internalError || externalError;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-800">
          Tệp âm thanh (Audio MP3) <span className="text-amber-700">*</span>
        </label>
        <span className="text-xs font-medium text-neutral-400">
          Định dạng: .mp3 • Tối đa: 20 MB • Tải lên S3 khi bấm Tạo bài viết
        </span>
      </div>

      {audioFile ? (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 transition-all space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-xl bg-amber-600/10 p-2.5 text-amber-700 shrink-0">
                <FileAudio className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {audioFile.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {duration && duration > 0 ? `Thời lượng: ${formatTime(duration)} • ` : ""}
                  {formatFileSize(audioFile.size)} • audio/mpeg
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="rounded-xl p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 shrink-0"
              title="Xóa tệp âm thanh"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* S3 Upload Progress Bar (displayed during form submission) */}
          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-amber-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
                  <span>Đang tải lên AWS S3...</span>
                </span>
                <span className="font-semibold font-mono">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Status / Success Badge */}
          {isUploadSuccess ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-xs text-emerald-800">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Đã lưu trữ an toàn trên AWS S3</span>
              </span>
              {audioKey && (
                <span className="max-w-[180px] truncate text-[11px] text-emerald-700/80 font-mono">
                  {audioKey}
                </span>
              )}
            </div>
          ) : !isUploading && (
            <p className="text-xs text-neutral-400 italic">
              * Tệp sẽ được tự động tải lên AWS S3 khi bạn bấm nút &quot;Tạo bài viết&quot;.
            </p>
          )}

          {/* HTML5 Audio Player Preview */}
          {audioPreviewUrl && (
            <div className="pt-2 border-t border-amber-200/60">
              <audio
                controls
                src={audioPreviewUrl}
                className="w-full h-9 rounded-lg"
              >
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all cursor-pointer ${
            activeError
              ? "border-red-300 bg-red-50/30"
              : isDragging
              ? "border-amber-500 bg-amber-50/50"
              : "border-neutral-300 hover:border-amber-500/60 bg-neutral-50/50 hover:bg-amber-50/20"
          }`}
        >
          <div className="rounded-full bg-amber-100 p-3 text-amber-800">
            <Music className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-800">
            Kéo thả tệp âm thanh vào đây, hoặc{" "}
            <span className="text-amber-700 underline">chọn tệp từ máy</span>
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Chỉ chấp nhận tệp .mp3, dung lượng tối đa 20 MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3, audio/mpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      {activeError && !audioFile && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
};
