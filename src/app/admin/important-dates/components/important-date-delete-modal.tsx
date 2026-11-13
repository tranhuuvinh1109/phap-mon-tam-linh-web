'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDeleteImportantDate } from '@/api/important-date';
import { ImportantDateItemType } from '@/api/important-date/important-date.type';

interface ImportantDateDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ImportantDateItemType | null;
  onSuccess?: () => void;
}

export const ImportantDateDeleteModal: React.FC<ImportantDateDeleteModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess,
}) => {
  const { mutate: deleteEvent, isPending } = useDeleteImportantDate();

  if (!isOpen || !event) return null;

  const handleDelete = () => {
    deleteEvent(event.id, {
      onSuccess: () => {
        toast.success(`Đã xóa sự kiện "${event.title}"`);
        onSuccess?.();
        onClose();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ||
          'Không thể xóa ngày quan trọng này. Vui lòng thử lại sau.';
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Xác nhận xóa ngày quan trọng
            </h3>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa ngày quan trọng{' '}
              <strong className="text-neutral-900">"{event.title}"</strong>? Sự kiện này sẽ không còn hiển thị trên lịch người dùng.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Xóa sự kiện</span>
          </button>
        </div>
      </div>
    </div>
  );
};

