"use client";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  MoveDown,
  MoveUp,
  PenLine,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui";
import { NiemKinhAccordion } from "@/components/post";
import {
  DEFAULT_NIEM_KINH_DATA,
  NiemKinhContentData,
  NiemKinhStepItem,
  parseNiemKinhContent,
  serializeNiemKinhContent,
} from "../../types/niem-kinh.type";
import { RichTextEditor } from "./rich-text-editor";

interface NiemKinhStepEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export const NiemKinhStepEditor: React.FC<NiemKinhStepEditorProps> = ({
  value,
  onChange,
  error,
}) => {
  const subtitleId = useId();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Parse initial content or fallback to default template
  const initialData = React.useMemo<NiemKinhContentData>(() => {
    const parsed = parseNiemKinhContent(value);
    if (parsed && parsed.steps && parsed.steps.length > 0) {
      return parsed;
    }
    return DEFAULT_NIEM_KINH_DATA;
  }, [value]);

  const [subtitle, setSubtitle] = useState<string>(
    initialData.subtitle || "(Cho người mới bắt đầu)\n(每日功課步驟(初學者))"
  );
  const [steps, setSteps] = useState<NiemKinhStepItem[]>(initialData.steps);

  // Expanded steps in edit mode (Step 1 expanded by default)
  const [expandedStepIds, setExpandedStepIds] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    if (initialData.steps.length > 0) {
      initialSet.add(initialData.steps[0].id);
    }
    return initialSet;
  });

  // Keep parent form updated whenever steps or subtitle change
  const notifyParent = (updatedSubtitle: string, updatedSteps: NiemKinhStepItem[]) => {
    const payload: NiemKinhContentData = {
      type: "niem_kinh_steps",
      subtitle: updatedSubtitle,
      steps: updatedSteps,
    };
    onChange(serializeNiemKinhContent(payload));
  };

  // Synchronize on mount if value is empty so default steps are captured
  useEffect(() => {
    if (!value || !value.trim()) {
      notifyParent(subtitle, steps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expand / collapse a step
  const toggleStepExpand = (stepId: string) => {
    setExpandedStepIds((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedStepIds(new Set(steps.map((s) => s.id)));
  };

  const handleCollapseAll = () => {
    setExpandedStepIds(new Set());
  };

  // Update subtitle
  const handleSubtitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSub = e.target.value;
    setSubtitle(newSub);
    notifyParent(newSub, steps);
  };

  // Update step title
  const handleUpdateStepTitle = (stepId: string, newTitle: string) => {
    const updated = steps.map((s) =>
      s.id === stepId ? { ...s, title: newTitle } : s
    );
    setSteps(updated);
    notifyParent(subtitle, updated);
  };

  // Update step content
  const handleUpdateStepContent = (stepId: string, newContent: string) => {
    const updated = steps.map((s) =>
      s.id === stepId ? { ...s, content: newContent } : s
    );
    setSteps(updated);
    notifyParent(subtitle, updated);
  };

  // Move step up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...steps];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setSteps(updated);
    notifyParent(subtitle, updated);
  };

  // Move step down
  const handleMoveDown = (index: number) => {
    if (index >= steps.length - 1) return;
    const updated = [...steps];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setSteps(updated);
    notifyParent(subtitle, updated);
  };

  // Delete step
  const handleDeleteStep = (stepId: string) => {
    if (steps.length <= 1) return; // Keep at least one step
    const updated = steps.filter((s) => s.id !== stepId);
    setSteps(updated);
    setExpandedStepIds((prev) => {
      const next = new Set(prev);
      next.delete(stepId);
      return next;
    });
    notifyParent(subtitle, updated);
  };

  // CỘNG THÊM BƯỚC (Button to add step)
  const handleAddStep = () => {
    // Generate intelligent default name like "Bước X"
    let nextStepNum = steps.length + 1;
    // Look at existing "Bước N"
    const stepNumbers = steps
      .map((s) => {
        const match = s.title.match(/bước\s+(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    if (stepNumbers.length > 0) {
      nextStepNum = Math.max(...stepNumbers) + 1;
    }

    const newStepId = `step-${Date.now()}`;
    const newStep: NiemKinhStepItem = {
      id: newStepId,
      title: `Bước ${nextStepNum}`,
      content: "",
    };

    const updated = [...steps, newStep];
    setSteps(updated);

    // Automatically expand newly created step for editing
    setExpandedStepIds((prev) => {
      const next = new Set(prev);
      next.add(newStepId);
      return next;
    });

    notifyParent(subtitle, updated);
  };

  const previewData: NiemKinhContentData = {
    type: "niem_kinh_steps",
    subtitle,
    steps,
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#EDE5D8] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-amber-700 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Nội dung bài viết Niệm Kinh (Các bước tụng niệm) <span className="text-amber-700">*</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Nhập các bước theo mẫu trình bày từng bước (có thể cộng thêm bước và soạn thảo văn bản).
            </p>
          </div>
        </div>

        {/* Edit / Preview Tabs */}
        <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
              activeTab === "edit"
                ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <PenLine className="h-3.5 w-3.5 text-amber-700" />
            <span>Soạn thảo ({steps.length} bước)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-amber-700" />
            <span>Xem trước giao diện</span>
          </button>
        </div>
      </div>

      {/* 2. TAB: SOẠN THẢO (EDIT MODE) */}
      {activeTab === "edit" ? (
        <div className="space-y-4">
          {/* Subtitle / Note Field */}
          <div className="rounded-xl border border-amber-200/90 bg-[#FAF7F0] p-4 space-y-1.5">
            <label
              htmlFor={subtitleId}
              className="block text-xs font-bold text-amber-900 uppercase tracking-wider"
            >
              Phụ đề / Lời dẫn đầu mục (hiển thị căn giữa trên cùng)
            </label>
            <textarea
              id={subtitleId}
              rows={2}
              value={subtitle}
              onChange={handleSubtitleChange}
              placeholder="(Cho người mới bắt đầu)&#10;(每日功課步驟(初學者))"
              className="w-full rounded-lg border border-amber-300/80 bg-white p-2.5 text-xs sm:text-sm text-neutral-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
            />
            <p className="text-[11px] text-neutral-500">
              Ví dụ: (Cho người mới bắt đầu) xuống dòng (每日功課步驟(初學者))
            </p>
          </div>

          {/* Quick controls: Expand all / Collapse all */}
          <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
            <span className="font-semibold text-neutral-700">
              Danh sách các bước ({steps.length} bước)
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExpandAll}
                className="hover:text-amber-800 hover:underline cursor-pointer"
              >
                Mở tất cả
              </button>
              <span className="text-neutral-300">|</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="hover:text-amber-800 hover:underline cursor-pointer"
              >
                Thu gọn tất cả
              </button>
            </div>
          </div>

          {/* Steps Accordion List */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isExpanded = expandedStepIds.has(step.id);

              return (
                <div
                  key={step.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded
                      ? "border-amber-300 shadow-2xs"
                      : "border-amber-200/80 hover:border-amber-300"
                  }`}
                >
                  {/* Step Header Bar (Styling matching the screenshot) */}
                  <div className="flex items-center justify-between bg-[#FEDA7A] px-3 sm:px-4 py-2.5 select-none transition-colors">
                    {/* Left: Expand/collapse toggle + Title */}
                    <button
                      type="button"
                      onClick={() => toggleStepExpand(step.id)}
                      className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer group"
                    >
                      <span className="text-lg font-black text-[#7A1C16] leading-none shrink-0 w-4 text-center font-mono">
                        {isExpanded ? "—" : "+"}
                      </span>
                      <span className="text-sm font-bold text-[#7A1C16] truncate group-hover:underline">
                        {step.title || `Bước ${index + 1}`}
                      </span>
                      {!isExpanded && step.content && (
                        <span className="text-[11px] text-amber-900/70 italic truncate hidden md:inline">
                          (Đã có nội dung)
                        </span>
                      )}
                    </button>

                    {/* Right: Actions (Move up, Move down, Delete) */}
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Di chuyển lên"
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100/80 text-amber-900 hover:bg-amber-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === steps.length - 1}
                        title="Di chuyển xuống"
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100/80 text-amber-900 hover:bg-amber-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteStep(step.id)}
                        disabled={steps.length <= 1}
                        title="Xóa bước này"
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100/80 text-red-700 hover:bg-red-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Step Expanded Form Panel */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-[#FEF9EE] border-t border-amber-200/60 space-y-4">
                      {/* Title Edit Field */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Tiêu đề bước (vd: Bước 1, Niệm các chú nhỏ, Bước 6, Lưu ý...):
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) =>
                            handleUpdateStepTitle(step.id, e.target.value)
                          }
                          placeholder={`Bước ${index + 1}`}
                          className="w-full sm:w-80 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-neutral-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>

                      {/* Rich Text Editor for this specific step */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Nội dung của bước này (Trình soạn thảo văn bản):
                        </label>
                        <RichTextEditor
                          value={step.content}
                          onChange={(content) =>
                            handleUpdateStepContent(step.id, content)
                          }
                          placeholder={`Nhập kinh văn, số biến niệm, chỉ dẫn cho ${step.title}...`}
                          hideHeader={true}
                          minHeight="140px"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. BUTTON CỘNG THÊM BƯỚC */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleAddStep}
              variant="golden"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl py-3 px-6 shadow-sm font-semibold text-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Cộng thêm bước</span>
            </Button>
          </div>
        </div>
      ) : (
        /* 3. TAB: XEM TRƯỚC HIỂN THỊ (PREVIEW MODE) */
        <div className="rounded-2xl border border-amber-200/90 bg-white p-5 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
              <Eye className="h-4 w-4" />
              <span>Giao diện thực tế hiển thị cho Phật tử (như ảnh đính kèm)</span>
            </div>
            <span className="text-xs text-neutral-400">
              Có thể nhấn trực tiếp vào từng bước để thử đóng/mở
            </span>
          </div>

          <NiemKinhAccordion data={previewData} allowToggle={true} />
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};
