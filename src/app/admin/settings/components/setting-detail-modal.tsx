"use client";

import {
  Calendar,
  CheckCircle2,
  Code2,
  FolderTree,
  Key,
  Layers,
  X,
  XCircle,
} from "lucide-react";
import React from "react";

import type { SettingItemType } from "@/api/setting/setting.type";
import { Button } from "@/components/ui";

interface SettingDetailModalProps {
  setting: SettingItemType | null;
  isOpen: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
  isToggling?: boolean;
}

export const SettingDetailModal: React.FC<SettingDetailModalProps> = ({
  setting,
  isOpen,
  onClose,
  onToggle,
  isToggling = false,
}) => {
  if (!isOpen || !setting) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const hasValueConfig =
    setting.value !== undefined &&
    setting.value !== null &&
    (typeof setting.value === "object"
      ? Object.keys(setting.value).length > 0
      : String(setting.value).trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#EDE5D8] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5D8] bg-[#FBF9F4]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 font-bold">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3
                className="text-base font-bold text-neutral-900 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Chi tiết chức năng
              </h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                {setting.key}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Banner */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              setting.isEnabled
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                : "bg-neutral-50 border-neutral-200 text-neutral-700"
            }`}
          >
            <div className="flex items-center gap-3">
              {setting.isEnabled ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-neutral-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  Trạng thái hiện tại
                </p>
                <p className="text-sm font-bold mt-0.5">
                  {setting.isEnabled
                    ? "Đang bật (Hiển thị cho người dùng)"
                    : "Đang tắt (Ẩn khỏi hệ thống)"}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={setting.isEnabled ? "outline" : "golden"}
              isLoading={isToggling}
              onClick={() => onToggle(setting.id)}
              className="text-xs font-semibold shadow-xs"
            >
              {setting.isEnabled ? "Tắt chức năng" : "Bật chức năng"}
            </Button>
          </div>

          {/* Key and Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-[#EDE5D8]/80">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                Mã chức năng (Key)
              </span>
              <p className="font-mono text-xs font-bold text-neutral-900 mt-1 break-all select-all">
                {setting.key}
              </p>
            </div>

            <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-[#EDE5D8]/80">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="h-3.5 w-3.5" />
                Nhóm cấu hình
              </span>
              <p className="text-xs font-bold text-neutral-900 mt-1">
                {setting.group || "GENERAL"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Mô tả chức năng
            </label>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-800 leading-relaxed min-h-[60px]">
              {setting.description || (
                <span className="italic text-neutral-400">
                  Chưa có mô tả cho chức năng này
                </span>
              )}
            </div>
          </div>

          {/* Additional JSON Configuration */}
          {hasValueConfig && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-amber-700" />
                Cấu hình tham số (JSON Value)
              </label>
              <pre className="p-3.5 rounded-xl bg-neutral-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-48 border border-neutral-800">
                {typeof setting.value === "object"
                  ? JSON.stringify(setting.value, null, 2)
                  : String(setting.value)}
              </pre>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-[#EDE5D8]/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              <span>Tạo lúc: {formatDate(setting.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              <span>Cập nhật: {formatDate(setting.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EDE5D8] bg-[#FBF9F4] flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold border-[#EDE5D8] hover:bg-neutral-100"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
