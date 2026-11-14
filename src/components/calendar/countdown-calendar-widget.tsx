'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  ChevronUp,
  Flame,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useGetUpcomingImportantDate } from '@/api/important-date';
import {
  VIETNAMESE_WEEKDAYS,
  convertSolar2Lunar,
  formatLunarDate,
} from '@/lib/vietnamese-lunar';
import { cn, parseImportantDateDescription } from '@/lib/utils';

const STORAGE_KEY = 'countdown_calendar_widget_collapsed';

const formatPracticeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/Lễ Phật Đại Sám Hối Văn/gi, 'LPĐSHV')
    .replace(/Ngôi Nhà Nhỏ/gi, 'NNN')
    .replace(/ngôi nhà nhỏ/gi, 'NNN');
};

const renderWithHighlightedNumbers = (text: string) => {
  if (!text) return null;
  const formatted = formatPracticeText(text);
  const parts = formatted.split(/(\d+)/g);

  return (
    <span className="font-bold text-neutral-800">
      {parts.map((part, index) => {
        if (/^\d+$/.test(part)) {
          return (
            <span key={index} className="font-black text-red-600">
              {part}
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};

export interface CountdownCalendarWidgetProps {
  className?: string;
  variant?: 'card' | 'compact';
}

export const CountdownCalendarWidget: React.FC<CountdownCalendarWidgetProps> = ({
  className,
}) => {
  const { data: upcomingData } = useGetUpcomingImportantDate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore user collapse state on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const toggleCollapsed = (nextState: boolean) => {
    setIsCollapsed(nextState);
    try {
      localStorage.setItem(STORAGE_KEY, String(nextState));
    } catch {
      // Ignore storage access errors
    }
  };

  // Fallback to today's date in Asia/Ho_Chi_Minh if no upcoming event or loading
  const fallbackToday = useMemo(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [year, month, day] = formatter.format(now).split('-').map(Number);
    const lunar = convertSolar2Lunar(day, month, year);
    return {
      solarDay: day,
      solarMonth: month,
      solarYear: year,
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      lunarFormatted: formatLunarDate(lunar),
    };
  }, []);

  const solarDay = upcomingData?.solarDay ?? fallbackToday.solarDay;
  const solarMonth = upcomingData?.solarMonth ?? fallbackToday.solarMonth;
  const solarYear = upcomingData?.solarYear ?? fallbackToday.solarYear;
  const lunarFormatted = upcomingData?.lunarFormatted ?? fallbackToday.lunarFormatted;
  const eventTitle = upcomingData?.event?.title ?? 'Lịch Phật Giáo & Âm Lịch';
  const countdownText = upcomingData?.countdownText ?? 'Xem ngày lễ';
  const isToday = upcomingData?.isToday ?? false;
  const coOccurringCount = upcomingData?.coOccurringEvents?.length ?? 0;

  const dayOfWeek = useMemo(() => {
    return new Date(Date.UTC(solarYear, solarMonth - 1, solarDay)).getUTCDay();
  }, [solarYear, solarMonth, solarDay]);

  const weekdayName = VIETNAMESE_WEEKDAYS[dayOfWeek] ?? '';
  const isSunday = dayOfWeek === 0;

  const practiceInfo = useMemo(() => {
    if (!upcomingData) return null;
    const events = [
      upcomingData.event,
      ...(upcomingData.coOccurringEvents || []),
    ].filter(Boolean);

    let maxRepentancePrayers = '';
    let maxLittleHouses = '';

    for (const evt of events) {
      if (evt?.description) {
        const parsed = parseImportantDateDescription(evt.description);
        if (!maxRepentancePrayers && parsed.maxRepentancePrayers) {
          maxRepentancePrayers = parsed.maxRepentancePrayers.trim();
        }
        if (!maxLittleHouses && parsed.maxLittleHouses) {
          maxLittleHouses = parsed.maxLittleHouses.trim();
        }
      }
    }

    if (!maxRepentancePrayers && !maxLittleHouses) return null;
    return { maxRepentancePrayers, maxLittleHouses };
  }, [upcomingData]);

  // Notification-style Calendar icon with red badge when collapsed
  if (isCollapsed) {
    const badgeCount = upcomingData?.event ? upcomingData.totalEventsOnDate : null;

    return (
      <button
        type="button"
        onClick={() => toggleCollapsed(false)}
        aria-label="Mở rộng lịch đếm ngược"
        title={
          upcomingData?.event
            ? `${eventTitle} (${countdownText})${practiceInfo?.maxRepentancePrayers
              ? ` • LPĐSHV: ${formatPracticeText(practiceInfo.maxRepentancePrayers)}`
              : ''
            }${practiceInfo?.maxLittleHouses
              ? ` • NNN: ${formatPracticeText(practiceInfo.maxLittleHouses)}`
              : ''
            } - Bấm để mở tờ lịch`
            : 'Bấm để mở lịch đếm ngược'
        }
        className={cn(
          'group relative flex h-11 w-11 sm:h-12 sm:w-12 cursor-pointer items-center justify-center rounded-2xl border border-amber-300/90 bg-gradient-to-b from-[#FFFDF9] via-[#FCF6E8] to-[#F6E8CC] text-amber-800 shadow-[0_14px_28px_-6px_rgba(120,53,15,0.34),0_6px_12px_-4px_rgba(120,53,15,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400 hover:text-amber-950 hover:shadow-[0_18px_34px_-6px_rgba(120,53,15,0.42)] active:scale-95',
          className,
        )}
      >
        <Calendar className="h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform duration-300 group-hover:scale-110" />

        {/* Red Notification Badge */}
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
          {isToday && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          )}
          {badgeCount ? (
            <span className="relative flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-extrabold leading-none text-white shadow-xs">
              {badgeCount}
            </span>
          ) : (
            <span className="relative h-3 w-3 rounded-full border-2 border-white bg-red-600 shadow-xs" />
          )}
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'group relative block w-[214px] sm:w-[236px] select-none transition-all duration-300 hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Collapse Button */}
      <button
        type="button"
        onClick={() => toggleCollapsed(true)}
        aria-label="Thu gọn lịch đếm ngược"
        title="Thu gọn"
        className="cursor-pointer absolute -top-2 -right-2 z-20 flex h-5.5 w-5.5 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-900 shadow-md transition-all hover:scale-110 hover:bg-amber-50 hover:text-amber-950 active:scale-95"
      >
        <ChevronUp className="h-3 w-3" />
      </button>

      <Link
        href="/lich-ngay-le"
        title="Bấm để xem Lịch ngày lễ & Âm lịch chi tiết"
        className="block"
      >
        {/* Floating Tear-Off Calendar Card */}
        <div className="relative">
          {/* Main Front Card */}
          <div className="relative z-10 overflow-hidden rounded-2xl border border-amber-300/90 bg-gradient-to-b from-[#FFFDF9] via-[#FCF6E8] to-[#F6E8CC] p-2.5 sm:p-3 shadow-[0_12px_24px_-6px_rgba(120,53,15,0.28),0_4px_10px_-4px_rgba(120,53,15,0.16)] transition-shadow duration-300 group-hover:shadow-[0_18px_32px_-6px_rgba(120,53,15,0.36),0_6px_14px_-4px_rgba(120,53,15,0.20)]">
            {/* Top Row: Left Calendar Tile + Right Event Info */}
            <div className="flex items-center gap-2.5">
              {/* Left Mini Tear-Off Date Tile */}
              <div className="relative flex h-[64px] w-[54px] sm:h-[68px] sm:w-[58px] shrink-0 flex-col items-center justify-between overflow-hidden rounded-xl border border-amber-300/90 bg-gradient-to-b from-[#FFFDF9] to-[#FAF1DE] shadow-2xs">
                {/* Binding header bar */}
                <div className="relative w-full bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 py-0.5 text-center text-[8.5px] font-extrabold uppercase tracking-wider text-amber-100 leading-tight">
                  <span className="pointer-events-none absolute top-1 left-1.5 h-1 w-1 rounded-full bg-[#FAF7F0] opacity-80" />
                  <span className="pointer-events-none absolute top-1 right-1.5 h-1 w-1 rounded-full bg-[#FAF7F0] opacity-80" />
                  <span>T.{solarMonth}</span>
                </div>

                {/* Perforated tear line */}
                <div className="w-full border-b border-dashed border-amber-300/70" />

                {/* Solar day number */}
                <div
                  className={cn(
                    'my-auto font-serif text-2xl sm:text-[26px] font-black leading-none',
                    isSunday ? 'text-red-700' : 'text-amber-950',
                  )}
                >
                  {String(solarDay).padStart(2, '0')}
                </div>

                {/* Lunar date pill at bottom */}
                <div className="w-full bg-amber-100/90 py-0.5 text-center text-[7.5px] sm:text-[8px] font-bold text-amber-900 leading-none truncate px-0.5">
                  {lunarFormatted}
                </div>
              </div>

              {/* Right Event Info Column */}
              <div className="flex min-w-0 flex-1 flex-col justify-between h-[64px] sm:h-[68px]">
                {/* Weekday & Countdown Pill */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      'text-[9.5px] font-extrabold uppercase tracking-wider truncate',
                      isSunday ? 'text-red-700' : 'text-amber-800',
                    )}
                  >
                    {weekdayName}
                  </span>
                  <span
                    className={cn(
                      'hidden sm:inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold leading-none tracking-tight shadow-2xs shrink-0',
                      isToday
                        ? 'animate-pulse bg-amber-600 text-white'
                        : 'border border-amber-300/80 bg-amber-200/90 text-amber-950',
                    )}
                  >
                    <Sparkles className="h-2 w-2 shrink-0" />
                    <span>{countdownText}</span>
                  </span>
                </div>

                {/* Event Title */}
                <div className="line-clamp-2 text-[11px] sm:text-xs font-bold leading-tight text-neutral-900 transition-colors group-hover:text-amber-800 my-auto">
                  {eventTitle}
                </div>

                {/* Co-occurring count & View calendar link */}
                <div className="flex items-center justify-between text-[9px] text-amber-800/80">
                  {coOccurringCount > 0 ? (
                    <span className="font-semibold text-neutral-500">
                      +{coOccurringCount} sự kiện khác
                    </span>
                  ) : (
                    <>
                      <span className="hidden sm:inline text-[8.5px] text-neutral-400">
                        Năm {solarYear}
                      </span>
                      <span
                        className={cn(
                          'sm:hidden inline-flex items-center gap-0.5 text-[8.5px] font-bold truncate',
                          isToday ? 'text-amber-700' : 'text-amber-900',
                        )}
                      >
                        <Sparkles className="h-2 w-2 shrink-0 text-amber-600" />
                        <span>{countdownText}</span>
                      </span>
                    </>
                  )}
                  <span className="inline-flex items-center gap-0.5 font-bold text-amber-800 group-hover:text-amber-950">
                    <span>Xem lịch</span>
                    <ChevronRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Practice Guidance Limits (LPĐSHV & NNN) */}
            {practiceInfo && (practiceInfo.maxRepentancePrayers || practiceInfo.maxLittleHouses) && (
              <div className="mt-2 pt-1.5 border-t border-amber-300/70 space-y-0.5 text-left">
                {practiceInfo.maxRepentancePrayers && (
                  <div className="flex items-baseline gap-1.5 text-[9.5px] sm:text-[10px] leading-tight">
                    <BookOpen className="h-2.5 w-2.5 shrink-0 text-amber-700 self-center" />
                    <span className="font-semibold text-amber-900/90 shrink-0">
                      LPĐSHV tối đa:
                    </span>
                    {renderWithHighlightedNumbers(practiceInfo.maxRepentancePrayers)}
                  </div>
                )}

                {practiceInfo.maxLittleHouses && (
                  <div className="flex items-baseline gap-1.5 text-[9px] sm:text-[9.5px] leading-tight">
                    <Flame className="h-2.5 w-2.5 shrink-0 text-orange-600 self-center" />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-amber-900/90">Đốt NNN: </span>
                      {renderWithHighlightedNumbers(practiceInfo.maxLittleHouses)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stacked Underlying Calendar Sheet for 3D effect */}
          <div className="mx-2 h-1 rounded-b-md border-x border-b border-amber-300/80 bg-[#EFE1C6] shadow-2xs" />
        </div>
      </Link>
    </div>
  );
};
