"use client";

import { Eye, Loader2, PenLine } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to prevent SSR issues in Next.js App Router
// Wrapper component maps forwardedRef to the standard React ref required by react-quill-new
// and registers 'blob:' protocol into Quill's Image sanitizer so local preview blobs aren't converted to '//:0'
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    const Quill = RQ.Quill;
    if (Quill) {
      const Image = Quill.import("formats/image") as any;
      if (Image) {
        const originalSanitize = Image.sanitize;
        Image.sanitize = (url: string) => {
          if (
            typeof url === "string" &&
            (url.startsWith("blob:") ||
              url.startsWith("data:") ||
              url.startsWith("http://") ||
              url.startsWith("https://"))
          ) {
            return url;
          }
          return originalSanitize ? originalSanitize(url) : "//:0";
        };
        Quill.register(Image, true);
      }
    }
    return function ReactQuillWrapper({
      forwardedRef,
      ...props
    }: {
      forwardedRef?: React.Ref<any>;
      [key: string]: any;
    }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-neutral-200 bg-[#FAF7F0]/50 text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
        <span className="ml-2 text-xs font-medium">Đang tải trình soạn thảo Quill...</span>
      </div>
    ),
  }
);

export interface UploadedEditorAttachment {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  localBlobUrl?: string;
}

/**
 * Helper to replace all local blob: URLs with their actual Cloudflare R2 storage URLs
 * before submitting form content to backend
 */
export function convertBlobUrlsToR2Urls(
  htmlContent: string,
  attachments?: UploadedEditorAttachment[]
): string {
  if (!htmlContent) return htmlContent;
  let result = htmlContent;

  // 1. Direct replacement from attachments mapping if available
  if (attachments && attachments.length > 0) {
    attachments.forEach((att) => {
      if (att.localBlobUrl && att.fileUrl) {
        result = result.split(att.localBlobUrl).join(att.fileUrl);
      }
    });
  }

  // 2. Fallback regex replacement for any data-r2-url attributes on <img> tags
  result = result
    .replace(
      /<img([^>]*?)src=["']blob:[^"']+["']([^>]*?)data-r2-url=["']([^"']+)["']([^>]*?)>/gi,
      '<img$1src="$3"$2$4>'
    )
    .replace(
      /<img([^>]*?)data-r2-url=["']([^"']+)["']([^>]*?)src=["']blob:[^"']+["']([^>]*?)>/gi,
      '<img$1data-r2-url="$2"$3src="$2"$4>'
    );

  return result;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  label?: string;
  hideHeader?: boolean;
  minHeight?: string;
  onPendingImagesChange?: (imagesMap: Map<string, File>) => void;
  onAttachmentsChange?: (attachments: UploadedEditorAttachment[]) => void;
}

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ color: [] }, { background: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "color",
  "background",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "code-block",
  "align",
  "link",
  "image",
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung bài viết tại đây...",
  error,
  label = "Nội dung bài viết",
  hideHeader = false,
  minHeight = "220px",
  onPendingImagesChange,
  onAttachmentsChange,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const quillRef = useRef<any>(null);
  const pendingImagesMapRef = useRef<Map<string, File>>(new Map());

  // Custom Image Handler: Instant Local Preview via URL.createObjectURL for multiple images
  // Files are kept in memory and uploaded in parallel only when user submits the post
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", ""); // Allow selecting multiple images
    input.click();

    input.onchange = () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) return;

      const editor = quillRef.current?.getEditor
        ? quillRef.current.getEditor()
        : quillRef.current;

      if (!editor) {
        toast.error("Trình soạn thảo chưa sẵn sàng. Vui lòng thử lại.");
        return;
      }

      const range = editor.getSelection();
      let insertIndex = range
        ? range.index
        : Math.max(0, (editor.getLength?.() ?? 1) - 1);

      let addedCount = 0;
      files.forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Ảnh "${file.name}" vượt quá kích thước tối đa 10MB`);
          return;
        }

        // Tạo preview URL cục bộ
        const localPreviewUrl = URL.createObjectURL(file);
        pendingImagesMapRef.current.set(localPreviewUrl, file);

        editor.insertEmbed(insertIndex, "image", localPreviewUrl, "user");
        insertIndex += 1;
        addedCount += 1;
      });

      if (addedCount > 0) {
        editor.setSelection(insertIndex);
        if (editor.root?.innerHTML) {
          onChange(editor.root.innerHTML);
        }
        onPendingImagesChange?.(new Map(pendingImagesMapRef.current));
      }
    };
  }, [onChange, onPendingImagesChange]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ color: [] }, { background: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const handleChange = (content: string) => {
    // Quill outputs "<p><br></p>" when empty
    if (content === "<p><br></p>" || content === "<br>") {
      onChange("");
    } else {
      onChange(content);
    }
  };

  return (
    <div className="space-y-2">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-neutral-800">
            {label} <span className="text-amber-700">*</span>
          </label>

          {/* Mode switch */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors ${
                activeTab === "edit"
                  ? "bg-white font-semibold text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <PenLine className="h-3 w-3" />
              <span>Soạn thảo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors ${
                activeTab === "preview"
                  ? "bg-white font-semibold text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Xem trước</span>
            </button>
          </div>
        </div>
      )}

      <div
        className={`overflow-hidden rounded-2xl border transition-colors ${
          error
            ? "border-red-400 focus-within:ring-2 focus-within:ring-red-200"
            : "border-neutral-200 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20"
        }`}
      >
        {activeTab === "edit" ? (
          <div className="quill-editor-wrapper bg-white">
            <ReactQuill
              forwardedRef={quillRef}
              theme="snow"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              modules={modules}
              formats={QUILL_FORMATS}
            />
          </div>
        ) : (
          /* Preview Mode */
          <div className="prose prose-neutral max-h-[480px] min-h-[240px] max-w-none overflow-y-auto bg-white p-5 text-sm text-neutral-900">
            {value ? (
              <div
                dangerouslySetInnerHTML={{ __html: value }}
                className="quill-content-preview rich-post-content w-full max-w-full"
              />
            ) : (
              <p className="text-neutral-400 italic">Chưa có nội dung để xem trước.</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      {/* Embedded style adjustments for Quill toolbar to match Buddhist warm amber theme */}
      <style jsx global>{`
        .quill-editor-wrapper .ql-toolbar.ql-snow {
          background-color: #faf7f0;
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e5e5e5;
          padding: 8px 12px;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }
        .quill-editor-wrapper .ql-container.ql-snow {
          border: none;
          min-height: 220px;
          max-height: 480px;
          overflow-y: auto;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 200px;
          padding: 16px;
          line-height: 1.6;
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          font-style: normal;
          color: #a3a3a3;
          left: 16px;
          right: 16px;
        }
        .quill-editor-wrapper .ql-snow.ql-toolbar button:hover,
        .quill-editor-wrapper .ql-snow .ql-toolbar button:hover,
        .quill-editor-wrapper .ql-snow.ql-toolbar button.ql-active,
        .quill-editor-wrapper .ql-snow .ql-toolbar button.ql-active {
          color: #d97706;
        }
        .quill-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
        .quill-editor-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke,
        .quill-editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .quill-editor-wrapper .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #d97706;
        }
        .quill-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-fill,
        .quill-editor-wrapper .ql-snow .ql-toolbar button:hover .ql-fill,
        .quill-editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .quill-editor-wrapper .ql-snow .ql-toolbar button.ql-active .ql-fill {
          fill: #d97706;
        }
      `}</style>
    </div>
  );
};
