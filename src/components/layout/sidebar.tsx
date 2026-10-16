"use client";

import {
  Bookmark,
  BookOpen,
  Compass,
  Download,
  Flame,
  Home,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { LotusLogo } from "@/components/shared/lotus-logo";
import { BOTTOM_NAV_ITEMS, MAIN_NAV_ITEMS, NavItem } from "@/constants/home.constants";
import { FEATURE_FLAG_BACH_THOAI_PHAT_PHAP_WEB_ID } from "@/constants";
import { useGetSettingById } from "@/api/setting";
import { useFavoritesCount } from "@/stores";

interface SidebarProps {
  activeId?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Flame,
  BookOpen,
  Sparkles,
  Compass,
  Search,
  Download,
  Bookmark,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeId = "home",
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const favoritesCount = useFavoritesCount();
  const { data: bachThoaiSetting } = useGetSettingById(
    FEATURE_FLAG_BACH_THOAI_PHAT_PHAP_WEB_ID
  );
  const isBachThoaiEnabled = bachThoaiSetting ? bachThoaiSetting.isEnabled : true;

  const visibleNavItems = MAIN_NAV_ITEMS.filter((item) => {
    if (item.id === "bach-thoai-phat-phap" && !isBachThoaiEnabled) return false;
    return true;
  });

  const renderNavItem = (item: NavItem) => {
    const Icon = ICON_MAP[item.iconName] || Home;
    const isActive = item.id === activeId;
    const isFavoriteNav = item.id === "favorites" || item.id === "bookmarks";

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={onCloseMobile}
        className={`group flex items-center justify-between gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
            ? "bg-[#F3E8D8] font-semibold text-[#9C5812] shadow-xs"
            : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
          }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <Icon
            className={`h-4.5 w-4.5 shrink-0 transition-colors ${isActive ? "text-[#9C5812]" : "text-[#7D7364] group-hover:text-[#9C5812]"
              }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {/* Dynamic Badge for Favorites Count */}
        {isFavoriteNav && favoritesCount > 0 && (
          <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-[#B86E0E] text-[10px] font-bold text-white shadow-2xs">
            {favoritesCount}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      {/* Top Header Logo & Navigation */}
      <div>
        <div className="flex items-center justify-between px-2 pb-6">
          <div className="flex items-center gap-2.5">
            <LotusLogo size={36} />
            <span
              className="text-lg font-bold tracking-wide text-amber-950"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Phật Môn Tâm Linh
            </span>
          </div>

          {/* Close Button on Mobile Drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-1">{visibleNavItems.map((item) => renderNavItem(item))}</nav>
      </div>

      {/* Bottom Secondary Navigation */}
      <div className="border-t border-[#EDE5D8]/80 pt-6">
        <nav className="space-y-1">{BOTTOM_NAV_ITEMS.map((item) => renderNavItem(item))}</nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="sticky top-0 hidden h-screen min-h-screen w-60 shrink-0 flex-col border-r border-[#EDE5D8] bg-[#FBF9F4] select-none lg:flex xl:w-64">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-10 w-72 max-w-[80vw] bg-[#FBF9F4] shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
