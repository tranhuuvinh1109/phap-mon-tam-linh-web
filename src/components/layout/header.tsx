"use client";

import { Bookmark, LogIn, Menu, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { LotusLogo } from "@/components/shared/lotus-logo";
import { RoleEnum } from "@/enums";
import { trackSearch } from "@/lib/gtm";
import { useAuthHydrated, useFavoritesCount, useIsAuthenticated, useUser } from "@/stores";

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
  userName?: string;
  avatarUrl?: string;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onSearch,
}) => {
  const favoritesCount = useFavoritesCount();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const isHydrated = useAuthHydrated();

  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      trackSearch({
        searchTerm: searchValue,
        searchLocation: "header",
      });
    }
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#EDE5D8]/80 bg-[#FAF7F0]/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Mobile Menu Button & Mobile Brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onOpenMobileSidebar}
          data-track-click="open_mobile_sidebar"
          data-track-category="header"
          className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-[#F2EADB]"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href="/"
          title="Trang chủ"
          className="flex items-center transition-transform hover:scale-105"
        >
          <LotusLogo size={30} />
        </Link>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex max-w-xl flex-1 items-center">
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C8274]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm kinh, bài giảng, khai thị..."
            className="w-full rounded-full border border-[#E5DCBE]/80 bg-white/75 py-2 pr-4 pl-10 text-sm text-neutral-800 shadow-2xs transition-all placeholder:text-[#9B9182] focus:border-[#C6892A] focus:bg-white focus:ring-2 focus:ring-[#C6892A]/20 focus:outline-none"
          />
        </div>
      </form>

      {/* Right Actions: Favorites Button & Sign-in / User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Link to Favorites Page */}
        <Link
          href="/yeu-thich"
          data-track-click="header_favorites_link"
          data-track-category="header"
          title="Bài viết đã lưu / Yêu thích"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-[#F0E8D9] hover:text-[#9C5812]"
        >
          <Bookmark className="h-5 w-5" />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-[#B86E0E] text-[10px] font-bold text-white shadow-xs">
              {favoritesCount}
            </span>
          )}
        </Link>

        {/* Sign In Button / User Profile */}
        {mounted && isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            {user.role === RoleEnum.ADMIN && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 shadow-2xs"
              >
                <span>Quản trị</span>
              </Link>
            )}
            <Link
              href={user.role === RoleEnum.ADMIN ? "/admin" : "#"}
              title={user.name || user.email}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-xs font-bold text-white shadow-xs transition hover:scale-105"
            >
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            data-track-click="header_signin_link"
            data-track-category="header"
            title="Đăng nhập tài khoản"
            className="flex h-10 w-10 lg:h-auto lg:w-auto items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 lg:px-4 lg:py-2 text-xs sm:text-sm font-semibold text-white shadow-xs shadow-amber-900/15 transition-all hover:from-amber-700 hover:to-amber-900 active:scale-95 whitespace-nowrap"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden lg:inline">Đăng nhập</span>
          </Link>
        )}
      </div>
    </header>
  );
};
