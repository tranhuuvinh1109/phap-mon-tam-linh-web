"use client";

import React, { useState } from "react";
import { NiemKinhContentData, NiemKinhStepItem } from "@/app/admin/post/types";

interface NiemKinhAccordionProps {
  data: NiemKinhContentData;
  defaultExpandedIds?: string[];
  className?: string;
  allowToggle?: boolean;
}

export const NiemKinhAccordion: React.FC<NiemKinhAccordionProps> = ({
  data,
  defaultExpandedIds,
  className = "",
  allowToggle = true,
}) => {
  // If defaultExpandedIds not explicitly provided, open Step 1 by default
  const initialExpandedIds = React.useMemo(() => {
    if (defaultExpandedIds) return new Set(defaultExpandedIds);
    const set = new Set<string>();
    if (data.steps && data.steps.length > 0) {
      if (data.steps[0]?.id) set.add(data.steps[0].id);
    }
    return set;
  }, [data.steps, defaultExpandedIds]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(initialExpandedIds);

  const toggleStep = (stepId: string) => {
    if (!allowToggle) return;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  return (
    <div className={`niem-kinh-accordion-container w-full max-w-4xl mx-auto space-y-4 ${className}`}>
      {/* 1. Header Subtitle as in screenshot: (Cho người mới bắt đầu) / (每日功課步驟(初學者)) */}
      {data.subtitle && (
        <div className="text-center py-2 space-y-0.5">
          {data.subtitle.split("\n").map((line, idx) => (
            <p
              key={idx}
              className="text-sm sm:text-base font-semibold text-neutral-800 tracking-wide"
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {/* 2. Accordion Step Bars */}
      <div className="border border-amber-300/80 rounded-xl overflow-hidden shadow-xs divide-y divide-amber-200/90 bg-[#FEF9EE]">
        {data.steps.map((step: NiemKinhStepItem) => {
          const isExpanded = expandedIds.has(step.id);

          return (
            <div key={step.id} className="niem-kinh-step-row transition-colors">
              {/* Step Header Bar */}
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className="w-full text-left flex items-center gap-2.5 px-4 sm:px-6 py-3 bg-[#FEDA7A] hover:bg-[#FCD34D] transition-colors select-none group cursor-pointer"
                aria-expanded={isExpanded}
              >
                {/* Prefix Sign: Minus (-) when open, Plus (+) when closed */}
                <span className="text-lg sm:text-xl font-black text-[#7A1C16] leading-none shrink-0 w-4 text-center font-mono">
                  {isExpanded ? "—" : "+"}
                </span>

                {/* Step Title in deep reddish-brown font matching image */}
                <span className="text-sm sm:text-base font-bold text-[#7A1C16] tracking-tight group-hover:underline">
                  {step.title}
                </span>
              </button>

              {/* Step Content Body (when open) */}
              {isExpanded && (
                <div className="px-5 sm:px-8 py-4 sm:py-5 bg-[#FEF9EE] border-t border-amber-200/60 animate-in fade-in duration-150">
                  {step.content && step.content.trim() ? (
                    <div
                      className="rich-post-content niem-kinh-step-content text-sm sm:text-base leading-relaxed text-neutral-900"
                      dangerouslySetInnerHTML={{ __html: step.content }}
                    />
                  ) : (
                    <p className="text-xs sm:text-sm italic text-neutral-400">
                      (Nội dung bước này đang được cập nhật)
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .niem-kinh-step-content p {
          margin-bottom: 0.5rem;
        }
        .niem-kinh-step-content p:last-child {
          margin-bottom: 0;
        }
        .niem-kinh-step-content strong {
          color: #7a1c16;
          font-weight: 700;
        }
        .niem-kinh-step-content em {
          color: #c2410c;
        }
      `}</style>
    </div>
  );
};
