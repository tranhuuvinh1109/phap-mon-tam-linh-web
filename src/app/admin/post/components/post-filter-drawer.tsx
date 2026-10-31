"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Check,
  Filter,
  RotateCcw,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";

import { useGetCategories } from "@/api/category";
import { useGetGroups } from "@/api/group";
import { PostApprovalStatus } from "@/api/post";
import { Button } from "@/components/ui";
import { ContentType } from "@/enums";

export interface PostFilterState {
  categoryId?: string;
  groupId?: string;
  status: "ALL" | PostApprovalStatus;
  type: "ALL" | ContentType;
  startDate?: string;
  endDate?: string;
}

export interface PostFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PostFilterState;
  onApplyFilters: (filters: PostFilterState) => void;
  onResetFilters: () => void;
  totalResults?: number;
}

export const PostFilterDrawer: React.FC<PostFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  totalResults,
}) => {
  const [draft, setDraft] = useState<PostFilterState>(filters);

  // Sync draft with incoming filters when drawer opens
  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetCategories();

  // Find selected category object (by id or by slug)
  const selectedCategory = categories.find(
    (c) => c.id === draft.categoryId || c.slug === draft.categoryId
  );

  // Check if selected category is "khai-thi"
  const isKhaiThi = Boolean(
    selectedCategory &&
      (selectedCategory.slug === "khai-thi" ||
        selectedCategory.name.toLowerCase().includes("khai thị") ||
        selectedCategory.name.toLowerCase().includes("khai thi"))
  );

  // Fetch groups only when category is khai-thi
  const { data: groups = [], isLoading: isLoadingGroups } = useGetGroups(
    undefined,
    { enabled: isKhaiThi }
  );

  const handleCategoryChange = (catId: string) => {
    setDraft((prev) => {
      const nextCat = categories.find((c) => c.id === catId);
      const isNextKhaiThi =
        nextCat &&
        (nextCat.slug === "khai-thi" ||
          nextCat.name.toLowerCase().includes("khai thị") ||
          nextCat.name.toLowerCase().includes("khai thi"));

      return {
        ...prev,
        categoryId: catId || undefined,
        // Clear groupId if switched to non-Khai-Thị category
        groupId: isNextKhaiThi ? prev.groupId : undefined,
      };
    });
  };

  // Date range presets helper
  const handleDatePreset = (
    preset: "today" | "last7days" | "last30days" | "thisMonth" | "all"
  ) => {
    if (preset === "all") {
      setDraft((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
      return;
    }

    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const endStr = formatDate(today);
    let startStr = endStr;

    if (preset === "last7days") {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      startStr = formatDate(start);
    } else if (preset === "last30days") {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      startStr = formatDate(start);
    } else if (preset === "thisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      startStr = formatDate(start);
    }

    setDraft((prev) => ({ ...prev, startDate: startStr, endDate: endStr }));
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: PostFilterState = {
      categoryId: undefined,
      groupId: undefined,
      status: "ALL",
      type: "ALL",
      startDate: undefined,
      endDate: undefined,
    };
    setDraft(emptyFilters);
    onResetFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
        <div className="w-screen max-w-md pointer-events-auto bg-[#FBF9F4] border-l border-[#EDE5D8] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EDE5D8] px-5 py-4 bg-[#FAF7F0] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                <Filter className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3
                  className="text-base font-bold text-amber-950"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Bộ lọc bài viết
                </h3>
                <p className="text-xs text-neutral-500">
                  Tùy chỉnh tiêu chí tìm kiếm nâng cao
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#F2EADB] hover:text-neutral-700 transition cursor-pointer"
              aria-label="Đóng bộ lọc"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {/* 1. Category Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                <Tag className="h-3.5 w-3.5" />
                <span>Chuyên mục</span>
              </label>

              <select
                value={selectedCategory?.id || draft.categoryId || ""}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={isLoadingCategories}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-neutral-800 shadow-2xs outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">-- Tất cả chuyên mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Group Filter (Conditional on Khai Thị) */}
            {isKhaiThi && (
              <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                    <Users className="h-3.5 w-3.5" />
                    <span>Nhóm (Khai Thị)</span>
                  </label>
                  <span className="text-[11px] font-medium text-amber-700/80 italic">
                    Tùy chọn
                  </span>
                </div>

                <select
                  value={draft.groupId || ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      groupId: e.target.value || undefined,
                    }))
                  }
                  disabled={isLoadingGroups}
                  className="w-full rounded-xl border border-amber-300/80 bg-white px-3.5 py-2.5 text-base sm:text-sm text-neutral-800 shadow-2xs outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Tất cả nhóm bài giảng --</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  Lọc danh sách bài viết thuộc nhóm cụ thể trong chuyên mục Khai Thị.
                </p>
              </div>
            )}

            {/* 3. Date Range Picker (createdAt) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                <Calendar className="h-3.5 w-3.5" />
                <span>Ngày tạo bài viết</span>
              </label>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleDatePreset("all")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${
                    !draft.startDate && !draft.endDate
                      ? "bg-amber-800 text-white shadow-2xs"
                      : "bg-white border border-[#EDE5D8] text-neutral-600 hover:bg-[#F2EADB]"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset("today")}
                  className="rounded-lg border border-[#EDE5D8] bg-white px-2.5 py-1 font-medium text-neutral-600 hover:bg-[#F2EADB] transition cursor-pointer"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset("last7days")}
                  className="rounded-lg border border-[#EDE5D8] bg-white px-2.5 py-1 font-medium text-neutral-600 hover:bg-[#F2EADB] transition cursor-pointer"
                >
                  7 ngày qua
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset("last30days")}
                  className="rounded-lg border border-[#EDE5D8] bg-white px-2.5 py-1 font-medium text-neutral-600 hover:bg-[#F2EADB] transition cursor-pointer"
                >
                  30 ngày qua
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset("thisMonth")}
                  className="rounded-lg border border-[#EDE5D8] bg-white px-2.5 py-1 font-medium text-neutral-600 hover:bg-[#F2EADB] transition cursor-pointer"
                >
                  Tháng này
                </button>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Từ ngày
                  </span>
                  <input
                    type="date"
                    value={draft.startDate || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        startDate: e.target.value || undefined,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base sm:text-xs text-neutral-800 shadow-2xs outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Đến ngày
                  </span>
                  <input
                    type="date"
                    value={draft.endDate || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        endDate: e.target.value || undefined,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base sm:text-xs text-neutral-800 shadow-2xs outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </div>

            {/* 4. Approval Status Filter */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Trạng thái kiểm duyệt</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "ALL", label: "Tất cả trạng thái", color: "amber" },
                  { id: "APPROVED", label: "Đã duyệt", color: "emerald" },
                  { id: "PENDING", label: "Chờ duyệt", color: "amber" },
                  { id: "REJECTED", label: "Từ chối", color: "rose" },
                ].map((st) => {
                  const isSelected = draft.status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          status: st.id as any,
                        }))
                      }
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "border-amber-800 bg-amber-800 text-white shadow-2xs"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-[#F2EADB]/60"
                      }`}
                    >
                      <span>{st.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Content Type Filter */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <span>Loại bài viết</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "ALL", label: "Tất cả" },
                  { id: ContentType.NORMAL, label: "Bài viết" },
                  { id: ContentType.AUDIO, label: "Audio" },
                ].map((tp) => {
                  const isSelected = draft.type === tp.id;
                  return (
                    <button
                      key={tp.id}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          type: tp.id as any,
                        }))
                      }
                      className={`flex items-center justify-center rounded-xl border py-2 text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "border-neutral-800 bg-neutral-800 text-white shadow-2xs"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {tp.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#EDE5D8] px-5 py-4 bg-[#FAF7F0] flex items-center justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border-[#EDE5D8] px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-500" />
              <span>Thiết lập lại</span>
            </Button>

            <Button
              type="button"
              variant="golden"
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              <span>
                Áp dụng bộ lọc
                {totalResults !== undefined ? ` (${totalResults})` : ""}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
