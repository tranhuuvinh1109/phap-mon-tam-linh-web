'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  Loader2,
  Lock,
  Moon,
  Repeat,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateImportantDate,
  useUpdateImportantDate,
} from '@/api/important-date';
import {
  CalendarType,
  CreateImportantDatePayload,
  EventStatus,
  ImportantDateItemType,
} from '@/api/important-date/important-date.type';
import {
  convertLunar2Solar,
  convertSolar2Lunar,
  getCanChiYear,
} from '@/lib/vietnamese-lunar';
import { cn } from '@/lib/utils';

interface ImportantDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: ImportantDateItemType | null;
  initialDate?: { year: number; month: number; day: number } | null;
  onSuccess?: () => void;
}

const COLOR_PALETTE = [
  { name: 'Vàng hổ phách', hex: '#D97706' },
  { name: 'Đỏ son', hex: '#DC2626' },
  { name: 'Xanh lam', hex: '#2563EB' },
  { name: 'Xanh ngọc', hex: '#059669' },
  { name: 'Tím hoa sen', hex: '#7C3AED' },
  { name: 'Hồng phấn', hex: '#E11D48' },
  { name: 'Nâu thiền', hex: '#78350F' },
];

export const ImportantDateModal: React.FC<ImportantDateModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  initialDate,
  onSuccess,
}) => {
  const isEditing = Boolean(eventToEdit);
  // Lock date inputs when opened from clicking "+" on a specific calendar day
  const isDateLocked = !isEditing && Boolean(initialDate);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calendarType, setCalendarType] = useState<CalendarType>('LUNAR');
  const [isAnnually, setIsAnnually] = useState(true);
  const [badgeColor, setBadgeColor] = useState('#D97706');
  const [priority, setPriority] = useState(0);
  const [status, setStatus] = useState<EventStatus>('PUBLISHED');

  // Solar Date fields
  const [solarYear, setSolarYear] = useState(2026);
  const [solarMonth, setSolarMonth] = useState(11);
  const [solarDay, setSolarDay] = useState(15);

  // Lunar Date fields
  const [lunarDay, setLunarDay] = useState(15);
  const [lunarMonth, setLunarMonth] = useState(4);
  const [lunarYear, setLunarYear] = useState(2026);
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  const { mutate: createEvent, isPending: isCreating } = useCreateImportantDate();
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateImportantDate();
  const isSubmitting = isCreating || isUpdating;

  // Initialize or reset form values
  useEffect(() => {
    if (!isOpen) return;

    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setCalendarType(eventToEdit.calendarType);
      setIsAnnually(eventToEdit.recurrence === 'ANNUALLY');
      setBadgeColor(eventToEdit.badgeColor || '#D97706');
      setPriority(eventToEdit.priority ?? 0);
      setStatus(eventToEdit.status);

      if (eventToEdit.solarDay && eventToEdit.solarMonth && eventToEdit.solarYear) {
        setSolarDay(eventToEdit.solarDay);
        setSolarMonth(eventToEdit.solarMonth);
        setSolarYear(eventToEdit.solarYear);
      }
      if (eventToEdit.lunarDay && eventToEdit.lunarMonth && eventToEdit.lunarYear) {
        setLunarDay(eventToEdit.lunarDay);
        setLunarMonth(eventToEdit.lunarMonth);
        setLunarYear(eventToEdit.lunarYear);
        setIsLeapMonth(Boolean(eventToEdit.isLeapMonth));
      }
    } else {
      // Create mode
      setTitle('');
      setDescription('');
      setCalendarType('LUNAR');
      setIsAnnually(true);
      setBadgeColor('#D97706');
      setPriority(0);
      setStatus('PUBLISHED');

      if (initialDate) {
        setSolarYear(initialDate.year);
        setSolarMonth(initialDate.month);
        setSolarDay(initialDate.day);
        const l = convertSolar2Lunar(initialDate.day, initialDate.month, initialDate.year);
        setLunarDay(l.day);
        setLunarMonth(l.month);
        setLunarYear(l.year);
        setIsLeapMonth(l.isLeapMonth);
      } else {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        const d = now.getDate();
        setSolarYear(y);
        setSolarMonth(m);
        setSolarDay(d);
        const l = convertSolar2Lunar(d, m, y);
        setLunarDay(l.day);
        setLunarMonth(l.month);
        setLunarYear(l.year);
        setIsLeapMonth(l.isLeapMonth);
      }
    }
  }, [isOpen, eventToEdit, initialDate]);

  // Real-time conversion preview calculation
  const conversionPreview = useMemo(() => {
    if (calendarType === 'GREGORIAN') {
      const lunar = convertSolar2Lunar(solarDay, solarMonth, solarYear);
      return {
        direction: 'solar-to-lunar',
        text: `Tương ứng Âm lịch: Ngày ${lunar.day} tháng ${lunar.month}${lunar.isLeapMonth ? ' (Nhuận)' : ''} năm ${getCanChiYear(lunar.year)} (${lunar.year})`,
        lunar,
      };
    } else {
      const solar = convertLunar2Solar(
        lunarDay,
        lunarMonth,
        lunarYear,
        isLeapMonth,
      );
      return {
        direction: 'lunar-to-solar',
        text: `Tương ứng Dương lịch: Ngày ${solar.day}/${solar.month}/${solar.year}`,
        solar,
      };
    }
  }, [
    calendarType,
    solarDay,
    solarMonth,
    solarYear,
    lunarDay,
    lunarMonth,
    lunarYear,
    isLeapMonth,
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên ngày quan trọng');
      return;
    }

    const payload: CreateImportantDatePayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      calendarType,
      recurrence: isAnnually ? 'ANNUALLY' : 'NONE',
      badgeColor,
      priority: Number(priority),
      status,
      ...(calendarType === 'GREGORIAN'
        ? {
            solarDay: Number(solarDay),
            solarMonth: Number(solarMonth),
            solarYear: Number(solarYear),
            solarDate: `${solarYear}-${String(solarMonth).padStart(2, '0')}-${String(solarDay).padStart(2, '0')}`,
          }
        : {
            lunarDay: Number(lunarDay),
            lunarMonth: Number(lunarMonth),
            lunarYear: Number(lunarYear),
            isLeapMonth,
          }),
    };

    if (isEditing && eventToEdit) {
      updateEvent(
        { id: eventToEdit.id, payload },
        {
          onSuccess: () => {
            toast.success(`Đã cập nhật sự kiện "${title.trim()}"`);
            onSuccess?.();
            onClose();
          },
          onError: (err: any) => {
            const msg =
              err?.response?.data?.message ||
              'Không thể cập nhật ngày quan trọng. Vui lòng kiểm tra lại.';
            toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
          },
        },
      );
    } else {
      createEvent(payload, {
        onSuccess: () => {
          toast.success(`Đã tạo ngày quan trọng "${title.trim()}"`);
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            'Không thể tạo ngày quan trọng. Vui lòng kiểm tra lại.';
          toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 overflow-hidden rounded-3xl border border-[#EDE5D8] bg-white p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="cursor-pointer absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#EDE5D8] pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {isEditing ? 'Chỉnh sửa ngày quan trọng' : 'Tạo mới ngày quan trọng'}
            </h2>
            <p className="text-xs text-neutral-500">
              Quản lý ngày lễ Phật giáo, ngày tụng kinh và sự kiện tâm linh
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Tên sự kiện / Ngày lễ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Đại lễ Phật Đản, Rằm Tháng Giêng, Ngày Tụng Kinh..."
              className="mt-1.5 w-full rounded-xl border border-[#DCD3C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-neutral-900 transition focus:border-amber-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Trạng thái hiển thị
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="mt-1.5 w-full rounded-xl border border-[#DCD3C5] bg-[#FAF8F5] px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 transition focus:border-amber-600 focus:bg-white focus:outline-none"
            >
              <option value="PUBLISHED">Công khai (Hiển thị người dùng)</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="INACTIVE">Vô hiệu hóa</option>
            </select>
          </div>

          {/* Calendar Type Selector */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                Hệ thống lịch tính ngày
              </label>
              {isDateLocked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-950">
                  <Lock className="h-3 w-3" />
                  Đã cố định theo ngày trên lịch
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCalendarType('LUNAR')}
                className={cn(
                  'cursor-pointer flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all',
                  calendarType === 'LUNAR'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-[#DCD3C5] hover:bg-neutral-50',
                )}
              >
                <Moon className="h-4 w-4" />
                <span>Âm lịch (Phật giáo)</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarType('GREGORIAN')}
                className={cn(
                  'cursor-pointer flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all',
                  calendarType === 'GREGORIAN'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-[#DCD3C5] hover:bg-neutral-50',
                )}
              >
                <Sun className="h-4 w-4" />
                <span>Dương lịch (Mặt trời)</span>
              </button>
            </div>

            {/* Date Inputs based on Calendar Type */}
            <div className="mt-4">
              {(() => {
                const dateInputClass = cn(
                  'mt-1 w-full rounded-xl border border-[#DCD3C5] px-3 py-2 text-center text-sm font-bold focus:outline-none',
                  isDateLocked
                    ? 'cursor-not-allowed bg-neutral-100 text-neutral-500'
                    : 'bg-white text-neutral-900 focus:border-amber-600',
                );
                const dateFields =
                  calendarType === 'LUNAR'
                    ? [
                        { label: 'Ngày (Âm lịch)', min: 1, max: 30, value: lunarDay, setter: setLunarDay },
                        { label: 'Tháng (Âm lịch)', min: 1, max: 12, value: lunarMonth, setter: setLunarMonth },
                        { label: 'Năm (Âm lịch)', min: 1900, max: 2100, value: lunarYear, setter: setLunarYear },
                      ]
                    : [
                        { label: 'Ngày (Dương lịch)', min: 1, max: 31, value: solarDay, setter: setSolarDay },
                        { label: 'Tháng (Dương lịch)', min: 1, max: 12, value: solarMonth, setter: setSolarMonth },
                        { label: 'Năm (Dương lịch)', min: 1900, max: 2100, value: solarYear, setter: setSolarYear },
                      ];

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {dateFields.map((field) => (
                        <div key={field.label}>
                          <label className="block text-[11px] font-semibold text-neutral-600">
                            {field.label}
                          </label>
                          <input
                            type="number"
                            min={field.min}
                            max={field.max}
                            value={field.value}
                            disabled={isDateLocked}
                            readOnly={isDateLocked}
                            onChange={(e) => {
                              if (!isDateLocked) field.setter(Number(e.target.value));
                            }}
                            className={dateInputClass}
                          />
                        </div>
                      ))}
                    </div>

                    {calendarType === 'LUNAR' && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="isLeapMonth"
                          checked={isLeapMonth}
                          disabled={isDateLocked}
                          onChange={(e) => {
                            if (!isDateLocked) setIsLeapMonth(e.target.checked);
                          }}
                          className={cn(
                            'h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500',
                            isDateLocked && 'cursor-not-allowed opacity-60',
                          )}
                        />
                        <label
                          htmlFor="isLeapMonth"
                          className={cn(
                            'text-xs font-medium text-neutral-700',
                            isDateLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                          )}
                        >
                          Tháng Nhuận (Nếu rơi vào tháng nhuận)
                        </label>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Dynamic conversion preview pill */}
              <div className="mt-3 rounded-xl bg-amber-100/70 border border-amber-300/80 px-3.5 py-2 text-xs font-semibold text-amber-950 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{conversionPreview.text}</span>
              </div>
            </div>
          </div>

          {/* Recurrence (Lặp lại hàng năm) */}
          <div className="flex items-center justify-between rounded-2xl border border-[#EDE5D8] bg-[#FAF8F5] p-3.5">
            <div className="flex items-center gap-2.5">
              <Repeat className="h-4 w-4 text-amber-800" />
              <div>
                <span className="block text-xs font-bold text-neutral-800">
                  Lặp lại hàng năm
                </span>
                <span className="text-[11px] text-neutral-500">
                  Sự kiện sẽ tự động xuất hiện vào chu kỳ năm kế tiếp (Ví dụ: Tết, Rằm, Phật Đản)
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnnually}
              onChange={(e) => setIsAnnually(e.target.checked)}
              className="h-5 w-5 rounded border-neutral-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Badge Color & Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Màu sắc hiển thị
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setBadgeColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    className={cn(
                      'cursor-pointer h-7 w-7 rounded-full transition-transform flex items-center justify-center text-white shadow-xs',
                      badgeColor === c.hex
                        ? 'ring-2 ring-offset-2 ring-neutral-800 scale-110'
                        : 'opacity-80 hover:opacity-100',
                    )}
                  >
                    {badgeColor === c.hex && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Độ ưu tiên hiển thị (0 - 100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                placeholder="Số càng cao càng ưu tiên trên widget"
                className="mt-1.5 w-full rounded-xl border border-[#DCD3C5] bg-[#FAF8F5] px-3.5 py-2 text-sm text-neutral-900 transition focus:border-amber-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Mô tả chi tiết / Ý nghĩa ngày lễ
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú ý nghĩa, hướng dẫn tụng kinh, lễ bái hoặc lịch trình..."
              className="mt-1.5 w-full rounded-xl border border-[#DCD3C5] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-neutral-900 transition focus:border-amber-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDE5D8]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:from-amber-800 hover:to-amber-900 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo sự kiện'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

