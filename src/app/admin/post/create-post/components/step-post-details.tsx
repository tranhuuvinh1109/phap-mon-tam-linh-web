"use client";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileAudio,
  FileText,
  Loader2,
  Tag,
} from "lucide-react";
import React, { useState } from "react";

import { CategoryItemType } from "@/api/category";
import { uploadFile } from "@/api/file";
import { useCreatePost } from "@/api/post";
import { CreatePostPayloadType, PostItemType } from "@/api/post/post.type";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { getAudioDuration, slugify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreatePostFormValues } from "../../types/post-form.type";
import { isBachThoaiPhatPhap, isNiemKinh } from "../../utils/content-type";
import { AudioUpload } from "./audio-upload";
import { NiemKinhStepEditor } from "./niem-kinh-step-editor";
import { PostBasicFields } from "./post-basic-fields";
import { RichTextEditor } from "./rich-text-editor";
import { ThumbnailUpload } from "./thumbnail-upload";

interface StepPostDetailsProps {
  formValues: CreatePostFormValues;
  category?: CategoryItemType;
  onChangeFormValues: (values: Partial<CreatePostFormValues>) => void;
  onBack: () => void;
}

export const StepPostDetails: React.FC<StepPostDetailsProps> = ({
  formValues,
  category,
  onChangeFormValues,
  onBack,
}) => {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isThumbUploading, setIsThumbUploading] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<PostItemType | null>(null);

  const isNiemKinhPost = isNiemKinh(
    formValues.categoryId,
    category?.slug,
    category?.name
  );

  // TanStack Query Create Post Mutation
  const createPostMutation = useCreatePost({
    onSuccess: (post) => {
      setCreatedPost(post);
      setValidationSuccess(
        `Bài viết "${post.title}" đã được tạo thành công trên hệ thống!`
      );
      toast.success(`Tạo bài viết "${post.title}" thành công!`);
      router.push("/admin/post");
    },
    onError: (err) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ||
        err.message ||
        "Đã có lỗi xảy ra khi tạo bài viết.";
      const formattedError = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg;
      setSubmitError(formattedError);
      toast.error(formattedError);
    },
  });

  // Field validation
  const errors: {
    title?: string;
    slug?: string;
    audioFile?: string;
    content?: string;
  } = {};

  if (isSubmitted) {
    if (!formValues.title.trim()) {
      errors.title = "Tiêu đề bài viết là bắt buộc.";
    }

    if (
      formValues.contentType === ContentType.AUDIO &&
      !formValues.audioFile &&
      !formValues.audioUrl
    ) {
      errors.audioFile = "Vui lòng chọn tệp âm thanh định dạng .mp3 (tối đa 20 MB).";
    }

    if (
      formValues.contentType === ContentType.NORMAL &&
      !formValues.content.trim()
    ) {
      errors.content = isNiemKinhPost
        ? "Vui lòng nhập nội dung cho các bước Niệm Kinh."
        : "Nội dung bài viết không được để trống.";
    }
  }

  const isValid =
    formValues.title.trim().length > 0 &&
    (formValues.contentType !== ContentType.AUDIO ||
      formValues.audioFile !== null ||
      Boolean(formValues.audioUrl)) &&
    (formValues.contentType !== ContentType.NORMAL ||
      formValues.content.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setValidationSuccess(null);
    setSubmitError(null);

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      let uploadedAudioUrl = formValues.audioUrl;
      let uploadedAudioKey = formValues.audioKey;
      let uploadedThumbUrl = formValues.thumbnailUrl;
      let uploadedThumbKey = formValues.thumbnailKey;

      // 1. Upload Audio to S3 if not uploaded yet
      if (
        formValues.contentType === ContentType.AUDIO &&
        formValues.audioFile &&
        !uploadedAudioUrl
      ) {
        setIsAudioUploading(true);
        setAudioProgress(0);
        const audioResult = await uploadFile(formValues.audioFile, (pct) => {
          setAudioProgress(pct);
        });
        uploadedAudioUrl = audioResult.url;
        uploadedAudioKey = audioResult.key;
        setIsAudioUploading(false);
      }

      // 2. Upload Thumbnail to S3 if not uploaded yet
      if (formValues.thumbnail && !uploadedThumbUrl) {
        setIsThumbUploading(true);
        setThumbProgress(0);
        const thumbResult = await uploadFile(formValues.thumbnail, (pct) => {
          setThumbProgress(pct);
        });
        uploadedThumbUrl = thumbResult.url;
        uploadedThumbKey = thumbResult.key;
        setIsThumbUploading(false);
      }

      // Update parent form state with S3 URLs and keys
      onChangeFormValues({
        audioUrl: uploadedAudioUrl,
        audioKey: uploadedAudioKey,
        thumbnailUrl: uploadedThumbUrl,
        thumbnailKey: uploadedThumbKey,
      });

      // Extract duration if audio post
      let audioDuration = formValues.audioDuration;
      if (
        formValues.contentType === ContentType.AUDIO &&
        (!audioDuration || audioDuration <= 0) &&
        formValues.audioFile
      ) {
        audioDuration = await getAudioDuration(formValues.audioFile);
      }

      // 3. Construct CreatePostDto payload and execute mutation
      const payload: CreatePostPayloadType = {
        title: formValues.title.trim(),
        slug: formValues.slug.trim() || undefined,
        content: formValues.content || undefined,
        type: formValues.contentType,
        thumbnailUrl: uploadedThumbUrl || undefined,
        categoryId: formValues.categoryId || undefined,
        ...(formValues.contentType === ContentType.AUDIO &&
          uploadedAudioUrl && {
            audio: {
              audioUrl: uploadedAudioUrl,
              duration:
                audioDuration && audioDuration > 0
                  ? Math.round(audioDuration)
                  : undefined,
              fileSize: formValues.audioFile?.size,
              mimeType: formValues.audioFile?.type || "audio/mpeg",
            },
          }),
      };

      createPostMutation.mutate(payload);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        "Đã xảy ra lỗi khi tải tệp lên. Vui lòng thử lại.";
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setIsAudioUploading(false);
      setIsThumbUploading(false);
    }
  };

  /**
   * Handles audio file selection/removal.
   * If the post belongs to the "Bach Thoai Phat Phap" category, automatically
   * extracts the file name (excluding the extension) and populates the post title and slug.
   *
   * @param audioFile - The selected audio File or null if removed
   */
  const handleUpload = (audioFile: File | null) => {
    const updates: Partial<CreatePostFormValues> = {
      audioFile,
      audioUrl: null,
      audioKey: null,
    };

    // Determine if the current category is "Bach Thoai Phat Phap"
    const isBachThoai = isBachThoaiPhatPhap(
      formValues.categoryId,
      category?.slug,
      category?.name
    );

    // Auto-generate title and slug from the file name when an audio file is selected
    if (audioFile && isBachThoai) {
      const autoTitle = audioFile.name.replace(/\.[^/.]+$/, "").trim();
      if (autoTitle) {
        updates.title = autoTitle;
        updates.slug = slugify(autoTitle);
      }
    }

    onChangeFormValues(updates);
    setValidationSuccess(null);
    setSubmitError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Category & Content Type Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-[#FDFBF7] p-4 text-xs">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-amber-700" />
          <span className="text-neutral-500">Danh mục:</span>
          <span className="font-semibold text-neutral-800">
            {category?.name || formValues.categoryId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isNiemKinhPost ? (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900 border border-amber-300">
              <BookOpen className="h-3.5 w-3.5 text-amber-700" />
              <span>Niệm Kinh (Các bước tụng niệm)</span>
            </span>
          ) : formValues.contentType === ContentType.AUDIO ? (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900 border border-amber-300">
              <FileAudio className="h-3.5 w-3.5 text-amber-700" />
              <span>Âm thanh (AUDIO)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-900 border border-emerald-300">
              <FileText className="h-3.5 w-3.5 text-emerald-700" />
              <span>Bài viết thường (NORMAL)</span>
            </span>
          )}

          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-amber-700 hover:text-amber-900 hover:underline font-medium ml-2 disabled:opacity-50"
          >
            Đổi danh mục
          </button>
        </div>
      </div>

      {/* Error alert notice */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-fade-in"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Lỗi tải lên tệp</p>
            <p className="text-xs text-red-600/90 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Validation & S3 upload feedback notice */}
      {validationSuccess && (
        <div
          role="status"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 animate-fade-in"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{validationSuccess}</span>
          </div>
          {createdPost && (
            <button
              type="button"
              onClick={() => router.push("/admin/post")}
              className="rounded-lg bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-emerald-800 transition-colors shrink-0"
            >
              Về danh sách bài viết
            </button>
          )}
        </div>
      )}

      {/* Section 1: Basic Fields (Title, Slug, Description) */}
      <PostBasicFields
        title={formValues.title}
        slug={formValues.slug}
        description={formValues.description}
        errors={{ title: errors.title, slug: errors.slug }}
        onChangeTitle={(title, slug) => {
          onChangeFormValues({ title, slug });
          setValidationSuccess(null);
          setSubmitError(null);
        }}
        onChangeDescription={(description) => {
          onChangeFormValues({ description });
          setValidationSuccess(null);
          setSubmitError(null);
        }}
      />

      {/* Section 2: Thumbnail Image Upload */}
      <ThumbnailUpload
        thumbnail={formValues.thumbnail}
        thumbnailPreview={formValues.thumbnailPreview}
        thumbnailUrl={formValues.thumbnailUrl}
        thumbnailKey={formValues.thumbnailKey}
        isUploading={isThumbUploading}
        uploadProgress={thumbProgress}
        onChange={(thumbnail, thumbnailPreview) => {
          onChangeFormValues({
            thumbnail,
            thumbnailPreview,
            thumbnailUrl: null,
            thumbnailKey: null,
          });
          setValidationSuccess(null);
          setSubmitError(null);
        }}
      />

      {/* Section 3: Content-type specific fields */}
      {formValues.contentType === ContentType.AUDIO && (
        <div className="pt-2">
          <AudioUpload
            audioFile={formValues.audioFile}
            duration={formValues.audioDuration}
            audioKey={formValues.audioKey}
            isUploading={isAudioUploading}
            uploadProgress={audioProgress}
            isUploadSuccess={Boolean(formValues.audioUrl)}
            error={errors.audioFile}
            onChange={handleUpload}
            onDurationChange={(audioDuration) => {
              onChangeFormValues({ audioDuration });
            }}
          />
        </div>
      )}

      {formValues.contentType === ContentType.NORMAL && (
        <div className="pt-2">
          {isNiemKinhPost ? (
            <NiemKinhStepEditor
              value={formValues.content}
              error={errors.content}
              onChange={(content) => {
                onChangeFormValues({ content });
                setValidationSuccess(null);
                setSubmitError(null);
              }}
            />
          ) : (
            <RichTextEditor
              value={formValues.content}
              error={errors.content}
              onChange={(content) => {
                onChangeFormValues({ content });
                setValidationSuccess(null);
                setSubmitError(null);
              }}
            />
          )}
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#EDE5D8]/80">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại Bước 1</span>
        </Button>

        <Button
          type="submit"
          variant="golden"
          disabled={!isValid || isSubmitting || createPostMutation.isPending}
          className="w-full sm:w-auto rounded-xl px-7 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tải tệp lên S3...</span>
            </>
          ) : createPostMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang lưu bài viết...</span>
            </>
          ) : (
            <span>Tạo bài viết</span>
          )}
        </Button>
      </div>
    </form>
  );
};
