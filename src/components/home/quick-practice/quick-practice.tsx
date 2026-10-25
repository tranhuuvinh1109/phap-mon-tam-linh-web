import {
  BookOpen,
  Flame,
  HeartHandshake,
  Home as House,
  Sparkles,
  Twitter as Bird,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { LotusLogo } from "@/components/shared/lotus-logo";
import { QUICK_PRACTICE_ITEMS, QuickPracticeItem } from "@/constants/home.constants";

interface QuickPracticeProps {
  className?: string;
  items?: QuickPracticeItem[];
}

function getIconSrc(iconType: string): string {
  if (iconType.startsWith("/")) return iconType;
  return `/images/icon/${iconType}`;
}

function isImageIcon(type: string): boolean {
  return (
    type.endsWith(".png") ||
    type.endsWith(".jpg") ||
    type.endsWith(".jpeg") ||
    type.endsWith(".webp") ||
    type.endsWith(".svg") ||
    type.includes("/")
  );
}

export const QuickPractice: React.FC<QuickPracticeProps> = ({
  className = "",
  items = QUICK_PRACTICE_ITEMS,
}) => {
  const renderIcon = (type: string) => {
    switch (type) {
      case "book":
        return <BookOpen className="h-7 w-7 text-[#B46A10]" />;
      case "house":
        return <House className="h-7 w-7 text-[#A85816]" />;
      case "bird":
        return <Bird className="h-7 w-7 text-[#168378]" />;
      case "prayer":
        return <HeartHandshake className="h-7 w-7 text-[#B84E38]" />;
      case "lotus":
        return <LotusLogo size={28} />;
      default:
        return <Sparkles className="h-7 w-7 text-[#B46A10]" />;
    }
  };

  return (
    <section className={`space-y-3.5 sm:space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-100/90 text-amber-800 shadow-2xs border border-amber-200/60">
          <Flame className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-amber-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Hướng dẫn tu tập
            </h3>
            <span className="rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-800">
              Tu tập mỗi ngày
            </span>
          </div>
          <p className="hidden text-xs text-neutral-500 sm:block">
            Nghi thức căn bản và phương pháp trợ duyên trên bước đường tu học
          </p>
        </div>
      </div>

      {/* Grid of 5 Category Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-track-click={`quick_practice_${item.id}`}
            data-track-category="home_quick_practice"
            className={`group flex flex-col items-center justify-center rounded-2xl border ${item.borderClass} ${item.bgClass} p-3 sm:p-4 text-center shadow-2xs transition-all duration-200 select-none hover:-translate-y-1 hover:shadow-md`}
          >
            {/* Icon Container: 40px (h-10 w-10) on mobile, larger on sm+ */}
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110">
              {isImageIcon(item.iconType) ? (
                <Image
                  src={getIconSrc(item.iconType)}
                  alt={item.title}
                  width={56}
                  height={56}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-2xs sm:scale-[1.3]"
                />
              ) : (
                <div className="flex items-center justify-center sm:scale-[1.3]">
                  {renderIcon(item.iconType)}
                </div>
              )}
            </div>

            {/* Title */}
            <h4 className={`mt-2 sm:mt-2.5 text-xs font-bold tracking-tight sm:text-sm ${item.textClass}`}>
              {item.title}
            </h4>

            {/* Subtitle Description */}
            <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-neutral-500/90">
              {item.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
