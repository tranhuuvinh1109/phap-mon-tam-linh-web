"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  FolderTree,
  Image as ImageIcon,
  Layers,
  Loader2,
  RefreshCw,
  Sparkles,
  UploadCloud,
  Volume2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useGetCategories } from "@/api/category";
import { uploadFile } from "@/api/file";
import { useGetGroups } from "@/api/group";
import { useUpdatePost } from "@/api/post";
import type { PostItemType, UpdatePostPayloadType } from "@/api/post/post.type";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";
import { slugify } from "@/lib/utils";
import { NiemKinhStepEditor } from "../create-post/components/niem-kinh-step-editor";
import { RichTextEditor } from "../create-post/components/rich-text-editor";
import { PdfUpload } from "../create-post/components/pdf-upload";
import { parseNiemKinhContent } from "../types/niem-kinh.type";
import { allowsGroupCategory, isBachThoaiPhatPhap, isKhaiThi, isNiemKinh } from "../utils/content-type";
import { ConfirmModal } from "./confirm-modal";

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

interface UpdatePostModalProps {
  post: PostItemType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UpdatePostModal: React.FC<UpdatePostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Step indicator for Niệm Kinh posts (Step 1: Thông tin cơ bản, Step 2: Các bước Niệm Kinh)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [type, setType] = useState<ContentType>(ContentType.NORMAL);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [pendingEditorImagesMap, setPendingEditorImagesMap] = useState<
    Map<string, File>
  >(new Map());
  const [audioUrl, setAudioUrl] = useState("");

  // Attachment state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentSize, setAttachmentSize] = useState<number | null>(null);
  const [isAttachmentDeleted, setIsAttachmentDeleted] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // Upload state
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirm dialogs
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showReloadConfirm, setShowReloadConfirm] = useState(false);

  // Validation & Submit error
  const [errors, setErrors] = useState<{ title?: string; slug?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch categories for dropdown
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategories();

  // Find selected category object
  const selectedCategory = useMemo(() => {
    return categories.find((cat) => cat.id === categoryId);
  }, [categories, categoryId]);

  // Compute initial content string safely
  const initialContentStr = useMemo(() => {
    if (!post?.content) return "";
    if (typeof post.content === "string") return post.content;
    try {
      return JSON.stringify(post.content);
    } catch {
      return "";
    }
  }, [post]);

  // Populate initial values when post is selected or modal opened
  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setCategoryId(post.categoryId || post.category?.id || "");
      setGroupId(post.groupId || post.group?.id || "");
      setType(post.type || ContentType.NORMAL);
      setThumbnailUrl(post.thumbnailUrl || "");
      setContent(initialContentStr);
      setAudioUrl(post.audio?.audioUrl || "");
      setAttachmentUrl(post.attachment?.fileUrl || "");
      setAttachmentName(post.attachment?.fileName || "");
      setAttachmentSize(post.attachment?.fileSize || null);
      setPdfFile(null);
      setIsAttachmentDeleted(false);
      setErrors({});
      setSubmitError(null);
      setCurrentStep(1);
      setShowCloseConfirm(false);
      setShowReloadConfirm(false);
    }
  }, [post, isOpen, initialContentStr]);

  // Detect if current post is Niệm Kinh
  const isNiemKinhPost = useMemo(() => {
    return Boolean(
      isNiemKinh(
        categoryId,
        selectedCategory?.slug || post?.category?.slug,
        selectedCategory?.name || post?.category?.name
      ) || parseNiemKinhContent(content) !== null
    );
  }, [categoryId, selectedCategory, post, content]);

  // Detect if category supports group
  const isGroupSupported = useMemo(() => {
    return Boolean(
      allowsGroupCategory(
        categoryId,
        selectedCategory?.slug || post?.category?.slug,
        selectedCategory?.name || post?.category?.name
      )
    );
  }, [categoryId, selectedCategory, post]);

  // Detect if current post is Bach Thoai Phat Phap
  const isBachThoai = useMemo(() => {
    return Boolean(
      isBachThoaiPhatPhap(
        categoryId,
        selectedCategory?.slug || post?.category?.slug,
        selectedCategory?.name || post?.category?.name
      )
    );
  }, [categoryId, selectedCategory, post]);

  // Detect if current post is Khai Thi
  const isKhaiThiPost = useMemo(() => {
    return Boolean(
      isKhaiThi(
        categoryId,
        selectedCategory?.slug || post?.category?.slug,
        selectedCategory?.name || post?.category?.name
      )
    );
  }, [categoryId, selectedCategory, post]);

  const groupQueryParams = useMemo(() => {
    if (isBachThoai) {
      return { isSupportForBachThoaiPhatPhap: true };
    }
    return undefined;
  }, [isBachThoai]);

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

  // Ensure selected groupId is valid within filtered groups for Khai Thi
  useEffect(() => {
    if (isGroupSupported && isKhaiThiPost && groups.length > 0 && groupId) {
      const existsInGroups = groups.some((g) => g.id === groupId);
      if (!existsInGroups) {
        const defaultGroup =
          groups.find((g) => g.name.toLowerCase() === "undefined") || groups[0];
        if (defaultGroup) {
          setGroupId(defaultGroup.id);
        }
      }
    }
  }, [isGroupSupported, isKhaiThiPost, groups, groupId]);

  // Compute if form has been modified (isDirty)
  const isDirty = useMemo(() => {
    if (!post) return false;
    return (
      title !== (post.title || "") ||
      slug !== (post.slug || "") ||
      categoryId !== (post.categoryId || post.category?.id || "") ||
      groupId !== (post.groupId || post.group?.id || "") ||
      type !== (post.type || ContentType.NORMAL) ||
      thumbnailUrl !== (post.thumbnailUrl || "") ||
      content !== initialContentStr ||
      audioUrl !== (post.audio?.audioUrl || "") ||
      pdfFile !== null ||
      isAttachmentDeleted
    );
  }, [
    post,
    title,
    slug,
    categoryId,
    type,
    thumbnailUrl,
    content,
    audioUrl,
    initialContentStr,
    pdfFile,
    isAttachmentDeleted,
  ]);

  // Intercept F5 and browser reloads (Ctrl+R / Cmd+R)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"))
      ) {
        if (isDirty) {
          e.preventDefault();
          setShowReloadConfirm(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDirty]);

  // Browser beforeunload event (tab close or browser refresh button)
  useEffect(() => {
    if (!isOpen || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isOpen, isDirty]);

  // Update mutation
  const updatePostMutation = useUpdatePost({
    onSuccess: (updated) => {
      toast.success(`Cập nhật bài viết "${updated.title}" thành công!`);
      pendingEditorImagesMap.forEach((_, blobUrl) => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {}
      });
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ||
        err.message ||
        "Đã có lỗi xảy ra khi cập nhật bài viết.";
      const formatted = Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg;
      setSubmitError(formatted);
      toast.error(formatted);
    },
  });

  if (!isOpen || !post) return null;

  // Handle request to close
  const handleRequestClose = () => {
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  // Handle thumbnail file upload
  const handleThumbnailFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ (.jpg, .jpeg, .png, .webp)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh không được vượt quá 5 MB.");
      return;
    }

    try {
      setIsUploadingThumb(true);
      setThumbProgress(10);
      const res = await uploadFile(file, (percent) => setThumbProgress(percent));
      setThumbnailUrl(res.url);
      toast.success("Tải ảnh đại diện lên thành công!");
    } catch (err: any) {
      toast.error("Không thể tải ảnh lên, vui lòng thử lại!");
    } finally {
      setIsUploadingThumb(false);
      setThumbProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Validate step 1 fields
  const validateStep1 = () => {
    const newErrors: { title?: string; slug?: string } = {};
    if (!title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    }
    if (!slug.trim()) {
      newErrors.slug = "Đường dẫn slug không được để trống";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng nhập đầy đủ tiêu đề và slug bài viết!");
      return false;
    }
    return true;
  };

  // Handle Save
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitError(null);

    if (!validateStep1()) {
      if (isNiemKinhPost) setCurrentStep(1);
      return;
    }

    let uploadedFileUrl = isAttachmentDeleted
      ? undefined
      : attachmentUrl.trim() || undefined;
    let uploadedFileName = isAttachmentDeleted
      ? undefined
      : attachmentName.trim() || undefined;
    let uploadedFileSize = isAttachmentDeleted
      ? undefined
      : attachmentSize || undefined;

    if (pdfFile) {
      setIsUploadingPdf(true);
      setPdfProgress(0);
      try {
        const res = await uploadFile(
          pdfFile,
          (pct) => setPdfProgress(pct),
          "pdf"
        );
        uploadedFileUrl = res.url;
        uploadedFileName = pdfFile.name;
        uploadedFileSize = pdfFile.size;
      } catch {
        setIsUploadingPdf(false);
        setSubmitError("Lỗi khi tải tệp PDF lên R2. Vui lòng thử lại.");
        return;
      }
      setIsUploadingPdf(false);
    }

    // Upload pending editor images to R2 in parallel
    const blobRegex = /blob:[^\s"'>)]+/g;
    const activeBlobUrls = Array.from(
      new Set(content ? content.match(blobRegex) || [] : [])
    );

    const uploadedImageAttachments: Array<{
      fileUrl: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      blobUrl: string;
    }> = [];

    if (activeBlobUrls.length > 0) {
      try {
        const uploadPromises = activeBlobUrls.map(async (blobUrl) => {
          const file = pendingEditorImagesMap.get(blobUrl);
          if (!file) return null;
          const res = await uploadFile(file, undefined, "image");
          return {
            blobUrl,
            fileUrl: res.url,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || "image/jpeg",
          };
        });

        const results = await Promise.all(uploadPromises);
        results.forEach((item) => {
          if (item) uploadedImageAttachments.push(item);
        });
      } catch {
        toast.error("Không thể tải lên một số hình ảnh. Vui lòng thử lại.");
        return;
      }
    }

    let finalContent = content;
    if (finalContent && uploadedImageAttachments.length > 0) {
      uploadedImageAttachments.forEach(({ blobUrl, fileUrl }) => {
        finalContent = finalContent.split(blobUrl).join(fileUrl);
      });
    }

    const payload: UpdatePostPayloadType = {
      title: title.trim(),
      slug: slug.trim(),
      categoryId: categoryId || undefined,
      groupId: isGroupSupported ? (groupId || null) : undefined,
      type,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      content: finalContent,
      attachments:
        uploadedImageAttachments.length > 0
          ? uploadedImageAttachments.map((img) => ({
              fileUrl: img.fileUrl,
              fileName: img.fileName,
              fileSize: img.fileSize,
              mimeType: img.mimeType,
            }))
          : undefined,
      ...(type === ContentType.AUDIO && audioUrl.trim()
        ? {
          audio: {
            audioUrl: audioUrl.trim(),
          },
        }
        : {}),
      ...(uploadedFileUrl
        ? {
          attachment: {
            fileUrl: uploadedFileUrl,
            fileName:
              uploadedFileName || pdfFile?.name || "Tai-lieu-dinh-kem.pdf",
            fileSize: uploadedFileSize || pdfFile?.size,
            mimeType: "application/pdf",
          },
        }
        : isAttachmentDeleted
          ? { attachment: null }
          : {}),
    };

    updatePostMutation.mutate({
      id: post.id,
      payload,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={handleRequestClose}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-[#EDE5D8] overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5D8] bg-[#FAF7F0]/90">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 font-bold border border-amber-200">
                {isNiemKinhPost ? (
                  <Layers className="h-5 w-5 text-amber-800" />
                ) : (
                  <Sparkles className="h-5 w-5 text-amber-800" />
                )}
              </div>
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold text-neutral-900 leading-tight flex items-center gap-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  <span>Cập nhật bài viết</span>
                  {isNiemKinhPost && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                      Niệm Kinh
                    </span>
                  )}
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5 truncate max-w-md">
                  ID: {post.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isDirty && (
                <span className="hidden sm:inline-block rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-300">
                  Có thay đổi chưa lưu
                </span>
              )}
              <button
                type="button"
                onClick={handleRequestClose}
                className="rounded-xl p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Niệm Kinh Multi-Step Progress Indicator */}
          {isNiemKinhPost && (
            <div className="border-b border-[#EDE5D8] bg-[#FFFDF8] px-6 py-3">
              <div className="flex items-center justify-center max-w-sm mx-auto">
                {/* Step 1 Indicator */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 1
                        ? "bg-amber-600 text-white ring-4 ring-amber-500/20 shadow-xs"
                        : "bg-emerald-600 text-white"
                      }`}
                  >
                    {currentStep > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold ${currentStep === 1 ? "text-amber-900" : "text-neutral-600"
                        }`}
                    >
                      Bước 1
                    </p>
                    <p className="text-[11px] text-neutral-400">Thông tin cơ bản</p>
                  </div>
                </button>

                {/* Divider Arrow */}
                <div className="mx-4 text-neutral-300">
                  <ChevronRight className="h-4 w-4" />
                </div>

                {/* Step 2 Indicator */}
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) {
                      setCurrentStep(2);
                    }
                  }}
                  className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 2
                        ? "bg-amber-600 text-white ring-4 ring-amber-500/20 shadow-xs"
                        : "bg-neutral-200 text-neutral-600"
                      }`}
                  >
                    2
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold ${currentStep === 2 ? "text-amber-900" : "text-neutral-500"
                        }`}
                    >
                      Bước 2
                    </p>
                    <p className="text-[11px] text-neutral-400">Các bước Niệm Kinh</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Form Content (Scrollable) */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-red-700 leading-relaxed">
                    {submitError}
                  </div>
                </div>
              )}

              {/* VIEW FOR NIỆM KINH (STEP 1) OR NORMAL POSTS */}
              {(!isNiemKinhPost || currentStep === 1) && (
                <div className="space-y-5">
                  {/* 1. Title */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                      Tiêu đề bài viết <span className="text-amber-700">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setTitle(newTitle);
                        if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                      }}
                      placeholder="Nhập tiêu đề bài viết..."
                      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 outline-none transition focus:ring-2 ${errors.title
                          ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                          : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
                        }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* 2. Slug & Auto-slug generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-800">
                        Đường dẫn tĩnh (Slug) <span className="text-amber-700">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (title.trim()) {
                            setSlug(slugify(title));
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 transition hover:underline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Tạo từ tiêu đề</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value);
                          if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
                        }}
                        placeholder="duong-dan-bai-viet"
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono text-neutral-900 outline-none transition focus:ring-2 ${errors.slug
                            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                            : "border-neutral-200 focus:border-amber-600 focus:ring-amber-500/20"
                          }`}
                      />
                    </div>
                    {errors.slug && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {errors.slug}
                      </p>
                    )}
                  </div>

                  {/* 3. Category & Type Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                        Danh mục chuyên mục
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={isCategoriesLoading}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} ({cat.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Content Type */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                        Định dạng bài viết
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setType(ContentType.NORMAL)}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs sm:text-sm font-semibold transition ${type === ContentType.NORMAL
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs font-bold"
                              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                            }`}
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>Bài viết thường</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setType(ContentType.AUDIO)}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs sm:text-sm font-semibold transition ${type === ContentType.AUDIO
                              ? "border-sky-500 bg-sky-50 text-sky-800 shadow-2xs font-bold"
                              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                            }`}
                        >
                          <Volume2 className="h-4 w-4" />
                          <span>Audio / Bài giảng</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3.5 Group Selection (For Khai thị & Bạch thoại Phật Pháp) */}
                  {isGroupSupported && (
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-800">
                          <FolderTree className="h-4 w-4 text-amber-700" />
                          <span>Phân nhóm bài viết (Group)</span>
                        </label>
                        <span className="text-[11px] text-neutral-500">
                          Mặc định: <code className="rounded bg-amber-100/70 px-1 py-0.5 font-mono text-amber-800">undefined</code>
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mb-2.5">
                        Chọn nhóm chuyên đề cho bài viết thuộc chuyên mục <strong>{selectedCategory?.name || post?.category?.name || "Khai thị / Bạch thoại Phật Pháp"}</strong>.
                      </p>
                      <div className="relative">
                        <select
                          value={groupId}
                          onChange={(e) => setGroupId(e.target.value)}
                          disabled={isLoadingGroups}
                          className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-neutral-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 disabled:bg-neutral-100 cursor-pointer"
                        >
                          {groups
                            .filter((grp) => !grp.deletedAt)
                            .map((grp) => (
                              <option key={grp.id} value={grp.id}>
                                {grp.name} {grp.description && grp.description !== grp.name ? `— ${grp.description}` : ""}
                              </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                          {isLoadingGroups ? (
                            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                          ) : (
                            <FolderTree className="h-4 w-4 text-amber-600/70" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Thumbnail URL & Upload */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                      Ảnh đại diện bài viết (Thumbnail)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Thumbnail Preview Box */}
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt="Thumbnail preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/images/lotus-thumb.jpg";
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-7 w-7 text-neutral-400" />
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                          placeholder="https://domain.com/path-to-image.jpg"
                          className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-neutral-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                        />

                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailFileSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingThumb}
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs rounded-xl flex items-center gap-1.5 border-neutral-200 hover:bg-neutral-50"
                          >
                            {isUploadingThumb ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-700" />
                                <span>Đang tải {thumbProgress}%...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-3.5 w-3.5 text-amber-800" />
                                <span>Tải ảnh mới từ máy tính</span>
                              </>
                            )}
                          </Button>
                          {thumbnailUrl && (
                            <button
                              type="button"
                              onClick={() => setThumbnailUrl("")}
                              className="text-xs text-neutral-500 hover:text-red-600 transition"
                            >
                              Xoá ảnh
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Audio URL (if Audio Post) */}
                  {type === ContentType.AUDIO && (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-sky-900">
                        Đường dẫn file âm thanh (Audio URL)
                      </label>
                      <input
                        type="text"
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        placeholder="https://domain.com/audio/bai-giang.mp3"
                        className="w-full rounded-xl border border-sky-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-neutral-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      />
                      <p className="text-[11px] text-sky-700">
                        Hỗ trợ định dạng .mp3, .wav, .m4a.
                      </p>
                    </div>
                  )}

                  {/* 6. PDF Document Attachment */}
                  {!isNiemKinhPost && (
                    <div className="pt-1">
                      <PdfUpload
                        pdfFile={pdfFile}
                        existingUrl={isAttachmentDeleted ? null : attachmentUrl}
                        existingName={attachmentName}
                        existingSize={attachmentSize}
                        isUploading={isUploadingPdf}
                        uploadProgress={pdfProgress}
                        onChange={(file) => {
                          setPdfFile(file);
                          setIsAttachmentDeleted(false);
                        }}
                        onClear={() => {
                          setPdfFile(null);
                          setAttachmentUrl("");
                          setAttachmentName("");
                          setAttachmentSize(null);
                          setIsAttachmentDeleted(true);
                        }}
                      />
                    </div>
                  )}

                  {/* 7. Content Editor FOR REGULAR POSTS ONLY */}
                  {!isNiemKinhPost && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                        Nội dung chi tiết bài viết
                      </label>
                      <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
                        <RichTextEditor
                          value={content}
                          onChange={(val) => setContent(val)}
                          placeholder="Nhập nội dung bài viết..."
                          minHeight="280px"
                          hideHeader={true}
                          onPendingImagesChange={setPendingEditorImagesMap}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW FOR NIỆM KINH (STEP 2: CÁC BƯỚC TỤNG NIỆM) */}
              {isNiemKinhPost && currentStep === 2 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-500 font-medium">Bài viết:</span>{" "}
                      <strong className="text-xs sm:text-sm text-amber-950 font-bold">
                        {title || "Chưa đặt tiêu đề"}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span>Đổi tiêu đề/ảnh</span>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 p-4 bg-white shadow-2xs">
                    <NiemKinhStepEditor
                      value={content}
                      onChange={(newContent) => setContent(newContent)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#EDE5D8] bg-[#FBF9F4]">
              <span className="text-xs text-neutral-500">
                {isDirty ? (
                  <span className="text-amber-800 font-medium">
                    ⚠️ Có thay đổi chưa lưu
                  </span>
                ) : (
                  "Chưa có thay đổi"
                )}
              </span>

              <div className="flex items-center gap-2.5">
                {/* Cancel or Back button */}
                {isNiemKinhPost && currentStep === 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updatePostMutation.isPending}
                    onClick={() => setCurrentStep(1)}
                    className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold border-neutral-200 text-neutral-700 hover:bg-white flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Quay lại Bước 1</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updatePostMutation.isPending}
                    onClick={handleRequestClose}
                    className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold border-neutral-200 text-neutral-700 hover:bg-white"
                  >
                    Huỷ bỏ
                  </Button>
                )}

                {/* Next Step or Save button */}
                {isNiemKinhPost && currentStep === 1 ? (
                  <Button
                    type="button"
                    variant="golden"
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                      }
                    }}
                    className="rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <span>Tiếp tục sang Bước 2</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="golden"
                    disabled={updatePostMutation.isPending || !isDirty}
                    className="rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50"
                  >
                    {updatePostMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang lưu...</span>
                      </div>
                    ) : (
                      <span>Lưu thay đổi</span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Modal when user clicks close with unsaved changes */}
      <ConfirmModal
        isOpen={showCloseConfirm}
        title="Xác nhận thoát"
        description="Bạn có các thay đổi chưa được lưu trong bài viết này. Nếu đóng cửa sổ này, mọi thay đổi chưa lưu sẽ bị mất hoàn toàn. Bạn có chắc chắn muốn thoát?"
        confirmText="Rời khỏi"
        cancelText="Tiếp tục chỉnh sửa"
        variant="warning"
        onConfirm={() => {
          setShowCloseConfirm(false);
          onClose();
        }}
        onClose={() => setShowCloseConfirm(false)}
      />

      {/* Confirm Modal when user presses F5 / Reload */}
      <ConfirmModal
        isOpen={showReloadConfirm}
        title="Xác nhận tải lại trang (F5)"
        description="Bạn đang có thay đổi chưa được lưu trong bài viết. Nếu tải lại trang ngay bây giờ, mọi dữ liệu bạn vừa nhập sẽ bị mất. Bạn có chắc chắn muốn tải lại trang?"
        confirmText="Tải lại trang"
        cancelText="Ở lại trang"
        variant="warning"
        onConfirm={() => {
          setShowReloadConfirm(false);
          window.location.reload();
        }}
        onClose={() => setShowReloadConfirm(false)}
      />
    </>
  );
};
