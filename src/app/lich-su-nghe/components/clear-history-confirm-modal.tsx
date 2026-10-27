"use client";

import { AlertTriangle, X } from "lucide-react";
import React, { useEffect } from "react";

interface ClearHistoryConfirmModalProps {
  isOpen: boolean;
  itemCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearHistoryConfirmModal: React.FC<ClearHistoryConfirmModalProps> = ({
  isOpen,
  itemCount,
  onClose,
  onConfirm,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-history-modal-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200"
      onClick={onClose}
    >
      <div
        className="animate-in zoom-in-95 relative w-full max-w-md space-y-4 rounded-3xl border border-[#EDE5D8] bg-white p-6 shadow-2xl duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
          aria-label="Đóng cửa sổ"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-2xs">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4
              id="clear-history-modal-title"
              className="text-base font-bold text-neutral-900"
            >
              Xóa toàn bộ lịch sử nghe?
            </h4>
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
              Hành động này sẽ xóa toàn bộ {itemCount} bài khỏi lịch sử nghe trên thiết bị này.
              Bạn sẽ không thể hoàn tác sau khi xác nhận.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 active:scale-95"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-rose-700 active:scale-95"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};
