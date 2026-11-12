'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Filter,
  Layers,
  Moon,
  Plus,
  Repeat,
  Search,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import {
  useGetAdminImportantDates,
  useGetPublishedImportantDates,
} from '@/api/important-date';
import {
  CalendarDayItem,
  CalendarType,
  EventStatus,
  ImportantDateItemType,
} from '@/api/important-date/important-date.type';
import { LotusLogo } from '@/components/shared/lotus-logo';
import {
  ENGLISH_MONTH_NAMES,
  VIETNAMESE_WEEKDAYS,
  generateMonthCalendarDays,
  getCanChiYear,
} from '@/lib/vietnamese-lunar';
import { LunarDayLabel } from '@/components/calendar/lunar-day-label';
import { ImportantDateModal } from './important-date-modal';
import { ImportantDateDeleteModal } from './important-date-delete-modal';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<EventStatus, { text: string; bg: string }> = {
  PUBLISHED: { text: 'Công khai', bg: 'bg-emerald-100 text-emerald-800' },
  DRAFT: { text: 'Bản nháp', bg: 'bg-amber-100 text-amber-800' },
  INACTIVE: { text: 'Vô hiệu hóa', bg: 'bg-neutral-100 text-neutral-600' },
};

export const AdminImportantDatesView: React.FC = () => {
  const todayVn = useMemo(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [y, m, d] = formatter.format(now).split('-').map(Number);
    return { year: y, month: m, day: d };
  }, []);

  const [activeTab, setActiveTab] = useState<'calendar' | 'table'>('calendar');

  // Calendar month state
  const [calYear, setCalYear] = useState<number>(todayVn.year);
  const [calMonth, setCalMonth] = useState<number>(todayVn.month);

  // Table filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ImportantDateItemType | null>(null);
  const [initialDate, setInitialDate] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ImportantDateItemType | null>(null);

  // Fetch events list once with high staleTime (30 mins). No /month calls to BE!
  const { data: allEvents = [], refetch: refetchEvents } = useGetPublishedImportantDates();

  // Admin table paginated list
  const { data: adminListData, refetch: refetchList } = useGetAdminImportantDates({
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    page,
    limit: 15,
  });

  // Generate calendar days locally on frontend
  const monthDays = useMemo(() => {
    return generateMonthCalendarDays(calYear, calMonth, allEvents);
  }, [calYear, calMonth, allEvents]);

  const handlePrevMonth = () => {
    if (calMonth === 1) {
      setCalMonth(12);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 12) {
      setCalMonth(1);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCalYear(todayVn.year);
    setCalMonth(todayVn.month);
  };

  const openCreateModal = (dayItem?: any) => {
    setEventToEdit(null);
    if (dayItem) {
      setInitialDate({
        year: dayItem.solarYear,
        month: dayItem.solarMonth,
        day: dayItem.solarDay,
      });
    } else {
      setInitialDate(null);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (event: ImportantDateItemType) => {
    setEventToEdit(event);
    setInitialDate(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (event: ImportantDateItemType) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  // Sunday = 0, Monday = 1, etc.
  const paddingEmptyDays = useMemo(() => {
    if (!monthDays || monthDays.length === 0) return 0;
    return monthDays[0].dayOfWeek;
  }, [monthDays]);

  const canChiYear = monthDays?.[0]?.canChiYear ?? getCanChiYear(calYear);
  const englishMonth = ENGLISH_MONTH_NAMES[calMonth - 1] ?? '';

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#EDE5D8] bg-white p-5 shadow-xs sm:p-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-900/15">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Quản lý Ngày Quan Trọng & Âm Lịch
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Cài đặt lịch vạn niên, ngày lễ Phật giáo, ngày tụng kinh và quản trị widget đếm ngược
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="cursor-pointer inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-amber-700 hover:to-amber-800 active:scale-95 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm ngày quan trọng</span>
        </button>
      </div>

      {/* Tabs & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center rounded-2xl border border-[#EDE5D8] bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={cn(
              'cursor-pointer flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
              activeTab === 'calendar'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900',
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Lịch tương tác</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={cn(
              'cursor-pointer flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
              activeTab === 'table'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900',
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Bảng danh sách</span>
          </button>
        </div>

        {/* Tab 1 (Calendar) Month Jump Controls */}
        {activeTab === 'calendar' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoToday}
              className="cursor-pointer rounded-xl border border-amber-300 bg-amber-100/80 px-3 py-1.5 text-xs font-bold text-amber-950 transition hover:bg-amber-200"
            >
              Hôm nay
            </button>
            <div className="flex items-center rounded-xl border border-amber-300 bg-white shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Tháng trước"
                className="cursor-pointer p-1.5 text-neutral-600 hover:bg-amber-50 rounded-l-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[120px] px-2 text-center text-xs sm:text-sm font-bold text-amber-950">
                Tháng {calMonth} / {calYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Tháng sau"
                className="cursor-pointer p-1.5 text-neutral-600 hover:bg-amber-50 rounded-r-xl"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: Calendar Grid View (Golden Buddhist Theme) */}
      {activeTab === 'calendar' && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-[#FFFDF7] via-[#FEFBF2] to-[#FAF3E3] p-4 sm:p-6 shadow-xl shadow-amber-950/10">
          {/* Header Bar inside Calendar Poster */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-amber-200/90 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-amber-950">
                Tháng
              </h2>
              {/* Circled Golden Seal for Month */}
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 font-serif text-lg sm:text-xl font-black text-amber-950 shadow-md shadow-amber-900/20 border-2 border-amber-200/90">
                {calMonth}
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold text-amber-900 italic">
                {englishMonth}
              </span>
              <span className="rounded-full bg-amber-200/80 px-3 py-1 text-xs font-bold text-amber-950 border border-amber-300 shadow-2xs">
                {calYear} • Năm {canChiYear}
              </span>
            </div>

            <p className="text-xs text-amber-900/80 italic">
              Nhấp vào biểu tượng dấu cộng (+) trên bất kỳ ngày nào để tạo sự kiện mới, hoặc nhấp vào sự kiện để chỉnh sửa.
            </p>
          </div>

          {/* Calendar Grid Container */}
          <div className="overflow-x-auto rounded-2xl border-2 border-amber-300 bg-[#FFFDF9] shadow-md">
            <div className="min-w-[450px] sm:min-w-0">
              {/* Weekday Header: Chủ Nhật -> Thứ Bảy */}
              <div className="grid grid-cols-7 border-b-2 border-amber-300 text-center text-xs font-black uppercase tracking-wider text-white">
                {VIETNAMESE_WEEKDAYS.map((label, index) => (
                  <div
                    key={label}
                    className={cn(
                      'py-2.5 sm:py-3 transition-colors',
                      index === 0 || index === 6
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 border-r border-amber-400/50',
                    )}
                  >
                    <span className="block text-[11px] sm:text-sm">{label}</span>
                  </div>
                ))}
              </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-amber-200/80 bg-[#FFFDF9]">
              {Array.from({ length: paddingEmptyDays }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="min-h-[105px] bg-[#FAF5E8]/40 p-2"
                />
              ))}

              {monthDays.map((dayItem) => {
                const hasEvents = dayItem.events.length > 0;
                const isSpecialLunar = dayItem.isRam || dayItem.isMung1;
                // Chỉ highlight viền vàng cho ngày mồng 1, ngày 15 âm lịch hàng tháng hoặc ngày có sự kiện
                const shouldHighlightBox = hasEvents || isSpecialLunar;

                return (
                  <div
                    key={dayItem.solarDate}
                    className={cn(
                      'group relative flex min-h-[105px] sm:min-h-[130px] flex-col p-1.5 transition-all hover:bg-amber-100/50',
                      dayItem.dayOfWeek === 0 && 'bg-amber-50/25',
                      dayItem.dayOfWeek === 6 && 'bg-amber-50/20',
                      dayItem.isToday && 'bg-amber-100/70 ring-2 ring-inset ring-amber-500/80',
                    )}
                  >
                    {/* Highlighted Golden box around special dates */}
                    <div
                      className={cn(
                        'flex flex-1 flex-col rounded-xl p-1 sm:p-1.5 transition-all',
                        shouldHighlightBox
                          ? 'border-2 border-amber-500/90 bg-amber-50/50 shadow-2xs ring-1 ring-amber-400/30'
                          : 'border border-transparent',
                      )}
                    >
                      {/* Top Row: Solar Day Number (Left) & Lunar Day (Right) */}
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={cn(
                            'text-sm sm:text-base font-black leading-none',
                            dayItem.dayOfWeek === 0
                              ? 'text-amber-800'
                              : dayItem.dayOfWeek === 6
                                ? 'text-amber-900'
                                : 'text-neutral-900',
                          )}
                        >
                          {dayItem.solarDay}
                        </span>

                        <div className="flex items-center gap-1">
                          <span
                            title={
                              dayItem.isMung1
                                ? 'Ngày Mùng 1 Âm lịch'
                                : dayItem.isRam
                                  ? 'Ngày Rằm (15) Âm lịch'
                                  : undefined
                            }
                            className={cn(
                              'text-[10px] sm:text-xs font-bold leading-none',
                              isSpecialLunar
                                ? 'inline-block rounded-md bg-amber-500/90 px-1 py-0.5 text-white font-extrabold shadow-2xs'
                                : 'text-neutral-700',
                            )}
                          >
                            <LunarDayLabel lunarDay={dayItem.lunarDay} />
                          </span>

                          {/* Quick Add Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreateModal(dayItem);
                            }}
                            title="Thêm sự kiện vào ngày này"
                            className="cursor-pointer opacity-0 group-hover:opacity-100 rounded-md bg-amber-200 p-0.5 text-amber-950 transition hover:bg-amber-300"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Day Events Badges */}
                      <div className="mt-1 flex flex-1 flex-col gap-1 overflow-hidden">
                        {dayItem.events.map((evt: any) => (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(evt);
                            }}
                            className="group/evt flex items-center justify-between cursor-pointer rounded-md border-l-2 bg-amber-100/90 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-950 shadow-2xs hover:bg-amber-200 transition"
                            style={{ borderLeftColor: evt.badgeColor || '#D97706' }}
                            title={evt.title}
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              <LotusLogo size={12} className="shrink-0 opacity-80 text-amber-700" />
                              <span className="truncate">{evt.title}</span>
                            </div>
                            <Edit2 className="h-2.5 w-2.5 opacity-0 group-hover/evt:opacity-100 ml-1 text-neutral-600 shrink-0" />
                          </div>
                        ))}
                      </div>

                      {dayItem.isToday && (
                        <div className="mt-auto text-right">
                          <span className="text-[9px] font-extrabold text-amber-800">
                            Hôm nay
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Table List View with Filters */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#EDE5D8] bg-white p-4 shadow-xs">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên sự kiện, ngày lễ..."
                className="w-full rounded-xl border border-[#DCD3C5] bg-[#FAF8F5] py-2 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 focus:border-amber-600 focus:bg-white focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as EventStatus | '');
                setPage(1);
              }}
              className="rounded-xl border border-[#DCD3C5] bg-[#FAF8F5] px-3 py-2 text-xs sm:text-sm text-neutral-700 focus:border-amber-600 focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PUBLISHED">Công khai</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="INACTIVE">Vô hiệu hóa</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-3xl border border-[#EDE5D8] bg-white shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm text-neutral-700">
              <thead className="border-b border-[#EDE5D8] bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                <tr>
                  <th className="px-4 py-3.5">Tên sự kiện</th>
                  <th className="px-4 py-3.5">Hệ lịch</th>
                  <th className="px-4 py-3.5">Ngày diễn ra</th>
                  <th className="px-4 py-3.5">Lặp lại</th>
                  <th className="px-4 py-3.5 text-center">Ưu tiên</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE5D8]">
                {!adminListData?.data || adminListData.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400">
                      Không tìm thấy ngày quan trọng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  adminListData.data.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-neutral-50/70"
                    >
                      <td className="px-4 py-3.5 font-bold text-neutral-900">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.badgeColor || '#D97706' }}
                          />
                          <span>{item.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        {item.calendarType === 'LUNAR' ? (
                          <span className="inline-flex items-center gap-1 text-amber-800">
                            <Moon className="h-3 w-3" /> Âm lịch
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-800">
                            <Sun className="h-3 w-3" /> Dương lịch
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-neutral-800">
                        {item.calendarType === 'LUNAR'
                          ? `Ngày ${item.lunarDay}/${item.lunarMonth} ÂL`
                          : `Ngày ${item.solarDay}/${item.solarMonth}`}
                      </td>
                      <td className="px-4 py-3.5">
                        {item.recurrence === 'ANNUALLY' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <Repeat className="h-3 w-3" /> Hàng năm
                          </span>
                        ) : (
                          <span className="text-neutral-400">Một lần</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-neutral-700">
                        {item.priority}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-bold',
                            STATUS_LABELS[item.status]?.bg || 'bg-neutral-100 text-neutral-700',
                          )}
                        >
                          {STATUS_LABELS[item.status]?.text || item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Chỉnh sửa"
                            className="cursor-pointer rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-amber-800 transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(item)}
                            title="Xóa sự kiện"
                            className="cursor-pointer rounded-lg p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {adminListData && adminListData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs text-neutral-600">
              <span>
                Hiển thị trang {adminListData.pagination.page} / {adminListData.pagination.totalPages} ({adminListData.pagination.total} mục)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="cursor-pointer rounded-lg border border-[#EDE5D8] px-3 py-1.5 font-semibold transition hover:bg-neutral-100 disabled:opacity-40"
                >
                  Trang trước
                </button>
                <button
                  type="button"
                  disabled={page >= adminListData.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="cursor-pointer rounded-lg border border-[#EDE5D8] px-3 py-1.5 font-semibold transition hover:bg-neutral-100 disabled:opacity-40"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <ImportantDateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEventToEdit(null);
          setInitialDate(null);
        }}
        eventToEdit={eventToEdit}
        initialDate={initialDate}
        onSuccess={() => {
          refetchEvents();
          refetchList();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ImportantDateDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        event={eventToDelete}
        onSuccess={() => {
          refetchEvents();
          refetchList();
        }}
      />
    </div>
  );
};
