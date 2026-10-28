"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, XCircle, X } from "lucide-react";
import toast from "react-hot-toast";

import { PostItemType, useRejectPost } from "@/api/post";

interface RejectPostModalProps {
  post: PostItemType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RejectPostModal: React.FC<RejectPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setRejectReason(post.rejectReason || "");
      setError(null);
    }
  }, [post, isOpen]);

  const rejectMutation = useRejectPost({
    onSuccess: () => {
      toast.success(`Đã từ chối bài viết "${post?.title}"`);
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Có lỗi xảy ra khi từ chối bài viết";
      toast.error(message);
    },
  });

  if (!isOpen || !post) return null;

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setError("Vui lòng nhập lý do từ chối bài viết");
      return;
    }
    if (trimmed.length < 3) {
      setError("Lý do từ chối cần tối thiểu 3 ký tự");
      return;
    }

    rejectMutation.mutate({
      id: post.id,
      payload: {
        rejectReason: trimmed,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#FBF9F4] border border-[#EDE5D8] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={rejectMutation.isPending}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-[#F2EADB] hover:text-neutral-700 transition-colors"
          aria-label="Đóng modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 border border-rose-200/80 mb-4">
          <XCircle className="h-6 w-6" />
        </div>

        {/* Title & Description */}
        <h3
          className="text-lg font-bold text-amber-950"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Xác nhận từ chối bài viết
        </h3>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
          Bài viết{" "}
          <span className="font-semibold text-amber-950">
            "{post.title}"
          </span>{" "}
          sẽ được chuyển sang trạng thái <strong>Từ chối</strong> và không hiển thị công khai.
        </p>

        {/* Form */}
        <form onSubmit={handleReject} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="reject-reason"
              className="block text-xs font-semibold text-amber-950 mb-1.5"
            >
              Lý do từ chối <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nhập cụ thể lý do từ chối bài viết (sai nguồn, thiếu nội dung, định dạng chưa đúng...)"
              disabled={rejectMutation.isPending}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? "border-rose-400 focus:ring-rose-200"
                  : "border-[#C8B89E] focus:border-amber-700 focus:ring-amber-500/20"
              }`}
            />
            {error && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={rejectMutation.isPending}
              className="rounded-xl border border-[#EDE5D8] bg-[#FBF9F4] px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-[#F2EADB] hover:text-neutral-900 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={rejectMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-rose-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-rose-800 shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {rejectMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang từ chối...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Xác nhận từ chối</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
