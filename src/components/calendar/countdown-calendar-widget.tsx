'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Moon, Sparkles } from 'lucide-react';
import { useGetUpcomingImportantDate } from '@/api/important-date';
import {
  VIETNAMESE_WEEKDAYS,
  convertSolar2Lunar,
  formatLunarDate,
} from '@/lib/vietnamese-lunar';
import { cn } from '@/lib/utils';

export interface CountdownCalendarWidgetProps {
  className?: string;
  variant?: 'card' | 'compact';
}

export const CountdownCalendarWidget: React.FC<CountdownCalendarWidgetProps> = ({
  className,
}) => {
  const { data: upcomingData } = useGetUpcomingImportantDate();

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

  return (
    <Link
      href="/lich-ngay-le"
      title="Bấm để xem Lịch ngày lễ & Âm lịch chi tiết"
      className={cn(
        'group relative block w-[134px] sm:w-[154px] select-none transition-all duration-300 hover:-translate-y-1',
        className,
      )}
    >
      {/* Floating Tear-Off Calendar Block */}
      <div className="relative">
        {/* Main Front Calendar Leaf */}
        <div className="relative z-10 overflow-hidden rounded-xl border border-amber-300/90 bg-gradient-to-b from-[#FFFDF9] via-[#FCF6E8] to-[#F6E8CC] shadow-[0_18px_36px_-8px_rgba(120,53,15,0.32),0_8px_16px_-6px_rgba(120,53,15,0.20)] transition-shadow duration-300 group-hover:shadow-[0_26px_46px_-8px_rgba(120,53,15,0.42),0_12px_20px_-6px_rgba(120,53,15,0.25)]">
          {/* Top Tear-Off Binding Bar (Gáy lịch) with Ring Holes */}
          <div className="relative bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 px-2.5 pt-3 pb-2 text-center text-white">
            {/* Two Punched Binding Ring Holes */}
            <div className="pointer-events-none absolute top-1.5 inset-x-3.5 flex items-center justify-between">
              <span className="h-2 w-2 rounded-full border border-amber-950/60 bg-[#FAF7F0] shadow-inner" />
              <span className="h-2 w-2 rounded-full border border-amber-950/60 bg-[#FAF7F0] shadow-inner" />
            </div>

            <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-100">
              <span>Tháng {solarMonth}</span>
              <span className="text-amber-300/80">•</span>
              <span>{solarYear}</span>
            </div>
          </div>

          {/* Perforated Tear-Off Line */}
          <div className="border-b border-dashed border-amber-400/80 bg-amber-100/40" />

          {/* Calendar Sheet Body */}
          <div className="flex flex-col items-center px-2.5 pt-2.5 pb-3 text-center sm:px-3 sm:pt-3 sm:pb-3.5">
            {/* Weekday */}
            <span
              className={cn(
                'text-[10px] font-extrabold uppercase tracking-widest',
                isSunday ? 'text-red-700' : 'text-amber-800',
              )}
            >
              {weekdayName}
            </span>

            {/* Prominent Centered Solar Day Number */}
            <div
              className={cn(
                'mt-0.5 font-serif text-4xl sm:text-[44px] font-black leading-none tracking-tight',
                isSunday ? 'text-red-700' : 'text-amber-950',
              )}
            >
              {String(solarDay).padStart(2, '0')}
            </div>

            {/* Lunar Date Pill */}
            <div className="mt-1.5 inline-flex max-w-full items-center justify-center gap-1 rounded-full border border-amber-200/80 bg-amber-100/85 px-2 py-0.5 text-center text-[10px] font-bold leading-tight text-amber-900">
              <Moon className="h-2.5 w-2.5 shrink-0 fill-amber-500/30 text-amber-600" />
              <span>{lunarFormatted}</span>
            </div>

            {/* Hairline Divider */}
            <div className="my-2.5 h-px w-full bg-gradient-to-r from-transparent via-amber-300/90 to-transparent" />

            {/* Upcoming Event Title */}
            <div className="line-clamp-2 min-h-[30px] text-[11px] sm:text-xs font-bold leading-snug text-neutral-900 transition-colors group-hover:text-amber-800">
              {eventTitle}
            </div>

            {/* Countdown Badge & Co-occurring Events */}
            <div className="mt-2 flex w-full flex-col items-center gap-1">
              <span
                className={cn(
                  'inline-flex max-w-full items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-center text-[10px] font-bold leading-tight tracking-wide shadow-2xs',
                  isToday
                    ? 'animate-pulse bg-amber-600 text-white'
                    : 'border border-amber-300/90 bg-amber-200/85 text-amber-950',
                )}
              >
                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                <span>{countdownText}</span>
              </span>

              {coOccurringCount > 0 && (
                <span className="text-[9px] font-semibold text-neutral-500">
                  +{coOccurringCount} sự kiện khác
                </span>
              )}
            </div>

            {/* Subtle View Calendar Cue */}
            <div className="mt-2 flex items-center justify-center gap-0.5 text-[10px] font-semibold text-amber-800/80 transition-colors group-hover:text-amber-950">
              <span>Xem lịch</span>
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Stacked Underlying Calendar Sheets */}
        <div className="mx-1.5 h-1.5 rounded-b-lg border-x border-b border-amber-300/90 bg-[#EFE1C6] shadow-xs" />
        <div className="mx-3 h-1 rounded-b-md border-x border-b border-amber-300/75 bg-[#E5D2AF]" />
      </div>
    </Link>
  );
};
