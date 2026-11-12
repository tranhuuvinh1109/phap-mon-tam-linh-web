'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useGetPublishedImportantDates } from '@/api/important-date';
import {
  CalendarDayItem,
  ImportantDateItemType,
} from '@/api/important-date/important-date.type';
import { LotusLogo } from '@/components/shared/lotus-logo';
import {
  ENGLISH_MONTH_NAMES,
  VIETNAMESE_WEEKDAYS,
  generateMonthCalendarDays,
  getCanChiYear,
} from '@/lib/vietnamese-lunar';
import { cn, formatImportantDateDescriptionPreview } from '@/lib/utils';
import { ImportantDateDetailModal } from './important-date-detail-modal';
import { LunarDayLabel } from './lunar-day-label';

export const ImportantDatesCalendarView: React.FC = () => {
  // Current Vietnam date (Asia/Ho_Chi_Minh)
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

  const [currentYear, setCurrentYear] = useState<number>(todayVn.year);
  const [currentMonth, setCurrentMonth] = useState<number>(todayVn.month);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDay, setSelectedDay] = useState<CalendarDayItem | null>(null);

  // Fetch all published events once with in-memory caching (30 mins staleTime)
  // Switching between months never calls backend repeatedly!
  const { data: publishedEvents = [], isLoading } = useGetPublishedImportantDates();

  // Generate calendar days locally on frontend
  const monthDays = useMemo(() => {
    return generateMonthCalendarDays(currentYear, currentMonth, publishedEvents);
  }, [currentYear, currentMonth, publishedEvents]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(todayVn.year);
    setCurrentMonth(todayVn.month);
  };

  // Calendar cells padding calculation (Sunday = 0, Monday = 1, ..., Saturday = 6)
  const paddingEmptyDays = useMemo(() => {
    if (!monthDays || monthDays.length === 0) return 0;
    return monthDays[0].dayOfWeek;
  }, [monthDays]);

  // List of all events this month for list view
  const monthEventsList = useMemo(() => {
    const list: { day: CalendarDayItem; event: ImportantDateItemType }[] = [];
    monthDays.forEach((day) => {
      day.events.forEach((evt) => {
        list.push({ day, event: evt as ImportantDateItemType });
      });
    });
    return list;
  }, [monthDays]);

  const canChiYear = monthDays?.[0]?.canChiYear ?? getCanChiYear(currentYear);
  const englishMonth = ENGLISH_MONTH_NAMES[currentMonth - 1] ?? '';

  return (
    <MainLayout activeId="lich-ngay-le" maxWidth="default">
      <div className="space-y-6">
        {/* Modern Buddhist Calendar Poster Container (Yellow/Golden Theme) */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-[#FFFDF7] via-[#FEFBF2] to-[#FAF3E3] p-4 shadow-xl shadow-amber-950/10 sm:p-6 lg:p-8">
          {/* Subtle golden radiance effect in the background */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl" />

          {/* Top Header: "THÁNG [11] November" */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/90 pb-5">
            {/* Left: Month in Vietnamese & English with Golden Seal */}
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-amber-950">
                Tháng
              </h1>
              {/* Circled Golden Seal for Month Number */}
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 font-serif text-lg sm:text-2xl font-black text-amber-950 shadow-md shadow-amber-900/20 border-2 border-amber-200/90">
                {currentMonth}
              </div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-900 italic">
                {englishMonth}
              </span>
            </div>

            {/* Right: Year & Can Chi Badge */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-200/80 px-3.5 py-1 text-xs sm:text-sm font-bold text-amber-950 border border-amber-300 shadow-2xs">
                {currentYear} • Năm {canChiYear}
              </span>
            </div>
          </div>

          {/* Navigation & Controls Bar */}
          <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoToday}
                className="cursor-pointer rounded-xl border border-amber-400 bg-amber-200/80 px-3.5 py-1.5 text-xs font-bold text-amber-950 transition hover:bg-amber-300 active:scale-95 shadow-2xs"
              >
                Hôm nay
              </button>

              <div className="flex items-center rounded-xl border border-amber-300 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Tháng trước"
                  className="cursor-pointer p-1.5 text-amber-900 transition hover:bg-amber-50 rounded-l-xl"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="min-w-[120px] px-2 text-center text-xs sm:text-sm font-bold text-amber-950">
                  Tháng {currentMonth} / {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Tháng sau"
                  className="cursor-pointer p-1.5 text-amber-900 transition hover:bg-amber-50 rounded-r-xl"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center rounded-xl border border-amber-300 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-2xs'
                    : 'text-amber-900 hover:bg-amber-50',
                )}
              >
                Lịch vạn niên
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-2xs'
                    : 'text-amber-900 hover:bg-amber-50',
                )}
              >
                Danh sách ({monthEventsList.length})
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Calendar Grid (Golden Buddhist Theme) */}
          {viewMode === 'grid' && (
            <div className="relative z-10 mt-3 overflow-x-auto rounded-2xl border-2 border-amber-300 bg-[#FFFDF9] shadow-md">
              <div className="min-w-[460px] sm:min-w-0">
                {/* Header Row: Chủ Nhật -> Thứ Bảy */}
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

                {/* Day Cells Grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-amber-200/80 bg-[#FFFDF9]">
                  {/* Padding cells */}
                  {Array.from({ length: paddingEmptyDays }).map((_, index) => (
                    <div
                      key={`pad-${index}`}
                      className="min-h-[95px] sm:min-h-[125px] lg:min-h-[140px] bg-[#FAF5E8]/40 p-1.5"
                    />
                  ))}

                  {/* Days of the Month */}
                  {monthDays.map((dayItem) => {
                    const hasEvents = dayItem.events.length > 0;
                    const isSpecialLunar = dayItem.isRam || dayItem.isMung1;

                    return (
                      <div
                        key={dayItem.solarDate}
                        onClick={() => {
                          if (hasEvents) {
                            setSelectedDay(dayItem as unknown as CalendarDayItem);
                          }
                        }}
                        className={cn(
                          'group relative flex min-h-[95px] sm:min-h-[125px] lg:min-h-[140px] flex-col p-1.5 transition-all',
                          hasEvents
                            ? 'cursor-pointer hover:bg-red-50/60'
                            : 'cursor-default',
                          dayItem.dayOfWeek === 0 && 'bg-amber-50/25',
                          dayItem.dayOfWeek === 6 && 'bg-amber-50/20',
                          dayItem.isToday && 'bg-amber-100/70 ring-2 ring-inset ring-amber-500/80',
                        )}
                      >
                        {/* Highlight box: Distinct warm crimson-amber for special event days, golden amber for Mùng 1 / 15 */}
                        <div
                          className={cn(
                            'flex flex-1 flex-col rounded-xl p-1 sm:p-1.5 transition-all',
                            hasEvents
                              ? 'border-2 border-red-500/85 bg-gradient-to-br from-amber-100/90 via-orange-50/90 to-red-100/80 shadow-sm ring-1 ring-red-400/30 group-hover:from-amber-100 group-hover:to-red-100'
                              : isSpecialLunar
                                ? 'border-2 border-amber-500/90 bg-amber-50/50 shadow-2xs ring-1 ring-amber-400/30'
                                : 'border border-transparent',
                          )}
                        >
                          {/* Top Row: Solar Day Number (Left) & Lunar Day (Right) */}
                          <div className="flex items-start justify-between gap-1">
                            {/* Solar Day */}
                            <span
                              className={cn(
                                'text-sm sm:text-lg font-black leading-none',
                                hasEvents
                                  ? 'text-red-700'
                                  : dayItem.dayOfWeek === 0
                                    ? 'text-amber-800'
                                    : dayItem.dayOfWeek === 6
                                      ? 'text-amber-900'
                                      : 'text-neutral-900',
                              )}
                            >
                              {dayItem.solarDay}
                            </span>

                            {/* Lunar Day Label ("Mùng 1", "Mùng 2", ..., "15") */}
                            <div className="text-right">
                              <span
                                title={
                                  dayItem.isMung1
                                    ? 'Ngày Mùng 1 Âm lịch'
                                    : dayItem.isRam
                                      ? 'Ngày Rằm (15) Âm lịch'
                                      : undefined
                                }
                                className={cn(
                                  'text-[11px] sm:text-xs font-bold leading-none',
                                  isSpecialLunar
                                    ? cn(
                                        'inline-block rounded-md px-1.5 py-0.5 text-white font-extrabold shadow-2xs',
                                        hasEvents ? 'bg-red-600/90' : 'bg-amber-500/90',
                                      )
                                    : hasEvents
                                      ? 'text-red-800 font-extrabold'
                                      : 'text-neutral-700',
                                )}
                              >
                                <LunarDayLabel lunarDay={dayItem.lunarDay} />
                              </span>
                            </div>
                          </div>

                          {/* Center / Body: Buddhist Event Badge / Chanting Prayer */}
                          <div className="mt-1 flex flex-1 flex-col items-center justify-center gap-1 overflow-hidden text-center">
                            {dayItem.events.map((evt: any) => (
                              <div
                                key={evt.id}
                                className="w-full flex flex-col items-center justify-center gap-1 rounded-lg p-0.5"
                              >
                                <LotusLogo
                                  size={dayItem.events.length > 1 ? 24 : 32}
                                  className="shrink-0 text-amber-600 drop-shadow-xs transition-transform duration-200 group-hover:scale-110"
                                />
                                <span
                                  className="line-clamp-2 text-[10px] sm:text-[11px] font-extrabold leading-tight text-red-800"
                                  title={evt.title}
                                >
                                  {evt.title}
                                </span>
                              </div>
                            ))}

                            {/* Chanting / Tu tập indicator for chanting days */}
                            {hasEvents && dayItem.events.some((e: any) => e.category === 'CHANTING_DAY') && (
                              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100/80 px-1 rounded-sm">
                                <span>🙏 21</span>
                              </div>
                            )}
                          </div>

                          {/* Today flag */}
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
          )}

          {/* VIEW MODE 2: List View */}
          {viewMode === 'list' && (
            <div className="relative z-10 mt-4 rounded-2xl border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-base sm:text-lg font-bold text-amber-950 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <span>
                  Các ngày lễ & sự kiện trong Tháng {currentMonth} / {currentYear}
                </span>
              </h2>

              {monthEventsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
                  <CalendarIcon className="h-12 w-12 text-amber-300 mb-3" />
                  <p className="text-sm font-medium">
                    Chưa có ngày lễ nào được ghi nhận trong tháng này.
                  </p>
                  <button
                    type="button"
                    onClick={handleGoToday}
                    className="mt-3 cursor-pointer text-xs font-bold text-amber-800 hover:underline"
                  >
                    Về tháng hiện tại
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-amber-100">
                  {monthEventsList.map(({ day, event }) => (
                    <div
                      key={`${day.solarDate}-${event.id}`}
                      onClick={() => setSelectedDay(day)}
                      className="flex cursor-pointer flex-col gap-3 py-4 transition hover:bg-amber-50/60 sm:flex-row sm:items-center sm:justify-between px-2 rounded-xl"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Date Badge */}
                        <div className="flex flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-100/80 px-3 py-1.5 text-center min-w-[55px]">
                          <span className="text-lg font-black text-amber-950 leading-none">
                            {day.solarDay}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 uppercase mt-0.5">
                            T{day.solarMonth}
                          </span>
                        </div>

                        {/* Event Details */}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                              {event.title}
                            </h3>
                            {event.recurrence === 'ANNUALLY' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                                <Repeat className="h-2.5 w-2.5" /> Hàng năm
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs font-medium text-neutral-600">
                            <span className="text-amber-800 font-semibold">
                              {day.lunarFormatted}
                            </span>
                            <span>•</span>
                            <span>
                              {event.calendarType === 'LUNAR'
                                ? 'Tính theo Âm lịch'
                                : 'Tính theo Dương lịch'}
                            </span>
                          </div>

                          {(() => {
                            const preview = formatImportantDateDescriptionPreview(
                              event.description
                            );
                            return preview ? (
                              <p className="mt-1.5 text-xs text-neutral-600 line-clamp-2">
                                {preview}
                              </p>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      <div className="self-end sm:self-center">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-200/80 px-3 py-1.5 text-xs font-bold text-amber-950 transition hover:bg-amber-300">
                          Chi tiết
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Day Details Modal (only opens when clicked date has events) */}
        <ImportantDateDetailModal
          selectedDay={selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      </div>
    </MainLayout>
  );
};
