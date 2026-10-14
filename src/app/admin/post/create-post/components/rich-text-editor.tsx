"use client";

import { Eye, Loader2, PenLine } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";

import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill to prevent SSR issues in Next.js App Router
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-neutral-200 bg-[#FAF7F0]/50 text-neutral-500">
      <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
      <span className="ml-2 text-xs font-medium">Đang tải trình soạn thảo Quill...</span>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  label?: string;
  hideHeader?: boolean;
  minHeight?: string;
}

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ color: [] }, { background: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    [{ align: [] }],
    ["link"],
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
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

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
                  ? "bg-white text-neutral-900 shadow-2xs font-semibold"
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
                  ? "bg-white text-neutral-900 shadow-2xs font-semibold"
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
        className={`rounded-2xl border transition-colors overflow-hidden ${
          error
            ? "border-red-400 focus-within:ring-2 focus-within:ring-red-200"
            : "border-neutral-200 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20"
        }`}
      >
        {activeTab === "edit" ? (
          <div className="quill-editor-wrapper bg-white">
            <ReactQuill
              theme="snow"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
            />
          </div>
        ) : (
          /* Preview Mode */
          <div className="min-h-[240px] max-h-[480px] overflow-y-auto p-5 bg-white text-sm text-neutral-900 prose prose-neutral max-w-none">
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
