"use client";

import React, { useState } from "react";
import { NiemKinhContentData, NiemKinhStepItem } from "@/app/admin/post/types";

interface NiemKinhAccordionProps {
  data: NiemKinhContentData;
  defaultExpandedIds?: string[];
  className?: string;
  allowToggle?: boolean;
}

const cleanHtmlText = (str?: string) => {
  if (!str) return "";
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/&ZeroWidthSpace;/g, "")
    .replace(/\u200B/g, "");
};

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
        <div className="text-center py-2 space-y-1 px-2">
          {data.subtitle.split("\n").map((line, idx) => (
            <p
              key={idx}
              className="text-sm sm:text-base font-semibold text-neutral-800 tracking-wide break-words whitespace-normal leading-relaxed"
            >
              {cleanHtmlText(line)}
            </p>
          ))}
        </div>
      )}

      {/* 2. Accordion Step Bars */}
      <div className="border border-amber-300/80 rounded-xl overflow-hidden shadow-xs divide-y divide-amber-200/90 bg-[#FEF9EE] w-full max-w-full">
        {data.steps.map((step: NiemKinhStepItem) => {
          const isExpanded = expandedIds.has(step.id);

          return (
            <div key={step.id} className="niem-kinh-step-row w-full max-w-full transition-colors">
              {/* Step Header Bar */}
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className="w-full text-left flex items-start gap-2.5 px-3.5 sm:px-6 py-3 bg-[#FEDA7A] hover:bg-[#FCD34D] active:bg-[#F59E0B]/20 transition-colors select-none group cursor-pointer"
                aria-expanded={isExpanded}
              >
                {/* Prefix Sign: Minus (-) when open, Plus (+) when closed */}
                <span className="text-lg sm:text-xl font-black text-[#7A1C16] leading-none shrink-0 w-4 text-center font-mono mt-0.5 sm:mt-1">
                  {isExpanded ? "—" : "+"}
                </span>

                {/* Step Title in deep reddish-brown font matching image */}
                <span className="flex-1 min-w-0 text-sm sm:text-base font-bold text-[#7A1C16] tracking-tight group-hover:underline whitespace-normal break-words leading-snug">
                  {cleanHtmlText(step.title)}
                </span>
              </button>

              {/* Step Content Body (when open) */}
              {isExpanded && (
                <div className="px-3.5 sm:px-8 py-3.5 sm:py-5 bg-[#FEF9EE] border-t border-amber-200/60 animate-in fade-in duration-150 w-full max-w-full overflow-hidden">
                  {step.content && step.content.trim() ? (
                    <div
                      className="rich-post-content niem-kinh-step-content text-sm sm:text-base leading-relaxed text-neutral-900 w-full max-w-full whitespace-normal break-words"
                      dangerouslySetInnerHTML={{ __html: cleanHtmlText(step.content) }}
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
        .niem-kinh-accordion-container {
          width: 100%;
          max-width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .niem-kinh-step-row {
          width: 100%;
          max-width: 100%;
        }
        .niem-kinh-step-content {
          width: 100%;
          max-width: 100%;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
        }
        .niem-kinh-step-content *,
        .niem-kinh-step-content p,
        .niem-kinh-step-content span,
        .niem-kinh-step-content div,
        .niem-kinh-step-content strong,
        .niem-kinh-step-content b,
        .niem-kinh-step-content em,
        .niem-kinh-step-content i {
          max-width: 100% !important;
          white-space: normal !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          box-sizing: border-box !important;
        }
        .niem-kinh-step-content [style*="nowrap"],
        .niem-kinh-step-content [style*="no-wrap"] {
          white-space: normal !important;
        }
        .niem-kinh-step-content table {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: auto;
        }
        .niem-kinh-step-content img {
          max-width: 100% !important;
          height: auto !important;
        }
        .niem-kinh-step-content p {
          margin-bottom: 0.5rem;
          line-height: 1.625;
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
