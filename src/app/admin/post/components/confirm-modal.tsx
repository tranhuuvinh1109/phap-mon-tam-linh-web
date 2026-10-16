"use client";

import { AlertTriangle, HelpCircle, Loader2, Trash2, X } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  variant = "warning",
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="h-6 w-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-600" />;
      case "info":
      default:
        return <HelpCircle className="h-6 w-6 text-sky-600" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return "bg-red-100 border-red-200";
      case "warning":
        return "bg-amber-100 border-amber-200";
      case "info":
      default:
        return "bg-sky-100 border-sky-200";
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/20";
      case "warning":
        return "bg-[#9C5812] hover:bg-[#85470D] text-white focus:ring-amber-500/20";
      case "info":
      default:
        return "bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#EDE5D8] overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${getIconBg()}`}
            >
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h3
                className="text-lg font-bold text-neutral-900 leading-snug"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-[#FBF9F4] border-t border-[#EDE5D8]">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold border-neutral-200 text-neutral-700 hover:bg-white"
          >
            {cancelText}
          </Button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-xs disabled:opacity-50 ${getConfirmButtonClasses()}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
