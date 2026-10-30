"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetPendingPostsCount } from "@/api/post";

export const AdminNotificationBell: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: pendingData } = useGetPendingPostsCount();
  const pendingCount = pendingData?.count || 0;

  // Handle clicking outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = () => {
    setIsOpen(false);
    router.push("/admin/post/pending");
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#EDE5D8] bg-[#FBF9F4] text-neutral-600 transition-all hover:bg-[#F2EADB] hover:text-amber-900 focus:ring-2 focus:ring-amber-500/20 focus:outline-none active:scale-95"
        aria-label="Thông báo hệ thống"
        aria-expanded={isOpen}
      >
        <Bell className="h-4.5 w-4.5 text-neutral-700" />
        {pendingCount > 0 && (
          <span className="animate-in zoom-in absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-[#FAF7F0]">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popup */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-24px)] rounded-2xl border border-[#EDE5D8] bg-[#FBF9F4] p-3 shadow-xl duration-150 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EDE5D8] px-1.5 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-amber-950">Thông báo</span>
              {pendingCount > 0 && (
                <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                  {pendingCount} mới
                </span>
              )}
            </div>
            {pendingCount > 0 && (
              <button
                onClick={handleNotificationClick}
                className="text-xs font-medium text-amber-800 transition-colors hover:text-amber-950"
              >
                Xem tất cả
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto pr-0.5">
            {pendingCount > 0 ? (
              <div
                onClick={handleNotificationClick}
                className="group flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-amber-200/80 hover:bg-[#F2EADB]/80 active:scale-[0.99]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 text-amber-800">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-neutral-900 group-hover:text-amber-900">
                      Bài viết chờ duyệt
                    </p>
                    <span className="shrink-0 text-[10px] text-neutral-400">Mới</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                    Có <span className="font-bold text-amber-900">{pendingCount}</span> bài viết
                    đang chờ duyệt. Vui lòng kiểm tra.
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 self-center text-neutral-400 transition-colors group-hover:text-amber-800" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200/60 bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-neutral-700">
                  Không có thông báo nào cần xử lý.
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  Hệ thống đã xử lý hết các yêu cầu xét duyệt.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
