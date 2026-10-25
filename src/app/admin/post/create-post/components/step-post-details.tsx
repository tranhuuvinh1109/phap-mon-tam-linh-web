"use client";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileAudio,
  FileText,
  FolderTree,
  Loader2,
  Tag,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import { CategoryItemType } from "@/api/category";
import { uploadFile } from "@/api/file";
import { useGetGroups } from "@/api/group";
import { useCreatePost } from "@/api/post";
import { CreatePostPayloadType, PostItemType } from "@/api/post/post.type";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { getAudioDuration, slugify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreatePostFormValues } from "../../types/post-form.type";
import { allowsGroupCategory, isBachThoaiPhatPhap, isKhaiThi, isNiemKinh } from "../../utils/content-type";
import { AudioUpload } from "./audio-upload";

/**
 * Check if metadata is absent or empty
 */
function hasNoMetadata(metadata: any): boolean {
  if (!metadata) return true;
  if (typeof metadata === "object") {
    return Object.keys(metadata).length === 0;
  }
  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);
      return !parsed || Object.keys(parsed).length === 0;
    } catch {
      return false;
    }
  }
  return false;
}
import { NiemKinhStepEditor } from "./niem-kinh-step-editor";
import { PostBasicFields } from "./post-basic-fields";
import { RichTextEditor } from "./rich-text-editor";
import { ThumbnailUpload } from "./thumbnail-upload";
import { PdfUpload } from "./pdf-upload";

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
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<PostItemType | null>(null);

  const isNiemKinhPost = isNiemKinh(
    formValues.categoryId,
    category?.slug,
    category?.name
  );

  const isBachThoaiPost = isBachThoaiPhatPhap(
    formValues.categoryId,
    category?.slug,
    category?.name
  );

  const isKhaiThiPost = isKhaiThi(
    formValues.categoryId,
    category?.slug,
    category?.name
  );

  const isGroupSupported = allowsGroupCategory(
    formValues.categoryId,
    category?.slug,
    category?.name
  );

  const groupQueryParams = useMemo(() => {
    if (isBachThoaiPost) {
      return { isSupportForBachThoaiPhatPhap: true };
    }
    return undefined;
  }, [isBachThoaiPost]);

  const { data: rawGroups = [], isLoading: isLoadingGroups } = useGetGroups(
    groupQueryParams,
    { enabled: isGroupSupported }
  );

  // Filter groups: If Khai Thi, only include groups without metadata and the undefined group
  const groups = useMemo(() => {
    if (!isKhaiThiPost) return rawGroups;

    return rawGroups.filter((grp) => {
      if (grp.deletedAt) return false;

      // Group 'undefined'
      const isUndefined =
        grp.name.toLowerCase() === "undefined" ||
        grp.name.toLowerCase() === "không xác định";
      if (isUndefined) return true;

      // Group không có metadata
      return hasNoMetadata(grp.metadata);
    });
  }, [rawGroups, isKhaiThiPost]);

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

    const hasPdf = Boolean(formValues.pdfFile) || Boolean(formValues.fileUrl);

    if (
      formValues.contentType === ContentType.NORMAL &&
      !formValues.content.trim() &&
      !hasPdf
    ) {
      errors.content = isNiemKinhPost
        ? "Vui lòng nhập nội dung cho các bước Niệm Kinh."
        : "Nội dung bài viết không được để trống (hoặc đính kèm tệp PDF).";
    }
  }

  const hasContentOrPdf =
    formValues.content.trim().length > 0 ||
    Boolean(formValues.pdfFile) ||
    Boolean(formValues.fileUrl);

  const isValid =
    formValues.title.trim().length > 0 &&
    (formValues.contentType !== ContentType.AUDIO ||
      formValues.audioFile !== null ||
      Boolean(formValues.audioUrl)) &&
    (formValues.contentType !== ContentType.NORMAL || hasContentOrPdf);

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

      // 3. Upload PDF to R2 (folder: 'pdf') if attached
      let uploadedFileUrl = formValues.fileUrl;
      let uploadedFileName = formValues.fileName;
      let uploadedFileSize = formValues.fileSize;

      if (formValues.pdfFile && !uploadedFileUrl) {
        setIsPdfUploading(true);
        setPdfProgress(0);
        const pdfResult = await uploadFile(
          formValues.pdfFile,
          (pct) => setPdfProgress(pct),
          "pdf"
        );
        uploadedFileUrl = pdfResult.url;
        uploadedFileName = formValues.pdfFile.name;
        uploadedFileSize = formValues.pdfFile.size;
        setIsPdfUploading(false);
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
        groupId: isGroupSupported ? (formValues.groupId || undefined) : undefined,
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
        ...(uploadedFileUrl && {
          attachment: {
            fileUrl: uploadedFileUrl,
            fileName:
              uploadedFileName ||
              formValues.pdfFile?.name ||
              "Tai-lieu-dinh-kem.pdf",
            fileSize: uploadedFileSize || formValues.pdfFile?.size,
            mimeType: "application/pdf",
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
      setIsPdfUploading(false);
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
        onChangeSlug={(slug) => {
          onChangeFormValues({ slug });
          setValidationSuccess(null);
          setSubmitError(null);
        }}
        onChangeDescription={(description) => {
          onChangeFormValues({ description });
          setValidationSuccess(null);
          setSubmitError(null);
        }}
      />

      {/* Section 1.5: Group Selection (For Khai thị & Bạch thoại Phật Pháp) */}
      {isGroupSupported && (
        <div className="rounded-2xl border border-[#EDE5D8] bg-[#FDFBF7]/80 p-5 shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
            <label
              htmlFor="post-group-select"
              className="flex items-center gap-2 text-sm font-semibold text-neutral-800"
            >
              <FolderTree className="h-4 w-4 text-amber-700" />
              <span>Phân nhóm bài viết (Group)</span>
              <span className="text-xs font-normal text-neutral-500">
                (Tùy chọn)
              </span>
            </label>
            <span className="text-xs text-neutral-500">
              Mặc định: <code className="rounded bg-amber-100/70 px-1.5 py-0.5 font-mono text-amber-800 text-[11px]">undefined</code>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            Chọn nhóm chuyên đề cho bài viết thuộc chuyên mục <strong>{category?.name || "Khai thị / Bạch thoại Phật Pháp"}</strong>. Nếu để trống, hệ thống sẽ tự động gán vào nhóm mặc định (<code className="text-amber-800">undefined</code>).
          </p>

          <div className="relative">
            <select
              id="post-group-select"
              value={formValues.groupId || ""}
              onChange={(e) => {
                onChangeFormValues({ groupId: e.target.value || null });
                setValidationSuccess(null);
                setSubmitError(null);
              }}
              disabled={isLoadingGroups}
              className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 transition-colors focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {groups
                .filter((grp) => !grp.deletedAt)
                .map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400">
              {isLoadingGroups ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              ) : (
                <FolderTree className="h-4 w-4 text-amber-600/70" />
              )}
            </div>
          </div>
        </div>
      )}

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
      {formValues.contentType === ContentType.NORMAL && !isNiemKinhPost && (
        <div className="pt-2">
          <PdfUpload
            pdfFile={formValues.pdfFile || null}
            existingUrl={formValues.fileUrl}
            existingName={formValues.fileName}
            existingSize={formValues.fileSize}
            isUploading={isPdfUploading}
            uploadProgress={pdfProgress}
            onChange={(pdfFile) => {
              onChangeFormValues({
                pdfFile,
                fileUrl: null,
                fileName: pdfFile?.name || null,
                fileSize: pdfFile?.size || null,
              });
              setValidationSuccess(null);
              setSubmitError(null);
            }}
            onClear={() => {
              onChangeFormValues({
                pdfFile: null,
                fileUrl: null,
                fileName: null,
                fileSize: null,
              });
            }}
          />
        </div>
      )}

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
