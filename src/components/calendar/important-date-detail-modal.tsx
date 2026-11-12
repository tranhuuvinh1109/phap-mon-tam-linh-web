'use client';

import React from 'react';
import { Clock, Moon, Repeat, X } from 'lucide-react';
import { CalendarDayItem } from '@/api/important-date/important-date.type';
import { PostContentRenderer } from '@/components/post/post-content-renderer';
import { parseImportantDateDescription } from '@/lib/utils';
import { VIETNAMESE_WEEKDAYS } from '@/lib/vietnamese-lunar';

export interface ImportantDateDetailModalProps {
  selectedDay: CalendarDayItem | null;
  onClose: () => void;
}

/**
 * Modal showing details of important events for a selected calendar day
 */
export const ImportantDateDetailModal: React.FC<ImportantDateDetailModalProps> = ({
  selectedDay,
  onClose,
}) => {
  if (!selectedDay || selectedDay.events.length === 0) {
    return null;
  }

  const weekdayName = VIETNAMESE_WEEKDAYS[selectedDay.dayOfWeek] ?? '';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-amber-300 bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="cursor-pointer absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 pr-8">
          <div className="flex h-16 min-w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 px-2.5 text-center text-white shadow-md shadow-amber-900/20">
            <span className="text-2xl font-black leading-none">
              {selectedDay.solarDay}
            </span>
            <span className="mt-1 whitespace-nowrap text-[10px] font-bold uppercase leading-none text-amber-100">
              Tháng {selectedDay.solarMonth}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {weekdayName}, Ngày {selectedDay.solarDay} tháng{' '}
              {selectedDay.solarMonth} năm {selectedDay.solarYear}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-amber-800">
              <Moon className="h-3.5 w-3.5 text-amber-600 fill-amber-500/20" />
              <span>{selectedDay.lunarFormatted}</span>
              {selectedDay.canChiYear && (
                <span className="text-neutral-500">
                  ({selectedDay.canChiYear})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Day Events Section */}
        <div className="mt-6 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {selectedDay.events.map((evt) => {
            const parsedDesc = parseImportantDateDescription(evt.description);
            const hasDetailHtml =
              Boolean(parsedDesc.detailHtml) &&
              parsedDesc.detailHtml.trim() !== '<p><br></p>';

            return (
              <div
                key={evt.id}
                className="rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50/70 to-white p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-neutral-900">
                    {evt.title}
                  </h3>

                  {evt.recurrence === 'ANNUALLY' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                      <Repeat className="h-3 w-3" /> Lặp lại hàng năm
                    </span>
                  )}
                </div>

                {/* Practice Count Badges (optional fields) */}
                {(parsedDesc.maxRepentancePrayers || parsedDesc.maxLittleHouses) && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {parsedDesc.maxRepentancePrayers && (
                      <div className="rounded-xl border border-amber-200/80 bg-white/85 px-3 py-2">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                          Số biến Lễ Phật Đại Sám Hối Văn được niệm tối đa
                        </span>
                        <span className="mt-0.5 block text-xs font-bold text-neutral-900">
                          {parsedDesc.maxRepentancePrayers}
                        </span>
                      </div>
                    )}

                    {parsedDesc.maxLittleHouses && (
                      <div className="rounded-xl border border-amber-200/80 bg-white/85 px-3 py-2">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                          Số lượng Ngôi Nhà Nhỏ có thể đốt
                        </span>
                        <span className="mt-0.5 block text-xs font-bold text-neutral-900">
                          {parsedDesc.maxLittleHouses}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Rich Text Detail HTML + Images */}
                {hasDetailHtml && (
                  <div className="mt-3 text-xs leading-relaxed text-neutral-700">
                    <PostContentRenderer
                      content={parsedDesc.detailHtml}
                      className="text-xs [&_img]:mx-auto [&_img]:max-h-72 [&_img]:rounded-xl [&_img]:object-contain"
                    />
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 border-t border-amber-200/50 pt-2 text-[11px] text-amber-800">
                  <Clock className="h-3 w-3 text-amber-700" />
                  <span>
                    {evt.calendarType === 'LUNAR'
                      ? `Âm lịch: Ngày ${evt.lunarDay}/${evt.lunarMonth}`
                      : `Dương lịch: Ngày ${evt.solarDay}/${evt.solarMonth}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Action */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:from-amber-700 hover:to-amber-800 active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
