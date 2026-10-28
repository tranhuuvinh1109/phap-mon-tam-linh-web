"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";

import { PostItemType, useApprovePost } from "@/api/post";

interface ApprovePostModalProps {
  post: PostItemType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApprovePostModal: React.FC<ApprovePostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isVerifiedFromOrigin, setIsVerifiedFromOrigin] = useState(false);

  useEffect(() => {
    if (post) {
      setIsVerifiedFromOrigin(Boolean(post.isVerifiedFromOrigin));
    }
  }, [post]);

  const approveMutation = useApprovePost({
    onSuccess: () => {
      toast.success(`Đã phê duyệt bài viết "${post?.title}"`);
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Có lỗi xảy ra khi phê duyệt bài viết";
      toast.error(message);
    },
  });

  if (!isOpen || !post) return null;

  const handleApprove = () => {
    approveMutation.mutate({
      id: post.id,
      payload: {
        isVerifiedFromOrigin,
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
          disabled={approveMutation.isPending}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-[#F2EADB] hover:text-neutral-700 transition-colors"
          aria-label="Đóng modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200/80 mb-4">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        {/* Title & Description */}
        <h3
          className="text-lg font-bold text-amber-950"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Xác nhận phê duyệt bài viết
        </h3>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
          Bạn có chắc chắn muốn phê duyệt bài viết{" "}
          <span className="font-semibold text-amber-950">
            "{post.title}"
          </span>{" "}
          để xuất bản công khai trên hệ thống?
        </p>

        {/* Origin Verification Checkbox */}
        <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isVerifiedFromOrigin}
              onChange={(e) => setIsVerifiedFromOrigin(e.target.checked)}
              disabled={approveMutation.isPending}
              className="mt-0.5 h-4.5 w-4.5 rounded border-[#C8B89E] text-amber-800 focus:ring-amber-600 accent-amber-800 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-semibold text-amber-950">
                  Đã kiểm tra & xác minh từ nguồn gốc
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-amber-900/80 leading-normal">
                Đánh dấu bài viết đã được đối chiếu chính xác với văn bản / nguồn gốc chính thống.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={approveMutation.isPending}
            className="rounded-xl border border-[#EDE5D8] bg-[#FBF9F4] px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-[#F2EADB] hover:text-neutral-900 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {approveMutation.isPending ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang duyệt...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Xác nhận duyệt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
