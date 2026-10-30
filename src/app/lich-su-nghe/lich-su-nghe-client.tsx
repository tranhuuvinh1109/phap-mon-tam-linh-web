"use client";

import {
  ChevronRight,
  Headphones,
  Home,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

import { MainLayout } from "@/components/layout";
import {
  type ListeningHistoryItem,
  useListeningHistoryList,
  useListeningHistoryStore,
} from "@/stores";

import { ClearHistoryConfirmModal, ListeningHistoryItemCard } from "./components";

export const LichSuNgheClient: React.FC = () => {
  const history = useListeningHistoryList();
  const removeHistoryItem = useListeningHistoryStore((s) => s.removeHistoryItem);
  const clearHistory = useListeningHistoryStore((s) => s.clearHistory);

  const [searchQuery, setSearchQuery] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase().trim();
    return history.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const authorMatch = (item.authorName || "").toLowerCase().includes(query);
      return titleMatch || authorMatch;
    });
  }, [history, searchQuery]);

  const handleRemoveSingle = (item: ListeningHistoryItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeHistoryItem(item.id);
    showToast(`Đã xoá bài "${item.title}" khỏi lịch sử nghe`);
  };

  const handleConfirmClearAll = () => {
    clearHistory();
    setShowClearModal(false);
    showToast("Đã xoá toàn bộ lịch sử nghe");
  };

  return (
    <MainLayout activeId="history">
      <div className="space-y-6 pb-16 sm:space-y-8">
        {/* 1. Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-neutral-500"
        >
          <Link href="/" className="flex items-center gap-1 transition hover:text-amber-700">
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <Link href="/bach-thoai-phat-phap" className="transition hover:text-amber-700">
            Bạch thoại Phật pháp
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="font-semibold text-amber-900">Lịch sử nghe</span>
        </nav>

        {/* 2. Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#EDE5D8]/90 bg-gradient-to-br from-[#FFF8EE] via-[#FAF5EC] to-[#F3E8D8] p-6 shadow-xs sm:p-8">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/70 px-3 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
                <Headphones className="h-3.5 w-3.5 text-amber-700" />
                <span>Tiến độ tu học</span>
              </div>
              <h1
                className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Lịch Sử Nghe Bạch Thoại
              </h1>
              <p className="text-xs leading-relaxed text-neutral-600 sm:text-sm">
                Theo dõi tiến độ và tiếp tục lắng nghe những pháp âm vi diệu mà bạn đã từng nghe,
                chuyển hóa tâm thức trên con đường an lạc.
              </p>
            </div>

            {/* Stats and Clear Action */}
            <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
              <div className="rounded-2xl border border-amber-200/80 bg-white/90 px-4 py-2.5 text-center shadow-2xs">
                <span className="block text-[11px] font-medium text-neutral-500">
                  Tổng số bài đã nghe
                </span>
                <span className="text-xl font-bold text-amber-900">
                  {history.length} <span className="text-xs font-normal text-neutral-600">bài</span>
                </span>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-2xs transition hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Xóa tất cả</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Search Bar */}
        {history.length > 0 && (
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài giảng trong lịch sử..."
                className="w-full rounded-2xl border border-amber-200/80 bg-white/90 py-2.5 pr-9 pl-10 text-base text-neutral-800 placeholder-neutral-400 shadow-2xs transition outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200/60 sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs font-medium text-neutral-500">
              Đang hiển thị <strong>{filteredItems.length}</strong> bài
            </div>
          </div>
        )}

        {/* 4. History Items List */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            {filteredItems.map((item) => (
              <ListeningHistoryItemCard
                key={item.id}
                item={item}
                onRemove={handleRemoveSingle}
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          /* Empty History State */
          <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-[#EDE5D8] bg-white/70 p-10 text-center shadow-2xs sm:p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-50 text-amber-800 shadow-2xs">
              <Headphones className="h-8 w-8 text-amber-700" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base font-bold text-neutral-900 sm:text-lg">
                Chưa có bài giảng nào trong lịch sử nghe
              </h3>
              <p className="text-xs leading-relaxed text-neutral-500 sm:text-sm">
                Khi bạn lắng nghe các bài giảng Bạch thoại Phật pháp, hệ thống sẽ tự động lưu lại
                tiến độ để bạn dễ dàng tiếp tục chiêm nghiệm bất cứ lúc nào.
              </p>
            </div>
            <Link
              href="/bach-thoai-phat-phap"
              className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:from-amber-800 hover:to-amber-900 sm:text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Khám phá Bạch thoại Phật pháp</span>
            </Link>
          </div>
        ) : (
          /* No search results */
          <div className="flex flex-col items-center justify-center space-y-3 rounded-3xl border border-[#EDE5D8] bg-white/70 p-10 text-center shadow-2xs">
            <Search className="h-8 w-8 text-neutral-400" />
            <h3 className="text-sm font-bold text-neutral-800 sm:text-base">
              Không tìm thấy kết quả phù hợp
            </h3>
            <p className="text-xs text-neutral-500">
              Không có bài giảng nào trong lịch sử khớp với từ khoá &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50"
            >
              <span>Xóa từ khóa tìm kiếm</span>
            </button>
          </div>
        )}

        {/* 5. Clear All Confirmation Modal */}
        <ClearHistoryConfirmModal
          isOpen={showClearModal}
          itemCount={history.length}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleConfirmClearAll}
        />

        {/* 6. Floating Toast Alert */}
        {toastMessage && (
          <div className="animate-in fade-in slide-in-from-bottom-2 fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-neutral-700 bg-neutral-900/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
            {toastMessage}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
